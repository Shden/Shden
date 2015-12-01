//
//  HouseAPI.swift
//  Brod App
//  HouseAPI is the class encapsulating Brod API requesting functionality.
//
//  Created by Dennis Afanassiev on 27/11/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import Foundation
import SystemConfiguration

class HouseAPI : NSObject, NSURLSessionDelegate
{
    private static var userDefaults = NSUserDefaults.init()
    
    // Get house status API call 
    func GetHouseStatus(completionHandler:(NSError?, Double?, Double?) -> Void) -> Void
    {
        let URL = HouseAPI.userDefaults.stringForKey("SettingsServer")! + "Status/GetHouseStatus"
        
        self.RequestAPI(URL, completionHandler: {
            (data, response, error) -> Void in
            
            print(data ?? error)
            do
            {
                var outTemp, bedroomTemp: Double?
                
                if (error == nil)
                {
                    let jsonResult: NSDictionary! = try NSJSONSerialization.JSONObjectWithData(data!, options:NSJSONReadingOptions.MutableContainers) as? NSDictionary
                    
                    if let json = jsonResult
                    {
                        if let now = json["climate"]
                        {
                            if let outT = now["outTemp"]
                            {
                                outTemp = outT?.doubleValue
                            }
                            if let bedroomT = now["bedRoomTemp"]
                            {
                                bedroomTemp = bedroomT?.doubleValue
                            }
                        }
                    }
                }
                
                completionHandler(error, outTemp, bedroomTemp)
            }
            catch
            {
                completionHandler(error as NSError?, nil, nil)
            }
        })
    }
    
    // Internal gate to all API methods
    private func RequestAPI(URL: String, completionHandler: (NSData?, NSURLResponse?, NSError?) -> Void) -> Void
    {
        let configuration = NSURLSessionConfiguration.defaultSessionConfiguration()
 
        // load proxy configuration
        let proxyAddress = HouseAPI.userDefaults.stringForKey("SettingsProxyAddress")
        let proxyPort = HouseAPI.userDefaults.stringForKey("SettingsProxyPort")
        if (proxyAddress != nil && proxyPort != nil)
        {
            // proxy configuration to connect via Megafon
            let proxyInfo = [
                kCFStreamPropertyHTTPSProxyHost : proxyAddress! as NSString,
                kCFStreamPropertyHTTPSProxyPort : Int(proxyPort!)!,
                "HTTPSEnable" as NSString : true
                //kCFNetworkProxiesHTTPProxy as NSString : "152.2.81.209" as NSString,
                //kCFNetworkProxiesHTTPPort : 8080,
                //kCFNetworkProxiesHTTPEnable : true
            ]
            
            configuration.connectionProxyDictionary = proxyInfo
        }
        
        let request = NSMutableURLRequest(URL: NSURL(string: URL)!)
        let session = NSURLSession(configuration: configuration, delegate: self, delegateQueue: NSOperationQueue.mainQueue())
        
        // fire off the request & route the responce to the completion handler
        session.dataTaskWithRequest(request, completionHandler: completionHandler).resume();
    }

    private func extractIdentity(certData: NSData, certPassword: String) -> IdentityAndTrust
    {
        var identityAndTrust:IdentityAndTrust!
        var securityError:OSStatus = errSecSuccess
        
        var items: CFArray?
        let certOptions:CFDictionary = [ kSecImportExportPassphrase as String: certPassword ];
        
        // import certificate to read its entries
        securityError = SecPKCS12Import(certData, certOptions, &items);
        
        if securityError == errSecSuccess
        {
            let certItems:CFArray = items as CFArray!;
            let certItemsArray:Array = certItems as Array!
            let dict:AnyObject? = certItemsArray.first;
            
            if let certEntry:Dictionary = dict as? Dictionary<String, AnyObject>
            {
                
                // grab the identity
                let identityPointer:AnyObject? = certEntry["identity"];
                let secIdentityRef:SecIdentityRef = identityPointer as! SecIdentityRef!;
                
                // grab the trust
                let trustPointer:AnyObject? = certEntry["trust"];
                let trustRef:SecTrustRef = trustPointer as! SecTrustRef;
                
                // grab the certificate chain
                var certRef: SecCertificate?
                SecIdentityCopyCertificate(secIdentityRef, &certRef);
                let certArray:NSMutableArray = NSMutableArray();
                certArray.addObject(certRef as SecCertificateRef!);
                
                identityAndTrust = IdentityAndTrust(identityRef: secIdentityRef, trust: trustRef, certArray: certArray);
            }
        }
        return identityAndTrust;
    }
    
    // Server challenge responce handling implemented for client certificate authentication
    func URLSession(session: NSURLSession, didReceiveChallenge challenge: NSURLAuthenticationChallenge,
        completionHandler: (NSURLSessionAuthChallengeDisposition, NSURLCredential?) -> Void)
    {
        print(challenge.protectionSpace.authenticationMethod)
        if (challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust ||
            challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodClientCertificate)
        {
            let certFile = NSBundle.mainBundle().pathForResource("brod", ofType:"P12")
            let p12Data = NSData(contentsOfFile: certFile!)
            let certificatePassword = HouseAPI.userDefaults.stringForKey("SettingsCertPassword")
            let identityAndTrust:IdentityAndTrust = extractIdentity(p12Data!, certPassword: certificatePassword!)
            
            let urlCredential: NSURLCredential = NSURLCredential(
                identity: identityAndTrust.identityRef,
                certificates: identityAndTrust.certArray as [AnyObject],
                persistence: NSURLCredentialPersistence.Permanent)
            
            challenge.sender!.useCredential(urlCredential, forAuthenticationChallenge:challenge)
            completionHandler(NSURLSessionAuthChallengeDisposition.UseCredential, urlCredential)
        }
    }
}

struct IdentityAndTrust
{
    var identityRef: SecIdentityRef
    var trust: SecTrustRef
    var certArray: NSArray
}

