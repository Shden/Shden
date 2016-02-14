//
//  LightingController.swift
//  Брод
//
//  Created by Dennis Afanassiev on 13/02/16.
//  Copyright © 2016 Dennis Afanassiev. All rights reserved.
//

import Foundation
import UIKit

class LightingContoller: UITableViewController {

    @IBOutlet weak var streetLight250: UISwitch!
    @IBOutlet weak var streetLight150: UISwitch!
    @IBOutlet weak var balkonLight: UISwitch!
    
    let streetLight250Name = "streetLight250"
    let streetLight150Name = "streetLight150"
    let balkonLightName = "balkonLight"
    
    // Refresh UI and update switches
    func refreshUserInterface(sender: AnyObject) {
        
        let API = LightingAPI()
        self.enableUI(false)

        API.GetStatus({
            (error, dict) -> Void in
            
            // stop any progress indication
            self.refreshControl?.endRefreshing()
            
            self.updateSwitches(dict)
            self.enableUI(true)
        })
    }

    override func viewDidLoad() {
        
        // attach pull-down view refresh handler
        self.refreshControl?.addTarget(self, action: "refreshUserInterface:", forControlEvents: UIControlEvents.ValueChanged)
        self.refreshUserInterface(self)
    }
    
    private func updateSwitches(dict: NSDictionary?) -> Void {
        
        if let dict = dict {
            
            self.streetLight250.on = dict[self.streetLight250Name]?.integerValue == 1
            self.streetLight150.on = dict[self.streetLight150Name]?.integerValue == 1
            self.balkonLight.on = dict[self.balkonLightName]?.integerValue == 1
        }
    }
    
    // Enable/disable UI conrol while refereshing
    private func enableUI(enable: Bool) -> Void {
        self.streetLight150.enabled = enable
        self.streetLight250.enabled = enable
        self.balkonLight.enabled = enable
    }
    
    // Switch changed
    @IBAction func switchChanged(sender: AnyObject) {
        
        if let sw = sender as? UISwitch {
            
            var applianceName: String?
        
            switch sw {
                
            case streetLight250:
                applianceName = self.streetLight250Name
                
            case streetLight150:
                applianceName = self.streetLight150Name
                
            case balkonLight:
                applianceName = self.balkonLightName
                
            default:
                applianceName = nil
            }
            
            let state = (sw.on) ? 1 : 0

            if let applianceName = applianceName {

                self.enableUI(false)

                let API = LightingAPI()
                API.ChangeStatus(applianceName, newStatus: state, completionHandler: {
                    (error, dict) -> Void in
                    
                    self.updateSwitches(dict)
                    self.enableUI(true)
                })
            }
        }
    }
}