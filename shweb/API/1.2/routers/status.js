const express = require('express');
const router = express.Router();
const House = require('../services/house');

const HTTP_BAD_REQUEST = 400;

/**
 *	Return house status information.
 *
 *	GET /GetHouseStatus
 */
router.get('/GetHouseStatus', async function(req, res) {

        let houseStatus = await House.GetHouseStatus();
        res.json(houseStatus);
});

/**
 *	Change house mode to the mode provided.
 *
 *	PUT /SetHouseMode/:changeStatusTo
 *	:changeStatusTo: 1 - presence mode, 0 - standby mode
 */
router.put('/SetHouseMode/:changeStatusTo', async function(req, res) {

        let changeStatusTo = req.params.changeStatusTo;
        if (changeStatusTo != 1 && changeStatusTo != 0)
        {
                res.status(HTTP_BAD_REQUEST).send(`Invalid status requested (${changeStatusTo}).`);
                return;
        }
        
        let updatedStatus = await House.SetHouseMode(changeStatusTo);
        res.status(200).send(JSON.stringify(updatedStatus)).end();
});

module.exports = router;