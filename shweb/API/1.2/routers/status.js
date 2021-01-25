const express = require('express');
const router = express.Router();
const House = require('../services/house');
const HTTPStatus = require('http-status-codes').StatusCodes;

/**
 *	Return house status information.
 *
 *	GET /HouseStatus
 */
router.get('/HouseStatus', async function(req, res) {

        let houseStatus = await House.GetHouseStatus();
        res.json(houseStatus);
});

/**
 *	Change house mode to the mode provided.
 *
 *	PUT /HouseMode
 *	payload JSON: 
 *      { mode: x } where x is a follows:
 *      1 - presence mode, 
 *      0 - longterm standby mode,
 *      2 - shortterm standby mode.
 */
router.put('/HouseMode', async function(req, res) {

        let changeStatusRequest = req.body;
        if (changeStatusRequest.mode === undefined || (
                changeStatusRequest.mode != House.HouseMode.PRESENCE_MODE && 
                changeStatusRequest.mode != House.HouseMode.SHORTTERM_STANDY && 
                changeStatusRequest.mode != House.HouseMode.LONGTERM_STANDBY))
        {
                res.status(HTTPStatus.BAD_REQUEST).send(`Invalid mode request (${JSON.stringify(changeStatusRequest)}).`);
                return;
        }
        
        let updatedStatus = await House.SetMode(changeStatusRequest.mode);
        res.status(HTTPStatus.OK).send(JSON.stringify(updatedStatus)).end();
});

module.exports = router;