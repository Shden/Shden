//
//  LightingAPI.swift
//  Брод
//  Swift interface over Lighting REST API.
//
//  Created by Dennis Afanassiev on 13/02/16.
//  Copyright © 2016 Dennis Afanassiev. All rights reserved.
//

import Foundation


class LightingAPI: HouseAPI {
    
    // Defalult constructor uses bundle configuration
    override init() {
        super.init()
    }
    
    // For testing purpose, with custom configuration
    override init(config: HouseAPIConfiguration) {
        super.init(config: config)
    }
    
    // Responce data decode.
    private func getStatusResponce(data: NSData) throws -> NSDictionary? {
        return try NSJSONSerialization.JSONObjectWithData(data,
            options:NSJSONReadingOptions.MutableContainers) as? NSDictionary
    }
    
    // Returns lighting status for all appliances connected to the system.
    func GetStatus(completionHandler: (NSError?, NSDictionary?) -> Void) -> Void {
        let URL = self.config.URL + "lighting/GetStatus"
        self.GET(URL, completionHandler: {
            (data, response, error) -> Void in
            
            if (error == nil && data != nil)
            {
                do
                {
                    let schedule = try self.getStatusResponce(data!)
                    completionHandler(nil, schedule)
                }
                catch
                {
                    completionHandler(NSError(domain: "GetStatus() result decode error", code: 1050, userInfo: nil), nil)
                }
            }
            else
            {
                completionHandler(error, nil)
            }
        })       
    }
    
    // Update specific appliance status.
    func ChangeStatus(applianceName: String, newStatus: Int,
        completionHandler: (NSError?, NSDictionary?) -> Void) -> Void {
        let URL = self.config.URL + "lighting/ChangeStatus/\(applianceName)/\(newStatus)"
        self.PUT(URL, completionHandler: {
            (data, response, error) -> Void in
            
            if (error == nil && data != nil)
            {
                do
                {
                    let schedule = try self.getStatusResponce(data!)
                    completionHandler(nil, schedule)
                }
                catch
                {
                    completionHandler(NSError(domain: "ChangeStatus() result decode error", code: 1051, userInfo: nil), nil)
                }
            }
            else
            {
                completionHandler(error, nil)
            }
        })
    }
}