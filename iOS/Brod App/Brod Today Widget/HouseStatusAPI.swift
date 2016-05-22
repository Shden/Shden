//
//  HouseStatusAPI.swift
//  Брод
//
//  Created by Dennis Afanassiev on 20/12/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import Foundation

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

class HouseStatusAPI : HouseAPI {

    // Defalult constructor uses bundle configuration
    override init() {
        super.init()
    }
    
    // For testing purpose, with custom configuration
    override init(config: HouseAPIConfiguration) {
        super.init(config: config)
    }
    
    // JSON decode for HouseModeResponce
    private func getHouseModeResponce(data: NSData) throws -> HouseModeResponce
    {
        var houseMode = HouseModeResponce()
        
        let json: NSDictionary! = try NSJSONSerialization.JSONObjectWithData(data,
            options:NSJSONReadingOptions.MutableContainers) as? NSDictionary
        
        // Get current temperature
        if let climate = json["climate"] as? NSDictionary
        {
            if let outT = climate["outTemp"]
            {
                houseMode.outTemp = outT.floatValue ?? Float.NaN
            }
            if let bedroomT = climate["inTemp"]
            {
                houseMode.inTemp = bedroomT.floatValue ?? Float.NaN
            }
        }
        // Get the presence mode
        if let mode = json["mode"] as? NSDictionary
        {
            if let isin = mode["presence"]
            {
                houseMode.presenceMode = isin.integerValue == 0 ? HouseMode.Standby : HouseMode.Precense
            }
        }
        
        return houseMode
    }
    
    // SetHouseMode REST call
    func SetHouseMode(newMode: HouseMode, completionHandler: (NSError?, HouseModeResponce?) -> Void) -> Void
    {
        let numericNewMode = newMode.ToInt()
        let URL = self.config.URL + "status/SetHouseMode/\(numericNewMode)"
        
        self.PUT(URL, completionHandler: {
            (data, responce, error) -> Void in
            
//            print(data ?? error)
            
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
        let URL = self.config.URL + "status/GetHouseStatus"
        self.GET(URL, completionHandler: {
            (data, response, error) -> Void in
            
//            print(data ?? error)
            
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
}
