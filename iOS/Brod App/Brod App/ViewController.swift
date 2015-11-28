//
//  ViewController.swift
//  Brod App
//
//  Created by Dennis Afanassiev on 25/09/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
    
    override func viewDidLoad()
    {
        super.viewDidLoad()
        self.updateInterface()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    @IBOutlet weak var presenceModeBtn: UIButton!
    @IBOutlet weak var presenceLabel: UILabel!
    @IBOutlet weak var insideTemp: UILabel!
    @IBOutlet weak var outsideTemp: UILabel!
    
    func updateInterface() -> Void
    {
        let API = HouseAPI()
        API.GetHouseStatus({
            (error, outTemp, bedroomTemp) -> Void in
            
            self.insideTemp.text = Formatter.formatTemperature(bedroomTemp)
            self.outsideTemp.text = Formatter.formatTemperature(outTemp)
        })
    }

    @IBAction func onRefreshBtnClick(sender: AnyObject)
    {
        self.insideTemp.text = "выясняем..."
        self.outsideTemp.text = "выясняем..."
        self.updateInterface();
    }
}

