//
//  HeatingChartController.swift
//  Брод
//
//  Created by Dennis Afanassiev on 31/12/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import Foundation
import Charts

class HeatingChartController : UIViewController {
    
    @IBOutlet weak var lineChart: LineChartView!
    
    override func viewDidLoad() {
        
        let xSeries: [String?] = [ "5", "10", "15", "200" ]
        let y: [ChartDataEntry] = [
            ChartDataEntry(value: 0, xIndex: 0),
            ChartDataEntry(value: 1, xIndex: 1),
            ChartDataEntry(value: 2, xIndex: 2),
            ChartDataEntry(value: 3, xIndex: 3)]
        let set1 = LineChartDataSet(yVals: y)
        
        let dataset: [LineChartDataSet] = [set1]
        
        let data = LineChartData(xVals: xSeries, dataSets: dataset)
        
        lineChart.data = data
        
    }
}