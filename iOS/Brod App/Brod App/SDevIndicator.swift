//
//  SDevIndicator.swift
//  SDevIndicator
//
//  Created by Sedat ÇİFTÇİ on 26/08/14.
//  Copyright (c) 2014 Sedat ÇİFTÇİ. All rights reserved.
//

import UIKit

class SDevIndicator : UIView {
    
    var spinnerParentView : UIView!
    var spinner : UIActivityIndicatorView!
    
    class func generate(mainView: UIView) -> SDevIndicator? {
        return SDevIndicator(frame: mainView.bounds, mainView: mainView)
    }
    
    init(frame: CGRect, mainView: UIView) {
        super.init(frame: frame)
        self.backgroundColor = UIColor.clearColor()
        spinner = UIActivityIndicatorView(activityIndicatorStyle: UIActivityIndicatorViewStyle.WhiteLarge)
        spinnerParentView = UIView(frame: CGRectMake(0, 0, 70, 70))
        spinnerParentView.backgroundColor = UIColor.blackColor()
        spinnerParentView.alpha = 0.5
        spinnerParentView.center = self.center
        spinnerParentView.layer.cornerRadius = 5
        spinner.center = CGPointMake(35, 35)
        spinnerParentView.addSubview(spinner)
        self.addSubview(self.spinnerParentView)
        mainView.addSubview(self)
        spinner.startAnimating()
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    func dismissIndicator() -> Void {
        UIView.animateWithDuration(0.3, delay: 0.3, options: UIViewAnimationOptions.CurveEaseOut, animations: {
            self.alpha = 0
            }, completion: {
                finished in
                self.spinner.stopAnimating()
                self.removeFromSuperview()
        })
    }
    
}