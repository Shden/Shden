//
//  HeatingChartController.swift
//  Брод
//
//  Created by Dennis Afanassiev on 31/12/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import Foundation
import Charts

//class LocalRun_NoProxy_HTTP : HouseAPIConfiguration {
//    var URL: String { return "http://localhost/API/1.1/" }
//    var UseProxy: Bool { return false }
//    var ProxyHost: String { return "" }
//    var ProxyPort: Int { return 0 }
//    var ClientCertificatePassword: String { return "" }
//}

class HeatingChartController : UITableViewController {
    
    // Current time span in days to display on the chart
    var timeSpanDays = 1
    
    // Constants:
    // Chart will have circles around points unless displayed days number is less then
    let MAX_CIRCLE_DAYS = 2
    
    // Chart line width
    let LINE_WIDTH = 3.0
    
    @IBOutlet weak var lineChart: LineChartView!
    
    // Days span contol: user selected another segment
    @IBAction func timeSpanChanged(sender: UISegmentedControl) {
        let daysSpanByIndex = [1, 7, 40]
        timeSpanDays = daysSpanByIndex[sender.selectedSegmentIndex]
        self.refreshUserInterface(self)
    }
    
    // Refresh UI and draw temperature chart
    func refreshUserInterface(sender: AnyObject) {

//        let API = HeatingAPI(config: LocalRun_NoProxy_HTTP())
        let API = HeatingAPI()
        API.GetTempHistory(timeSpanDays, completionHandler: {
            (error, points) -> Void in
            
            self.refreshControl?.endRefreshing()
            
            if let points = points {
                
                var outTemps: [ChartDataEntry] = []
                var inTemps: [ChartDataEntry] = []
                var xSeries: [String?] = []
                var index: Int = 0
                let dateFormatter = NSDateFormatter()
                dateFormatter.dateFormat = (self.timeSpanDays <= 1) ? "HH:mm" : "d MMM HH:mm"
                
                for point in points {
                    xSeries.append(dateFormatter.stringFromDate(point.date))
                    inTemps.append(ChartDataEntry(value: Double(point.inTemp), xIndex: index))
                    outTemps.append(ChartDataEntry(value: Double(point.outTemp), xIndex: index++))
                }
                
                let outTempSeries = LineChartDataSet(yVals: outTemps, label: "Снаружи")
                let inTempSeries = LineChartDataSet(yVals: inTemps, label: "Внутри")
                inTempSeries.setCircleColor(UIColor.orangeColor())
                inTempSeries.setColor(UIColor.orangeColor())
                
                // circles stuff control
                let circlesOn = self.timeSpanDays <= self.MAX_CIRCLE_DAYS
                inTempSeries.drawCirclesEnabled = circlesOn
                inTempSeries.drawCircleHoleEnabled = circlesOn
                outTempSeries.drawCirclesEnabled = circlesOn
                outTempSeries.drawCircleHoleEnabled = circlesOn
                
                // line width
                inTempSeries.lineWidth = CGFloat(self.LINE_WIDTH)
                outTempSeries.lineWidth = CGFloat(self.LINE_WIDTH)
                
                let chartData = LineChartData(xVals: xSeries, dataSets: [inTempSeries, outTempSeries])
                self.lineChart.descriptionText = "Температурный график"
                self.lineChart.data = chartData
            }
        })
    }
    
    override func viewDidLoad() {
        
        // attach pull-down view refresh handler
        self.refreshControl?.addTarget(self, action: "refreshUserInterface:", forControlEvents: UIControlEvents.ValueChanged)
        self.refreshUserInterface(self)
    }
}