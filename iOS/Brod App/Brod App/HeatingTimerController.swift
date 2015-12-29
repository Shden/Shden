//
//  HeatingTimerController.swift
//  Брод
//
//  Created by Dennis Afanassiev on 19/12/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import Foundation
import UIKit

protocol DateUpdatedDelegate {
    func backAndConfirmedDate(date: NSDate);
}

class HeatingTimerController : UITableViewController, DateUpdatedDelegate
{
    enum WhichDateBeingSelected {
        case FromDate
        case ToDate
    }
    
    // UI outlets
    @IBOutlet weak var timerStartRow: UITableViewCell!
    @IBOutlet weak var timerFinishRow: UITableViewCell!
    @IBOutlet weak var startDate: UILabel!
    @IBOutlet weak var endDate: UILabel!
    @IBOutlet weak var timerSwitch: UISwitch!
    @IBOutlet weak var progressIndicator: UIActivityIndicatorView!
    @IBOutlet weak var updateButton: HouseStatusButton!
    
    @IBAction func timerIsActiveChanged(sender: AnyObject) {
        let timerSwitch = sender as! UISwitch
        
        self.timerStartRow.hidden = !timerSwitch.on
        self.timerFinishRow.hidden = !timerSwitch.on
        
        if timerSwitch.on {
            
            WorkingSchedule.from = self.nextWeekendStart()
            WorkingSchedule.to = self.nextWeekendFinish()
            
            self.startDate.text = self.formatDate(self.nextWeekendStart())
            self.endDate.text = self.formatDate(self.nextWeekendFinish())
        }
    }
    
    // User confirmed schedule update
    @IBAction func timerUpdatePressed(sender: AnyObject) {
        let API = HeatingAPI()
        progressIndicator.startAnimating()
        updateButton.enabled = false
        
        // TODO: dates validation (end should be after start etc)
        
        if timerSwitch.on {
            API.SetSchedule(WorkingSchedule, completionHandler: {
                (error, schedule) -> Void in
                
                self.progressIndicator.stopAnimating()
                self.updateButton.enabled = true
                
                if let error = error {
                    self.displayError(error)
                }
                
                if let schedule = schedule {
                    self.updateSchedule(schedule)
                }
            })
        }
        else {
            API.ResetSchedule({
                (error, schedule) -> Void in

                self.progressIndicator.stopAnimating()
                self.updateButton.enabled = true
                
                if let error = error {
                    self.displayError(error)
                }
                
                if let schedule = schedule {
                    self.updateSchedule(schedule)
                }
            })
        }
    }
    
    // This contains the current working version of the heating schedule
    // which is being edited.
    var WorkingSchedule = HeatingSchedule()
    
    var whichDate: WhichDateBeingSelected?
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        if let controller = segue.destinationViewController as? DatePickerController {
            controller.FeedBackDelegate = self
            
            if segue.identifier == "StartDateSegue" {
                controller.PickerDate = WorkingSchedule.from
                controller.PickerTitle = "Когда приедем"
                self.whichDate = WhichDateBeingSelected.FromDate
            }
            else if segue.identifier == "FinishDateSegue" {
                controller.PickerDate = WorkingSchedule.to
                controller.PickerTitle = "Когда уедем"
                self.whichDate = WhichDateBeingSelected.ToDate
            }
        }
    }
    
    func backAndConfirmedDate(date: NSDate) {
        if let wd = whichDate {
            switch wd {
            case WhichDateBeingSelected.FromDate:
                WorkingSchedule.from = date
                self.startDate.text = self.formatDate(WorkingSchedule.from!)
           case WhichDateBeingSelected.ToDate:
                WorkingSchedule.to = date
                self.endDate.text = self.formatDate(WorkingSchedule.to!)
            }
        }
    }
    

    // MARK: date and time helper functions
    
    private func formatDate(date: NSDate) -> String {
        let dateFormatter = NSDateFormatter()
        // Сб, 2 янв, 12.00
        dateFormatter.dateFormat = "E, dd MMM, HH:00"
        return dateFormatter.stringFromDate(date)
    }
    
    private func nextWeekendStart() -> NSDate {
        let calendar = NSCalendar.currentCalendar()
        var nextWeekendStart: NSDate?
        var interval: NSTimeInterval = 0
        assert(calendar.nextWeekendStartDate(&nextWeekendStart, interval: &interval, options: NSCalendarOptions.MatchNextTime, afterDate: NSDate()))
        nextWeekendStart = calendar.nextDateAfterDate(nextWeekendStart!, matchingHour: 12, minute: 0, second: 0, options: .MatchNextTime)
        return nextWeekendStart!
    }
    
    private func nextWeekendFinish() -> NSDate {
        let calendar = NSCalendar.currentCalendar()
        var nextWeekendFinish: NSDate = self.nextWeekendStart()
        nextWeekendFinish = calendar.dateByAddingUnit(NSCalendarUnit.Day, value: 1, toDate: nextWeekendFinish, options: NSCalendarOptions(rawValue: 0))!
        nextWeekendFinish = calendar.nextDateAfterDate(nextWeekendFinish, matchingHour: 21, minute: 0, second: 0, options: NSCalendarOptions.MatchNextTime)!
        return nextWeekendFinish
    }
    
    // MARK: view load control
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // attach pull-down view refresh handler
        self.refreshControl?.addTarget(self, action: "refreshUserInterface:", forControlEvents: UIControlEvents.ValueChanged)
        self.refreshUserInterface(self)
    }
    
    // This method queries the API to obtain the current HeatingSchedule object,
    // then refresh the UI accordingly to the object received.
    func refreshUserInterface(sender: AnyObject) {
        
        self.startDate.text = "запрос расписания..."
        self.endDate.text = "запрос расписания..."
        self.updateButton.enabled = false
        
        let API = HeatingAPI()
        API.GetSchedule { (error, schedule) -> Void in
            
            self.refreshControl?.endRefreshing()
            self.updateButton.enabled = true
            
            if let error = error {
                self.displayError(error)
            }
            else if let schedule = schedule {
                 self.updateSchedule(schedule)
            }
        }
    }
    
    // Schedule updated, reflect this everywhere in the controller and UI
    func updateSchedule(schedule: HeatingSchedule) {
        self.WorkingSchedule = schedule
        
        self.timerSwitch.on = schedule.active
        self.timerStartRow.hidden = !schedule.active
        self.timerFinishRow.hidden = !schedule.active
        
        if (schedule.active && schedule.from != nil && schedule.to != nil) {
            self.startDate.text = self.formatDate(schedule.from!)
            self.endDate.text = self.formatDate(schedule.to!)
        }
        else {
            self.startDate.text = "нет информации"
            self.endDate.text = "нет информации"
            
        }
    }

    // Something goes wrong, display error
    func displayError(error: NSError) {
        self.timerSwitch.on = false
        self.startDate.text = error.localizedDescription
        self.endDate.text = error.localizedDescription
    }
}