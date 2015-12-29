//
//  TodayViewController.swift
//  Brod Today Widget
//
//  Created by Dennis Afanassiev on 25/09/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import UIKit
import NotificationCenter

class TodayViewController: UIViewController, NCWidgetProviding, NSURLSessionDelegate
{
    override func viewDidLoad()
    {
        super.viewDidLoad()
        self.updateInterface()
    }
    
    override func viewDidAppear(animated: Bool)
    {
        super.viewDidAppear(animated)
        self.updateInterface()
    }
    
    override func didReceiveMemoryWarning()
    {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    // The fantom button without a caption is plased all over the view to
    // handle touch event. Touch event will run the containing application.
    @IBAction func buttonPressed(sender: AnyObject) {
        if let url = NSURL(string: "brodapp://home") {
            self.extensionContext?.openURL(url, completionHandler: nil)
        }
    }
    
    func widgetPerformUpdateWithCompletionHandler(completionHandler: ((NCUpdateResult) -> Void))
    {
        // Perform any setup necessary in order to update the view.

        // If an error is encountered, use NCUpdateResult.Failed
        // If there's no update required, use NCUpdateResult.NoData
        // If there's an update, use NCUpdateResult.NewData

        completionHandler(NCUpdateResult.NewData)
    }
    
    @IBOutlet weak var insideTemp: UILabel!
    @IBOutlet weak var outsideTemp: UILabel!
    
    func updateInterface() -> Void
    {
        let configuration = TodayConfiguration()
        let API = HouseStatusAPI(config: configuration)
        API.GetHouseStatus({
            (error, houseMode) -> Void in
        
            if (error != nil)
            {
                let alert = UIAlertController(title: "Error", message: error!.description,
                    preferredStyle: UIAlertControllerStyle.Alert)
                self.presentViewController(alert, animated: true, completion: nil)
                return
            }
            
            self.insideTemp.text = Formatter.formatTemperature(houseMode!.inTemp)
            self.outsideTemp.text = Formatter.formatTemperature(houseMode!.outTemp)
        })
        self.preferredContentSize = CGSizeMake(0, 60)
    }
}
