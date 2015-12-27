//
//  APILocalTests.swift
//  Брод
//
//  Created by Dennis Afanassiev on 20/12/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//
import UIKit
import XCTest


class APILocalTests: XCTestCase {

    let houseStatusAPI = HouseStatusAPI(config: LocalRun_NoProxy_HTTP())
    let heatingAPI = HeatingAPI(config: LocalRun_NoProxy_HTTP())
    
//    override func setUp() {
//        super.setUp()
//        // Put setup code here. This method is called before the invocation of each test method in the class.
//    }
//    
//    override func tearDown() {
//        // Put teardown code here. This method is called after the invocation of each test method in the class.
//        super.tearDown()
//    }

    func testGetHouseStatus() {
        let expectation = expectationWithDescription("GetHouseStatus() request will have to be completed")

        self.houseStatusAPI.GetHouseStatus { (error, responce) -> Void in
            XCTAssert(error == nil)
            XCTAssert(responce != nil)
            if let responce = responce {
                XCTAssertGreaterThanOrEqual(responce.inTemp, 0.0)
                XCTAssertLessThan(responce.inTemp, 40.0)
                XCTAssertGreaterThan(responce.outTemp, -50.0)
                XCTAssertLessThan(responce.outTemp, +50.0)
                expectation.fulfill()
            }
        }
        
        // This will make XCTest wait for up to 10 seconds,
        // giving your request expectation time to fulfill
        waitForExpectationsWithTimeout(10) { (error) -> Void in
            if let error = error {
                XCTFail("Error: \(error.localizedDescription)")
            }
        }
    }
    
    func testSetHouseModeToPrecence() {
        
        let expectation = expectationWithDescription("SetHouseMode(HouseMode.Precense) request will have to be done")

        // To precense mode
        self.houseStatusAPI.SetHouseMode(HouseMode.Precense, completionHandler:
        {
            (error, responce) -> Void in
            XCTAssert(error == nil)
            XCTAssert(responce != nil)
            if let responce = responce {
                XCTAssert(responce.presenceMode == HouseMode.Precense)
                expectation.fulfill()
            }
        })

        waitForExpectationsWithTimeout(10, handler: nil)
    }
    
    func testSetHouseModeToStandby() {

        let expectation = expectationWithDescription("SetHouseMode(HouseMode.Standby) request will have to be done")

        // To standby mode
        self.houseStatusAPI.SetHouseMode(HouseMode.Standby, completionHandler:
            {
                (error, responce) -> Void in
                XCTAssert(error == nil)
                XCTAssert(responce != nil)
                if let responce = responce {
                    XCTAssert(responce.presenceMode == HouseMode.Standby)
                    expectation.fulfill()
                }
        })
        waitForExpectationsWithTimeout(10, handler: nil)
    }
    
    // MARK: Heating schedule
    func testGetHeatingSchedule() {
        
        let expectation = expectationWithDescription("GetSchedule() request will be done in less than 10 seconds.")
        
        // Trying to get current heating schedule
        self.heatingAPI.GetSchedule({
            (error, schedule) -> Void in
            XCTAssert(error == nil)
            XCTAssert(schedule != nil)
            expectation.fulfill()
        })
        waitForExpectationsWithTimeout(10, handler: nil)
    }

    func testResetHeatingSchedule() {
        
        let expectation = expectationWithDescription("ResetSchedule() request will be done in less than 10 seconds.")
        
        // Trying to get current heating schedule
        self.heatingAPI.ResetSchedule({
            (error, schedule) -> Void in
            XCTAssert(error == nil)
            XCTAssert(schedule != nil)
            expectation.fulfill()
        })
        waitForExpectationsWithTimeout(10, handler: nil)
    }
    
    func testSetValidHeatingSchedule() {
        
        let expectation = expectationWithDescription("SetSchedule() request will be done in less than 10 seconds.")
        let validSchedule = HeatingSchedule(from: NSDate(timeIntervalSinceNow: 0.0), to: NSDate(timeIntervalSinceNow: 0.0), active: false)
        
        // Trying to get current heating schedule
        self.heatingAPI.SetSchedule(validSchedule, completionHandler: {
            (error, schedule) -> Void in
            XCTAssert(error == nil)
            XCTAssert(schedule != nil)
            expectation.fulfill()
        })
        waitForExpectationsWithTimeout(10, handler: nil)
    }
    
//    func testPerformanceExample() {
//        // This is an example of a performance test case.
//        self.measureBlock {
//            // Put the code you want to measure the time of here.
//        }
//    }

}
