//
//  NetworkTests.swift
//  Брод
//
//  Created by Dennis Afanassiev on 29/12/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import XCTest

class NetworkTests: XCTestCase {
    
    func testReachibilityWiFi() {
        let reach = Reach()
        XCTAssert(reach.connectionStatus() == ReachabilityStatus.Online(ReachabilityType.WiFi))
    }
}
