const express = require('express');
const router = express.Router();
const HTTPStatus = require('http-status-codes');
const Electricity = require('../services/electricity');

/**
 *	Returns power meter current data.
 *
 *	GET /GetPowerMeterData
 */
router.get('/GetPowerMeterData', async function(req, res)
{
        res.json(await Electricity.GetPowerMeterData());
});

/**
 *	Returns power meter statistics for specific period.
 *
 *	GET /GetPowerStatistics/:days
 */
router.get('/GetPowerStatistics/:days', async function(req, res)
{
        let days = req.params.days;
        if (isNaN(days) || days < 1 || days > 365)
                res.statusCode(HTTPStatus.BAD_REQUEST).send(`Invalid period ${days} specified.`);

        res.json(await Electricity.GetPowerStatistics(days));
});

/**
 *	Returns power consumption (kWh) by hours for the period of
 *	$days specified.
 *
 *	GET /GetPowerConsumptionByHours/:days
 */
router.get('/GetPowerConsumptionByHours/:days', async function(req, res)
{
        let days = req.params.days;
        if (isNaN(days) || days < 1 || days > 300)
                res.statusCode(HTTPStatus.BAD_REQUEST).send(`Invalid period ${days} specified.`);

        res.json(await Electricity.GetPowerConsumptionByHours(days));
});

/**
 *	Returns power consumption (kWh) by days for the period of
 *	$days specified.
 *
 *	GET /GetPowerConsumptionByDays/:days
 */
router.get('/GetPowerConsumptionByDays/:days', async function(req, res)
{
        let days = req.params.days;
        if (isNaN(days) || days < 1 || days > 300)
                res.statusCode(HTTPStatus.BAD_REQUEST).send(`Invalid period ${days} specified.`);
 
        res.json(await Electricity.GetPowerConsumptionByDays(days));
});

module.exports = router;