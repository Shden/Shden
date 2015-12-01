//
//  HouseStatusController.swift
//  Brod App
//
//  Created by Dennis Afanassiev on 25/09/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import UIKit

class HouseStatusController: UIViewController {
    
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
        API.GetHouseStatus
        {
            (error, houseMode) -> Void in
            
            if (error != nil)
            {
                let alert = UIAlertController(title: "Ошибка", message: error!.localizedDescription,
                    preferredStyle: UIAlertControllerStyle.Alert)
                self.presentViewController(alert, animated: true, completion: nil)
                alert.addAction(UIAlertAction(title: "Dismiss", style: UIAlertActionStyle.Default, handler: nil))
                return
            }
            self.insideTemp.text = Formatter.formatTemperature(houseMode!.inTemp)
            self.outsideTemp.text = Formatter.formatTemperature(houseMode!.outTemp)
            
            switch houseMode!.presenceMode
            {
            case 0:
                self.presenceLabel.text = "Режим ожидания"
                self.presenceModeBtn.titleLabel?.text = "В режим присутствия"
            case 1:
                self.presenceLabel.text = "Режим присутствия"
                self.presenceModeBtn.titleLabel?.text = "В режим ожидания"
            default:
                self.presenceLabel.text = "Ошибка"
                self.presenceModeBtn.titleLabel?.text = "Ошибка"
            }
        }
    }

    @IBAction func onRefreshBtnClick(sender: AnyObject)
    {
        self.insideTemp.text = "выясняем..."
        self.outsideTemp.text = "выясняем..."
        self.updateInterface();
    }
}

