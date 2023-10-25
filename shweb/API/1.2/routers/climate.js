const express = require('express');
const router = express.Router();
const HTTPStatus = require('http-status-codes').StatusCodes;
const Climate = require('../services/climate');

/**
 *      Return house configuration.
 *      Note: this probably should be moved to Status(?).
 *
 *      GET /Configuration
 */
router.get('/Configuration', async function(req, res)
{
        res.json(await Climate.GetConfiguration());
});

/**
 *      Update temperature setting for specified appliance(s) for all house modes.
 * 
 *      body format:
 *      {
 *              ("saunaFloor" | "hallFloor") : {
 *                      "settings" : {
 *                              "presence": [numeric value],
 *                              "shortTermStandby": [numeric value],
 *                              "longTermStandby": [numeric value]
 *                      }
 *              }
 *              [, (more appliances)]
 *      }
 */
router.put('/UpdateHeatingSetting', async function(req, res)
{
        let updateRequest = {};

        // build clean updateReqiest object from request
        for (a in Climate.HeatingAppliance)
        {
                let applianceName = Climate.HeatingAppliance[a];
                if (applianceName !== undefined && req.body[applianceName]?.settings !== undefined)
                {
                        if (isNaN(req.body[applianceName].settings.presence) || isNaN(req.body[applianceName].settings.shortTermStandby) || isNaN(req.body[applianceName].settings.longTermStandby))
                        {
                                res.status(HTTPStatus.BAD_REQUEST).send(`Invalid ${applianceName} settings: (${req.body})`);
                                return;
                        }
                        updateRequest[applianceName] = {};
                        updateRequest[applianceName].settings = {};
                        updateRequest[applianceName].settings.presence = Number(req.body[applianceName].settings.presence);
                        updateRequest[applianceName].settings.shortTermStandby = Number(req.body[applianceName].settings.shortTermStandby);
                        updateRequest[applianceName].settings.longTermStandby = Number(req.body[applianceName].settings.longTermStandby);
                }
        }

        // check if there is something to update
        if (Object.keys(updateRequest).length === 0)
        {
                res.status(HTTPStatus.BAD_REQUEST).send(`No appliances to update: (${req.body})`);
                return;
        }

        // console.log(updateRequest);
        res.json(await Climate.UpdateHeatingSetting(updateRequest));
});

/**
 *	Turn on bath ventilation for a period of time.
 *
 *	duration - time (minutes) for ventilation.
 *
 *	PUT /SetBathVentilationOn/:duration
 */
router.put('/SetBathVentilationOn/:duration', async function(req, res)
{
        let duration = req.params.duration;
        if (isNaN(duration) || duration < 1 || duration > 60 * 24) 
        {
                res.status(HTTPStatus.BAD_REQUEST).send(`Invalid duration requested: (${duration}).`);
                return;
        }
        res.json(await Climate.SetBathVentilationOn(Number(duration)));
});

module.exports = router;