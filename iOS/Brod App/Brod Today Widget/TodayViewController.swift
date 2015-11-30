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
        let API = HouseAPI()
        API.GetHouseStatus({
            (error, outTemp, bedroomTemp) -> Void in
        
            if (error != nil)
            {
                let alert = UIAlertController(title: "Error", message: error!.description,
                    preferredStyle: UIAlertControllerStyle.Alert)
                self.presentViewController(alert, animated: true, completion: nil)
            }
            self.insideTemp.text = Formatter.formatTemperature(bedroomTemp)
            self.outsideTemp.text = Formatter.formatTemperature(outTemp)
        })
        self.preferredContentSize = CGSizeMake(0, 60)
    }
}
