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
    var config: HouseAPIConfiguration
    
    // Defalult constructor uses bundle configuration
    override init() {
        self.config = BundleConfig()
        super.init()
    }
    
    // For testing purpose, with custom configuration
    init(config: HouseAPIConfiguration) {
        self.config = config
        super.init()
    }
    
    // Return NSURLSessionConfiguration with proxy settings
    private func GetRequestConfiguration() -> NSURLSessionConfiguration
    {
        let configuration = NSURLSessionConfiguration.defaultSessionConfiguration()

        // load proxy configuration
        let proxyAddress = self.config.ProxyHost
        let proxyPort = self.config.ProxyPort
        let useProxy = self.config.UseProxy
        
        if (useProxy)
        {
            // proxy configuration to connect via Megafon
            let proxyInfo = [
                "HTTPSEnable" : NSNumber(integer: 1),
                String(kCFStreamPropertyHTTPSProxyHost) : String(proxyAddress),
                String(kCFStreamPropertyHTTPSProxyPort) : NSNumber(integer: proxyPort),
            ]
            
            configuration.connectionProxyDictionary = proxyInfo;// as [NSObject : AnyObject]
        }

        return configuration
    }
    
    // Invoke GET method of the API
    func GET(URL: String, completionHandler: (NSData?, NSURLResponse?, NSError?) -> Void) -> Void
    {
        Invoke(URL, method: HouseAPIMethod.GET, completionHandler: completionHandler)
    }

    // Invoke PUT method of the API
    func PUT(URL: String, completionHandler: (NSData?, NSURLResponse?, NSError?) -> Void) -> Void
    {
        Invoke(URL, method: HouseAPIMethod.PUT, completionHandler: completionHandler)
    }

    // Invoke POST method of the API
    func POST(URL: String, completionHandler: (NSData?, NSURLResponse?, NSError?) -> Void) -> Void
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
            let certificatePassword = self.config.ClientCertificatePassword
            let identityAndTrust:IdentityAndTrust = extractIdentity(p12Data!, certPassword: certificatePassword)
            
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



