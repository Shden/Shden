//
//  TodayViewController.swift
//  Brod Today Widget
//
//  Created by Dennis Afanassiev on 25/09/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import UIKit
import NotificationCenter
import ConfidoIOS

struct IdentityAndTrust
{
    var identityRef: SecIdentityRef
    var trust: SecTrustRef
    var certArray: NSArray
}

class TodayViewController: UIViewController, NCWidgetProviding, NSURLSessionDelegate
{
        
    override func viewDidLoad() {
        super.viewDidLoad()
        self.updateInterface()
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func widgetPerformUpdateWithCompletionHandler(completionHandler: ((NCUpdateResult) -> Void)) {
        // Perform any setup necessary in order to update the view.

        // If an error is encountered, use NCUpdateResult.Failed
        // If there's no update required, use NCUpdateResult.NoData
        // If there's an update, use NCUpdateResult.NewData

        completionHandler(NCUpdateResult.NewData)
    }
    
    @IBOutlet weak var insideTemp: UILabel!
    @IBOutlet weak var outsideTemp: UILabel!

    func updateInterface()
    {
        let configuration = NSURLSessionConfiguration.defaultSessionConfiguration()
        let request = NSMutableURLRequest(URL: NSURL(string: "https://shden.info:8081/datasource/temperature.php")!)
        let session = NSURLSession(configuration: configuration, delegate: self, delegateQueue: NSOperationQueue.mainQueue())
        
        // fire off the request & handle the responce
        session.dataTaskWithRequest(request, completionHandler: {
            (data, response, error) -> Void in
            
            print(data ?? error)
            /*do
            {
                let jsonResult: NSDictionary! = try NSJSONSerialization.JSONObjectWithData(data!, options:NSJSONReadingOptions.MutableContainers) as? NSDictionary
                // process jsonResult
                let now: NSDictionary! = jsonResult["now"] as? NSDictionary
                
                let outTemp = now["outTemp"]!.doubleValue
                let bedroomTemp = now["bedRoomTemp"]!.doubleValue
                self.insideLabel.text = NSString(format: "%.01f \u{00B0}C", bedroomTemp) as String
                self.outsideLabel.text = NSString(format: "%.01f \u{00B0}C", outTemp) as String
                }
                catch
                {
                self.insideLabel.text = "--.- \u{00B0}C"
                self.outsideLabel.text = "--.- \u{00B0}C"
            }*/
        }).resume();
    }
    
    // Server challenge responce handling implemented for client certificate authentication
    func URLSession(session: NSURLSession, didReceiveChallenge challenge: NSURLAuthenticationChallenge, completionHandler: (NSURLSessionAuthChallengeDisposition, NSURLCredential?) -> Void)
    {
        print(challenge.protectionSpace.authenticationMethod)
        //assert(challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodClientCertificate);
        if (challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodClientCertificate ||
            challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust)
        {
            let certFile = NSBundle.mainBundle().pathForResource("brod", ofType:"P12")
            
            let p12Data = NSData(contentsOfFile: certFile!)
            
            do
            {
                let ti = try KeychainIdentity.importIdentity(p12Data!, protectedWithPassphrase: "express")

                let urlCredential: NSURLCredential = NSURLCredential(
                    identity: ti.secIdentity,
                    certificates: ti.certificates,
                    persistence: NSURLCredentialPersistence.None)
                
                challenge.sender!.useCredential(urlCredential, forAuthenticationChallenge:challenge)
                completionHandler(NSURLSessionAuthChallengeDisposition.UseCredential, urlCredential)
            }
            catch KeychainError.NoSecIdentityReference
            {
                print("KeychainError.NoSecIdentityReference")
            }
            catch is KeychainStatus
            {
                print("KeychainStatus")
            }
            catch
            {
                print("fatal")
            }
            
        }
    }
    
 
    /*func URLSession(session: NSURLSession, task: NSURLSessionTask, willPerformHTTPRedirection response:
    NSHTTPURLResponse,newRequest request: NSURLRequest, completionHandler: (NSURLRequest!) -> Void)
    {
        let newRequest : NSURLRequest? = request
        print(newRequest?.description);
        completionHandler(newRequest)
    }*/
    
    /*
    func extractIdentity(certData:NSData) -> IdentityAndTrust
    {
        var identityAndTrust: IdentityAndTrust!
        var securityError: OSStatus = errSecSuccess
        var items = UnsafeMutablePointer<CFArray?>.alloc(1)
        let certOptions: CFDictionary = [ kSecImportExportPassphrase as String: "express" ]
        
        // import certificate to read its entries
        securityError = SecPKCS12Import(certData, certOptions, items)
        
        if securityError == errSecSuccess
        {
            let certItems: CFArray? = items.memory;
            let certItemsArray: Array = certItems! as Array
            let dict: AnyObject? = certItemsArray.first
            
            if let certEntry: Dictionary = dict as? Dictionary<String, AnyObject>
            {
                // grab the identity
                let identityPointer: AnyObject? = certEntry["identity"]
                let secIdentityRef: SecIdentityRef = identityPointer as! SecIdentityRef!
                
                // grab the trust
                let trustPointer: AnyObject? = certEntry["trust"]
                let trustRef: SecTrustRef = trustPointer as! SecTrustRef
                
                // grab the cert
                let chainPointer: AnyObject? = certEntry["chain"]
                let certRef: SecCertificateRef = chainPointer as! SecCertificateRef
                var certArray = [unsafeAddressOf(certRef)]
                var arrayCallback = kCFTypeArrayCallBacks
                let index: CFIndex = 1
                let myCerts: CFArrayRef = CFArrayCreate(kCFAllocatorDefault, &certArray, index, &arrayCallback);
                //let certArray = ( certRef )
                //let certArray: CFArrayRef = chainRef as! CFArrayRef
                
                identityAndTrust = IdentityAndTrust(identityRef: secIdentityRef, trust: trustRef, certArray: myCerts)
            }
        }
        return identityAndTrust
    }
*/
}
