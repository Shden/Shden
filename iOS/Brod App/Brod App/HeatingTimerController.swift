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
    @IBOutlet weak var timerSwitch: UISwitch!
    
    @IBAction func timerIsActiveChanged(sender: AnyObject) {
        let timerSwitch = sender as! UISwitch
        
        self.timerStartRow.hidden = !timerSwitch.on
        self.timerFinishRow.hidden = !timerSwitch.on
    }
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.refreshControl?.addTarget(self, action: "refreshUserInterface:", forControlEvents: UIControlEvents.ValueChanged)
        self.refreshUserInterface(self)
    }
    
    func refreshUserInterface(sender: AnyObject) {
        
        self.startDate.text = "запрос расписания..."
        self.endDate.text = "запрос расписания..."
        
        let API = HeatingAPI()
        API.GetSchedule { (error, schedule) -> Void in
            
            self.refreshControl?.endRefreshing()
            if let error = error {
                self.timerSwitch.on = false
            }
            else if let schedule = schedule {
                self.timerSwitch.on = schedule.active
                
                if (schedule.active && schedule.from != nil && schedule.to != nil) {
                    let dateFormatter = NSDateFormatter()
                    dateFormatter.dateFormat = "dd-MMM-yyyy hh:00"
                    self.startDate.text = dateFormatter.stringFromDate(schedule.from!)
                    self.endDate.text = dateFormatter.stringFromDate(schedule.to!)
                }
                else {
                    self.startDate.text = "нет информации"
                    self.endDate.text = "нет информации"
                   
                }
            }
        }
    }

}