const express = require('express');
const router = express.Router();
const House = require('../services/house');
const HTTPStatus = require('http-status-codes');

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
                res.status(HTTPStatus.BAD_REQUEST).send(`Invalid status requested (${changeStatusTo}).`);
                return;
        }
        
        let updatedStatus = await House.SetHouseMode(changeStatusTo);
        res.status(HTTPStatus.OK).send(JSON.stringify(updatedStatus)).end();
});

module.exports = router;