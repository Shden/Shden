//
//  Configuration.swift
//  Брод
//
//  Created by Dennis Afanassiev on 20/12/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import Foundation
import SystemConfiguration

// API configuration protocol
protocol HouseAPIConfiguration {
    var URL: String { get }
    var UseProxy: Bool { get }
    var ProxyHost: String { get }
    var ProxyPort: Int { get }
    var ClientCertificatePassword: String { get }
}

// Bundle settings based configuration
class BundleConfig: HouseAPIConfiguration {
    private static var userDefaults = NSUserDefaults.init()
    
    var URL: String { return BundleConfig.userDefaults.stringForKey("SettingsServer") ?? "" }
    var UseProxy: Bool { return BundleConfig.userDefaults.boolForKey("SettingsUseProxy") }
    var ProxyHost: String { return BundleConfig.userDefaults.stringForKey("SettingsProxyAddress") ?? "" }
    var ProxyPort: Int { return BundleConfig.userDefaults.integerForKey("SettingsProxyPort") }
    var ClientCertificatePassword: String { return BundleConfig.userDefaults.stringForKey("SettingsCertPassword") ?? "" }
}