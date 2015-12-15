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

enum HouseMode: Int
{
    case Standby = 0
    case Precense = 1
    
    func ToggleMode() -> HouseMode
    {
        switch self
        {
            case HouseMode.Standby:
                return HouseMode.Precense
            case HouseMode.Precense:
                return HouseMode.Standby
        }
    }
    
    func ToInt() -> Int
    {
        switch self
        {
            case HouseMode.Standby:
                return 0
            case HouseMode.Precense:
                return 1
        }
    }
}

struct HouseModeResponce
{
    var outTemp: Float = 0.0
    var inTemp: Float = 0.0
    var presenceMode: HouseMode = HouseMode.Standby
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
                houseMode.presenceMode = isin?.integerValue == 0 ? HouseMode.Standby : HouseMode.Precense
            }
        }
        
        return houseMode
    }
    
    // SetHouseMode REST call
    func SetHouseMode(newMode: HouseMode, completionHandler: (NSError?, HouseModeResponce?) -> Void) -> Void
    {
        let numericNewMode = newMode.ToInt()
        let URL = HouseAPI.userDefaults.stringForKey("SettingsServer")! + "status/SetHouseMode/\(numericNewMode)"
        
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
        if let host = HouseAPI.userDefaults.stringForKey("SettingsServer")
        {
        
            let URL = host + "status/GetHouseStatus"
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
        else
        {
            completionHandler(NSError(domain: "Invalid House API host configuration.", code: 1001, userInfo: nil), nil)
        }
    }
    
    // Return NSURLSessionConfiguration with proxy settings
    private func GetRequestConfiguration() -> NSURLSessionConfiguration
    {
        let configuration = NSURLSessionConfiguration.defaultSessionConfiguration()

        // load proxy configuration
        let proxyAddress = HouseAPI.userDefaults.stringForKey("SettingsProxyAddress")
        let proxyPort = HouseAPI.userDefaults.integerForKey("SettingsProxyPort")
        let useProxy = HouseAPI.userDefaults.boolForKey("SettingsUseProxy")
        
        if (useProxy)
        {
            // proxy configuration to connect via Megafon
            let proxyInfo = [
                "HTTPSEnable" : NSNumber(integer: 1),
                String(kCFStreamPropertyHTTPSProxyHost) : String(proxyAddress ?? ""),
                String(kCFStreamPropertyHTTPSProxyPort) : NSNumber(integer: proxyPort),
            ]
            
            configuration.connectionProxyDictionary = proxyInfo;// as [NSObject : AnyObject]
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

    // Invoke POST method of the API
    private func POST(URL: String, completionHandler: (NSData?, NSURLResponse?, NSError?) -> Void) -> Void
    {
        Invoke(URL, method: HouseAPIMethod.POST, completionHandler: completionHandler)
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
            case HouseAPIMethod.POST:
                request.HTTPMethod = "POST"
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
    case POST
}



