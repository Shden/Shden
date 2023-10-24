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
 *      Update temperature setting for specifc appliance for all hous modes.
 * 
 *      body format:
 *      {
 *              "applianceName" : (SAUNA_FLOOR | HALL_FLOOR),
 *              "presence": [numeric value],
 *              "shortTermStandby": [numeric value],
 *              "longTermStandby": [numeric value]
 *      }
 */
router.put('/UpdateHeatingSetting', async function(req, res)
{
        let updateRequest = req.body;
        // console.log(updateRequest);
        if (
                (updateRequest.applianceName !== Climate.HeatingAppliance.SAUNA_FLOOR && updateRequest.applianceName !== Climate.HeatingAppliance.HALL_FLOOR) ||
                isNaN(updateRequest.presence) || isNaN(updateRequest.shortTermStandby) || isNaN(updateRequest.longTermStandby)
        )
        {
                res.status(HTTPStatus.BAD_REQUEST).send(`Invalid request: (${updateRequest})`);
                return;
        }

        res.json(await Climate.UpdateHeatingSetting(
                updateRequest.applianceName, 
                updateRequest.presence, updateRequest.shortTermStandby, updateRequest.longTermStandby));
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