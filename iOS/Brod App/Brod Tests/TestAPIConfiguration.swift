//
//  TestAPIConfiguration.swift
//  Брод
//
//  Created by Dennis Afanassiev on 20/12/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import Foundation

class LocalRun_NoProxy_HTTP : HouseAPIConfiguration {
    var URL: String { return "http://localhost/API/1.1/" }
    var UseProxy: Bool { return false }
    var ProxyHost: String { return "" }
    var ProxyPort: Int { return 0 }
    var ClientCertificatePassword: String { return "" }
}