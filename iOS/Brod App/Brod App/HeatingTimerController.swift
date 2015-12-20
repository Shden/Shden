//
//  HeatingTimerController.swift
//  Брод
//
//  Created by Dennis Afanassiev on 19/12/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import Foundation
import UIKit

class HeatingTimerController : UITableViewController
{
 
    @IBOutlet weak var timerStartRow: UITableViewCell!
    @IBOutlet weak var timerFinishRow: UITableViewCell!
    @IBOutlet weak var startDate: UILabel!
    @IBOutlet weak var endDate: UILabel!

    @IBAction func timerIsActiveChanged(sender: AnyObject) {
        let timerSwitch = sender as! UISwitch
        
        self.timerStartRow.hidden = !timerSwitch.on
        self.timerFinishRow.hidden = !timerSwitch.on
    }
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        
    }

}