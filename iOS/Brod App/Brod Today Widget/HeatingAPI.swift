//
//  HeatingAPI.swift
//  Брод
//
//  Created by Dennis Afanassiev on 27/12/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import Foundation

// HeatingSchedule struct is a container to transport schedule information
// between HeatingAPI swift wrapper and the API client.
struct HeatingSchedule {
    var from, to: NSDate?
    var active: Bool = false
}

class HeatingAPI : HouseAPI {
    
    // Defalult constructor uses bundle configuration
    override init() {
        super.init()
    }
    
    // For testing purpose, with custom configuration
    override init(config: HouseAPIConfiguration) {
        super.init(config: config)
    }
    
    // Convert ISO8601 date and time string to NSDate
    private func iso8601StringToNSDate(iso8601String: String) -> NSDate? {
        let dateFormatter = NSDateFormatter()
        dateFormatter.locale = NSLocale(localeIdentifier: "en_US_POSIX")
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZZZZ"
        return dateFormatter.dateFromString(iso8601String)
    }
    
    // JSON decode for ScheduleResponce
    private func getScheduleResponce(data: NSData) throws -> HeatingSchedule
    {
        var schedule = HeatingSchedule()
        
        let json: NSDictionary! = try NSJSONSerialization.JSONObjectWithData(data,
            options:NSJSONReadingOptions.MutableContainers) as? NSDictionary
        
        // field by field maped load from json to the structure
        if let from = json["from"] {
            schedule.from = iso8601StringToNSDate(from as! String)
        }
        
        if let to = json["to"] {
            schedule.to = iso8601StringToNSDate(to as! String)
        }
        
        if let active = json["active"] {
            schedule.active = active.integerValue == 1
        }
        
        return schedule
    }
    
    // MARK: Schedule
    
    // Retrieve the current heating schedule
    func GetSchedule(completionHandler: (NSError?, HeatingSchedule?) -> Void) -> Void {
        let URL = self.config.URL + "heating/GetSchedule"
        self.GET(URL, completionHandler: {
            (data, response, error) -> Void in
            
            if (error == nil && data != nil)
            {
                do
                {
                    let schedule = try self.getScheduleResponce(data!)
                    completionHandler(nil, schedule)
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
    
    // Convert NSDate to URL segments using the pattern: /year/month/day/hour
    private func dateToURL(date: NSDate?) -> String {
        let calendar = NSCalendar.currentCalendar()
        let dt = date ?? NSDate(timeIntervalSince1970: 0.0)
        let dtComp = calendar.components([.Year, .Month, .Day, .Hour], fromDate: dt)
        return "/\(dtComp.year)/\(dtComp.month)/\(dtComp.day)/\(dtComp.hour)"
    }
    
    // Set heating schedule
    func SetSchedule(schedule: HeatingSchedule, completionHandler: (NSError?, HeatingSchedule?) -> Void) {
        let URL = self.config.URL + "heating/SetSchedule\(self.dateToURL(schedule.from))\(self.dateToURL(schedule.to))"
        self.PUT(URL, completionHandler: {
            (data, response, error) -> Void in
            
            if (error == nil && (response as! NSHTTPURLResponse).statusCode == 200 && data != nil)
            {
                do
                {
                    let schedule = try self.getScheduleResponce(data!)
                    completionHandler(nil, schedule)
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
    
    // Deactivate heating schedule
    func ResetSchedule(completionHandler: (NSError?, HeatingSchedule?) -> Void) {
        let URL = self.config.URL + "heating/ResetSchedule"
        self.PUT(URL, completionHandler: {
            (data, response, error) -> Void in
            
            if (error == nil && data != nil)
            {
                do
                {
                    let schedule = try self.getScheduleResponce(data!)
                    completionHandler(nil, schedule)
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
}