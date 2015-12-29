//
//  DatePickerController.swift
//  Брод
//
//  Created by Dennis Afanassiev on 28/12/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import Foundation
import UIKit

// DatePicker controller to facilitate date and time selection UI usage.
class DatePickerController : UIViewController {
    
    var PickerDate: NSDate?
    var PickerTitle: String?
    var FeedBackDelegate: DateUpdatedDelegate?
    
    override func viewDidLoad() {
        if let pd = PickerDate {
            datePicker.date = pd
        }
        if let pt = PickerTitle {
            navigation.title = pt
        }
    }
    
    @IBOutlet weak var datePicker: UIDatePicker!
    @IBOutlet weak var navigation: UINavigationItem!

    // Date choice confirmed
    @IBAction func OkPressed(sender: AnyObject) {
        PickerDate = datePicker.date
        
        // backward date pass 
        if let dt = PickerDate {
            FeedBackDelegate?.backAndConfirmedDate(dt)
        }
        
        // rewind
        self.navigationController?.popViewControllerAnimated(true)
    }
}