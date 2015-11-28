//
//  Formatter.swift
//  Brod App
//
//  Created by Dennis Afanassiev on 28/11/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import Foundation

class Formatter
{
    // Temperature formatting
    static func formatTemperature(temp: Double?) -> String
    {
        if let t = temp
        {
            return (t > 0)
                ? NSString(format: "+%.01f \u{00B0}C", t) as String
                : NSString(format: "%.01f \u{00B0}C", t) as String
        }
        else
        {
            return "--.- \u{00B0}C";
        }
    }
}