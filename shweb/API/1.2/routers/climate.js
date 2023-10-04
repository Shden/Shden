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
 *      Update house configuration data.
 * 
 *      Note: this is deprecating method. UpdateHeatingSetting should be used
 *      moving forward.
 * 
 *      PUT /Configuration
 */
router.put('/Configuration', async function(req, res)
{
        res.json(await Climate.UpdateConfiguration(req.body));
});

/**
 *      Update temperature setting for specifc appliance and mode of house.
 *      Example: set hallFloor temperature for presence mode to 24 celsius.
 * 
 *      :heatingApplianceName - heating appliance name to update.
 *      :modeName - mode name to update, one of "presence", "shortTermStandby" or "longTermStandby".
 *      :newTemperatureSetting - temperature setting for given appliance and mode.
 */
router.put('/UpdateHeatingSetting/:heatingApplianceName/:modeName/:newTemperatureSetting', async function(req, res)
{
        let heatingApplianceName = req.params.heatingApplianceName;
        if (heatingApplianceName !== Climate.HeatingAppliance.SAUNA_FLOOR && heatingApplianceName !== Climate.HeatingAppliance.HALL_FLOOR)
        {
                res.status(HTTPStatus.BAD_REQUEST).send(`Invalid appliance name requested: (${heatingApplianceName})`);
                return;
        }

        let heatingModeName = req.params.modeName;
        if (heatingModeName !== "presence" && heatingModeName !== "shortTermStandby" && heatingModeName !== "longTermStandby")
        {
                res.status(HTTPStatus.BAD_REQUEST).send(`Invalid mode name requested: (${heatingModeName})`);
                return;
        }

        let newTemperatureSetting = req.params.newTemperatureSetting;
        if (isNaN(newTemperatureSetting) || newTemperatureSetting < 0 || newTemperatureSetting > 50)
        {
                res.status(HTTPStatus.BAD_REQUEST).send(`Invalid temperature setting requested: (${newTemperatureSetting})`);
                return;
        }

        res.json(await Climate.UpdateHeatingSetting(heatingApplianceName, heatingModeName, newTemperatureSetting));
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