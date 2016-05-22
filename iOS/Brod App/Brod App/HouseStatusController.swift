//
//  HouseStatusController.swift
//  Brod App
//  User interface controller class linked to House Status functionality.
//
//  Created by Dennis Afanassiev on 25/09/15.
//  Copyright © 2015 Dennis Afanassiev. All rights reserved.
//

import UIKit

class HouseStatusController: UIViewController {
    
    override func viewDidLoad()
    {
        super.viewDidLoad()
        self.refreshInterface()
    }

//    override func didReceiveMemoryWarning() {
//        super.didReceiveMemoryWarning()
//        // Dispose of any resources that can be recreated.
//    }

    @IBOutlet weak var presenceModeBtn: HouseStatusButton!
    @IBOutlet weak var presenceLabel: UILabel!
    @IBOutlet weak var insideTemp: UILabel!
    @IBOutlet weak var outsideTemp: UILabel!
    @IBOutlet weak var refreshBtn: UIButton!
    @IBOutlet weak var progress: UIActivityIndicatorView!
    
    
    private var currentHouseMode: HouseMode?
    
    // Represents actual house mode as it reported by the API.
    // House mode will return nil until the first API request didn't return the actual state.
    var CurrentHouseMode: HouseMode?
    {
        get
        {
            return self.currentHouseMode
        }
        set
        {
            self.currentHouseMode = newValue
            if (newValue != nil)
            {
                switch newValue!
                {
                    case HouseMode.Standby:
                        self.presenceLabel.text = "Режим ожидания"
                        self.presenceModeBtn.setTitle("В режим присутствия", forState: UIControlState.Normal)
                        self.presenceModeBtn.backgroundColor = UIColor.redColor()
                    
                    case HouseMode.Precense:
                        self.presenceLabel.text = "Режим присутствия"
                        self.presenceModeBtn.setTitle("В режим ожидания", forState: UIControlState.Normal)
                        //#337AB7 - blue
                        self.presenceModeBtn.backgroundColor = UIColor(red:0.20, green:0.48, blue:0.72, alpha:1.0)
                }
            }
        }
    }

    
    // UI refresh procedure
    func refreshInterface() -> Void
    {
        self.insideTemp.text = "выясняем..."
        self.outsideTemp.text = "выясняем..."
        self.refreshBtn.enabled = false
        self.presenceModeBtn.enabled = false
        self.progress.startAnimating()
        
        let API = HouseStatusAPI()
        API.GetHouseStatus
        {
            (error, houseMode) -> Void in
            
            self.refreshBtn.enabled = true
            self.presenceModeBtn.enabled = true
            self.progress.stopAnimating()
            
            if (error != nil)
            {
                self.showUnhandledAlert("Ошибка", message: error!.localizedDescription)
                self.insideTemp.text = "неизвестно"
                self.outsideTemp.text = "неизвестно"
            }
            else
            {
                self.insideTemp.text = Formatter.formatTemperature(houseMode!.inTemp)
                self.outsideTemp.text = Formatter.formatTemperature(houseMode!.outTemp)
                self.CurrentHouseMode = houseMode!.presenceMode
            }
        }
    }
    
    // House mode change procedure
    func changeMode() -> Void
    {
        if (CurrentHouseMode == nil)
        {
            self.showUnhandledAlert("Ошибка", message: "Текущее состояние дома неизвестно.")
        }
        else
        {
            self.showConfirmationAlert("Подтверждение", message: "Переводим дом в другой режим?", confirmedHandler:
            {
                () -> Void in
            
                self.presenceModeBtn.enabled = false
                self.refreshBtn.enabled = false
                self.progress.startAnimating()

                let API = HouseStatusAPI()
                API.SetHouseMode(self.CurrentHouseMode!.ToggleMode(), completionHandler: {
                    (error, houseMode) -> Void in
                    
                    self.presenceModeBtn.enabled = true
                    self.refreshBtn.enabled = true
                    self.progress.stopAnimating()

                    if (error != nil)
                    {
                        self.showUnhandledAlert("Ошибка", message: error!.localizedDescription)
                    }
                    else
                    {
                        if (houseMode!.presenceMode != self.CurrentHouseMode!.ToggleMode())
                        {
                            self.showUnhandledAlert("Ошибка", message: "Сбой при смене режима дома.")
                        }
                        else
                        {
                            self.CurrentHouseMode = houseMode!.presenceMode
                        }
                    }
                })
            })
        }
    }
    
    func showUnhandledAlert(title: String, message: String)
    {
        let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertControllerStyle.Alert)
        self.presentViewController(alert, animated: true, completion: nil)
        alert.addAction(UIAlertAction(title: "Ок", style: UIAlertActionStyle.Default, handler: nil))
    }
    
    func showConfirmationAlert(title: String, message: String, confirmedHandler: () -> Void) ->Void
    {
        let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertControllerStyle.Alert)
        self.presentViewController(alert, animated: true, completion: nil)
        alert.addAction(UIAlertAction(title: "Да", style: UIAlertActionStyle.Default, handler:
            {
                (action) -> Void in
                confirmedHandler()
            } ))
        alert.addAction(UIAlertAction(title: "Нет", style: UIAlertActionStyle.Default, handler: nil))
    }

    // Refresh UI button handler
    @IBAction func onRefreshBtnClick(sender: AnyObject)
    {
        self.refreshInterface();
    }
    
    // House status change handler
    @IBAction func modeChange(sender: AnyObject)
    {
        self.changeMode()
    }
    
}

class HouseStatusButton : UIButton
{
    required init(coder aDecoder: (NSCoder!))
    {
        super.init(coder: aDecoder)!
        self.layer.cornerRadius = 5.0
        self.tintColor = UIColor.whiteColor()
        self.backgroundColor = UIColor(red:0.20, green:0.48, blue:0.72, alpha:1.0)
    }
}

