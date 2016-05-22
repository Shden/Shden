//
//  HeatingChartController.swift
//  Брод
//  This controller is responsible for temperature chart displaying.
//
//  Created by Dennis Afanassiev on 31/12/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import Foundation
import Charts

class HeatingChartController : UITableViewController {
    
    // Current time span in days to display on the chart
    var timeSpanDays = 1
    
    // Constants:
    // Chart line width
    let LINE_WIDTH = 3.0
    
    @IBOutlet weak var lineChart: LineChartView!
    
    // Days span contol: user selected another segment
    @IBAction func timeSpanChanged(sender: UISegmentedControl) {
        let daysSpanByIndex = [1, 7, 30]
        timeSpanDays = daysSpanByIndex[sender.selectedSegmentIndex]
        self.refreshUserInterface(self)
    }
    
    // Refresh UI and draw temperature chart
    func refreshUserInterface(sender: AnyObject) {

        let API = HeatingAPI()
        
        // Show custom progress indicator only if no standard pull-down wheel is rolling
        var indicator: SDevIndicator? = nil
        if let stdWheel = self.refreshControl {
            if !stdWheel.refreshing {
                indicator = SDevIndicator.generate(self.view)
            }
        }
        
        API.GetTempHistory(timeSpanDays, completionHandler: {
            (error, points) -> Void in

            // stop any progress indication
            self.refreshControl?.endRefreshing()
            indicator?.dismissIndicator()
            
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
                    outTemps.append(ChartDataEntry(value: Double(point.outTemp), xIndex: index))
                    index++
                }
                
                let outTempSeries = LineChartDataSet(yVals: outTemps, label: "Снаружи")
                let inTempSeries = LineChartDataSet(yVals: inTemps, label: "Внутри")
                inTempSeries.setCircleColor(UIColor.orangeColor())
                inTempSeries.setColor(UIColor.orangeColor())
                
                // circles & labels stuff control
                let detailsOn = false
                inTempSeries.drawCirclesEnabled = detailsOn
                inTempSeries.drawCircleHoleEnabled = detailsOn
                outTempSeries.drawCirclesEnabled = detailsOn
                outTempSeries.drawCircleHoleEnabled = detailsOn
                
                // line width
                inTempSeries.lineWidth = CGFloat(self.LINE_WIDTH)
                outTempSeries.lineWidth = CGFloat(self.LINE_WIDTH)
                
                let chartData = LineChartData(xVals: xSeries, dataSets: [inTempSeries, outTempSeries])
                self.lineChart.data = chartData
            }
        })
    }
    
    override func viewDidLoad() {
        
        self.lineChart.descriptionText = "Температурный график"
        self.lineChart.maxVisibleValueCount = 32

        // attach pull-down view refresh handler
        self.refreshControl?.addTarget(self, action: "refreshUserInterface:", forControlEvents: UIControlEvents.ValueChanged)
        self.refreshUserInterface(self)
    }
}