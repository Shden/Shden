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

struct HouseModeResponce {
    var outTemp: Float = 0.0
    var inTemp: Float = 0.0
    var presenceMode = 0
}

class HouseAPI : NSObject, NSURLSessionDelegate
{
    private static var userDefaults = NSUserDefaults.init()

    // JSON decode for HouseModeResponce
    private func getHouseModeResponce(data: NSData) throws -> HouseModeResponce
    {
        var houseMode = HouseModeResponce()
        
        let json: NSDictionary! = try NSJSONSerialization.JSONObjectWithData(data,
            options:NSJSONReadingOptions.MutableContainers) as? NSDictionary
        
        // Get current temperature
        if let climate = json["climate"]
        {
            if let outT = climate["outTemp"]
            {
                houseMode.outTemp = outT?.floatValue ?? Float.NaN
            }
            if let bedroomT = climate["inTemp"]
            {
                houseMode.inTemp = bedroomT?.floatValue ?? Float.NaN
            }
        }
        // Get the presence mode
        if let mode = json["mode"]
        {
            if let isin = mode["presence"]
            {
                houseMode.presenceMode = isin?.integerValue ?? -1
            }
        }
        
        return houseMode
    }
    
    // SetHouseMode REST call
    func SetHouseMode(newMode: Int, completionHandler: (NSError?, HouseModeResponce?) -> Void) -> Void
    {
        let URL = HouseAPI.userDefaults.stringForKey("SettingsServer")! + "status/SetHouseMode/\(newMode)"
        self.PUT(URL, completionHandler: {
            (data, responce, error) -> Void in
            
            print(data ?? error)
            
            if (error == nil && data != nil)
            {
                do
                {
                    let houseMode = try self.getHouseModeResponce(data!)
                    completionHandler(nil, houseMode)
                }
                catch
                {
                    completionHandler(error as NSError?, nil)
                }
            }
            else
            {
                completionHandler(error, nil)
            }
        })
    }
    
    // GetHouseStatus REST call
    func GetHouseStatus(completionHandler: (NSError?, HouseModeResponce?) -> Void) -> Void
    {
        let URL = HouseAPI.userDefaults.stringForKey("SettingsServer")! + "status/GetHouseStatus"
        
        self.GET(URL, completionHandler: {
            (data, response, error) -> Void in
            
            print(data ?? error)

            if (error == nil && data != nil)
            {
                do
                {
                    let houseMode = try self.getHouseModeResponce(data!)
                    completionHandler(nil, houseMode)
                }
                catch
                {
                    completionHandler(error as NSError?, nil)
                }
            }
            else
            {
                completionHandler(error, nil)
            }
        })
    }
    
    // Return NSURLSessionConfiguration with proxy settings
    private func GetRequestConfiguration() -> NSURLSessionConfiguration
    {
        let configuration = NSURLSessionConfiguration.defaultSessionConfiguration()

        // load proxy configuration
        let proxyAddress = HouseAPI.userDefaults.stringForKey("SettingsProxyAddress")
        let proxyPort = HouseAPI.userDefaults.stringForKey("SettingsProxyPort")
        let useProxy = HouseAPI.userDefaults.boolForKey("SettingsUseProxy")
        
        if (useProxy && proxyAddress != nil)
        {
            // proxy configuration to connect via Megafon
            let proxyInfo:[NSString: NSString] = [
                kCFStreamPropertyHTTPSProxyHost : proxyAddress ?? "",
                kCFStreamPropertyHTTPSProxyPort : "8080", //proxyPort ?? "",
                "HTTPSEnable" : "1",
                kCFProxyTypeKey : kCFProxyTypeHTTPS
                //kCFNetworkProxiesHTTPProxy as NSString : "152.2.81.209" as NSString,
                //kCFNetworkProxiesHTTPPort : 8080,
                //kCFNetworkProxiesHTTPEnable : true
            ]
            
            configuration.connectionProxyDictionary = proxyInfo
        }

        return configuration
    }
    
    // Invoke GET method of the API
    private func GET(URL: String, completionHandler: (NSData?, NSURLResponse?, NSError?) -> Void) -> Void
    {
        Invoke(URL, method: HouseAPIMethod.GET, completionHandler: completionHandler)
    }

    // Invoke PUT method of the API
    private func PUT(URL: String, completionHandler: (NSData?, NSURLResponse?, NSError?) -> Void) -> Void
    {
        Invoke(URL, method: HouseAPIMethod.PUT, completionHandler: completionHandler)
    }

    // Invoke selected method of the API
    private func Invoke(URL: String, method: HouseAPIMethod,
        completionHandler: (NSData?, NSURLResponse?, NSError?) -> Void) -> Void
    {
        let request = NSMutableURLRequest(URL: NSURL(string: URL)!)

        switch method
        {
            case HouseAPIMethod.PUT:
                request.HTTPMethod = "PUT"
            case HouseAPIMethod.GET:
                request.HTTPMethod = "GET"
        }
        
        let requestConfig = GetRequestConfiguration()
        let session = NSURLSession(configuration: requestConfig, delegate: self, delegateQueue: NSOperationQueue.mainQueue())
        
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

enum HouseAPIMethod
{
    case GET
    case PUT
}

