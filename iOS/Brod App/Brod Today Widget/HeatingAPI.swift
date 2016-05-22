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

// Heating historical time series point.
struct HeatingTSPoint {
    var date: NSDate
    var inTemp, outTemp: Float
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
        
        let json: NSDictionary! = try NSJSONSerialization.JSONObjectWithData(data, options: NSJSONReadingOptions.MutableContainers) as? NSDictionary
        
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
    
    // JSON decode for GetTempHistory time series responce
    private func getTempHistoryTS(data: NSData) throws -> [HeatingTSPoint] {
        
        let jsonArray: NSArray! = try NSJSONSerialization.JSONObjectWithData(data, options: NSJSONReadingOptions.MutableContainers) as? NSArray
        
        let dateFormatter = NSDateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZZZZ"
        
        var ts = [HeatingTSPoint](count: jsonArray.count, repeatedValue: HeatingTSPoint(date: NSDate(timeIntervalSince1970: 0), inTemp: 0, outTemp: 0))
        for var i: Int = 0; i < jsonArray.count; ++i {
            if let jsonItem: NSDictionary = jsonArray[i] as? NSDictionary {
                
                if let inTemp = jsonItem["inTemp"]?.floatValue {
                    ts[i].inTemp = inTemp
                }
                
                if let outTemp = jsonItem["outTemp"]?.floatValue {
                    ts[i].outTemp = outTemp
                }
                
                let dateStr = jsonItem["date"] as! String
                if let date = dateFormatter.dateFromString(dateStr) {
                    ts[i].date = date
                }
            }
        }
        return ts
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
                    completionHandler(NSError(domain: "GetSchedule() result decode error", code: 1001, userInfo: nil), nil)
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
                    completionHandler(NSError(domain: "SetSchedule() result decode error", code: 1002, userInfo: nil), nil)
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
                    completionHandler(NSError(domain: "ResetSchedule() result decode error", code: 1003, userInfo: nil), nil)
                }
            }
            else
            {
                completionHandler(error, nil)
            }
        })
    }
    
    // Return heating history hourly for the depth specified.
    func GetTempHistory(days: Int, completionHandler: (NSError?, [HeatingTSPoint]?) -> Void) -> Void {
        let URL = self.config.URL + "heating/GetTempHistory/\(days)"
        self.GET(URL, completionHandler: {
            (data, response, error) -> Void in
            
            if let error = error {
                completionHandler(error, nil)
            }
            
            if let data = data {
                do {
                    let ts = try self.getTempHistoryTS(data)
                    completionHandler(nil, ts)
                }
                catch {
                    completionHandler(NSError(domain: "GetTempHistory() result decode error", code: 1004, userInfo: nil), nil)
                }
            }
        })
    }
}