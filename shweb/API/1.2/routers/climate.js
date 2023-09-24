const express = require('express');
const router = express.Router();
const HTTPStatus = require('http-status-codes').StatusCodes;
const Climate = require('../services/climate');

/**
 *	Return heating history hourly for the depth specified.
 *
 *	:days - history depth in days
 *
 *	GET /GetTempHistory/:days
 */
router.get('/GetTempHistory/:days', async function(req, res) 
{
        let days = req.params.days;
        if (isNaN(days) || days < 1 || days > 300) 
        {
                res.status(HTTPStatus.BAD_REQUEST).send(`Invalid request parameter: (${days}).`);
                return;
        }
        res.json(await Climate.GetTempHistory(Number(days)));
});

/**
 *	Return humidity history hourly for the depth specified.
 *
 *	:days - history depth in days
 *
 *	GET /GetHumidityHistory/:days
 */
router.get('/GetHumidityHistory/:days', async function(req, res)
{
        let days = req.params.days;
        if (isNaN(days) || days < 1 || days > 300)
        {
                res.status(HTTPStatus.BAD_REQUEST).send(`Invalid request parameter: (${days}).`);
                return;
        }
        res.json(await Climate.GetHumidityHistory(Number(days)));
});

/**
 *	Returns inside/outside min/avg/max values for the time period requested.
 *
 *	:days - period length from now to the past in days.
 *
 *	GET /GetTempStatistics/:days
 */
router.get('/GetTempStatistics/:days', async function(req, res)
{
        let days = req.params.days;
        if (isNaN(days) || days < 1 || days > 1000) 
        {
                res.status(HTTPStatus.BAD_REQUEST).send(`Invalid request parameter: (${days}).`);
                return;
        }
        res.json(await Climate.GetTempStatistics(Number(days)));
});

/**
 *	Return home heating schedule information.
 *
 * 	GET /GetSchedule
 */
router.get('/GetSchedule', async function(req, res)
{
        res.json(await Climate.GetHeatingSchedule());
});

/**
 *	Set heating schedule as per arrival and departure times provided.
 *
 *	Arrival date & time parameters block:
 *	:arr_year - scheduled year when presence starts.
 *	:arr_month - scheduled presence month.
 *	:arr_day - schedluled presence day.
 *	:arr_hour - scheduled presence hour.
 *	Departure date & time parameters:
 *	:dep_year - scheduled year when presence is over.
 *	:dep_month - scheduled month.
 *	:dep_day - schedluled day.
 *	:dep_hour - scheduled hour.
 *
 *      TODO: parameters block to be replaces with a REST object.
 *
 *	PUT /SetSchedule/:arr_year/:arr_month/:arr_day/:arr_hour/:dep_year/:dep_month/:dep_day/:dep_hour
 */
router.put('/SetSchedule/:arr_year/:arr_month/:arr_day/:arr_hour/:dep_year/:dep_month/:dep_day/:dep_hour', async function(req, res)
{

        function validateAndGetDate(year, month, day, hour, minute)
        {
		if (isNaN(year) || year < 1990 || year > 2050)
			throw `Year: ${year} is out of the range.`;

                if (isNaN(month) || month < 1 || month > 12)
                        throw `Month: ${month} is out of the range.`;

                if (isNaN(day) || day < 1 || day > 31)
                        throw `Day: ${day} is out of the range.`;

                if (isNaN(hour) || hour < 0 || hour > 23)
                        throw `Hour: ${hour} is out of the range.`;

                if (isNaN(minute) || minute < 0 || minute > 59)
                        throw `Minute: ${minute} is out of the range.`;

                return new Date(year, month-1, day, hour, minute);
        }

        try
        {
                let arrival = validateAndGetDate(req.params.arr_year, req.params.arr_month, req.params.arr_day, req.params.arr_hour, 0);
                let departure = validateAndGetDate(req.params.dep_year, req.params.dep_month, req.params.dep_day, req.params.dep_hour, 0);

                res.json(await Climate.SetHeatingSchedlue(arrival, departure));
        }
        catch(validationException)
        {
                res.status(HTTPStatus.BAD_REQUEST).send(validationException);
        }
});

/**
 *	Clears heating schedule settings so it would never be activated in the future.
 *	PUT /ResetSchedule
 */
router.put('/ResetSchedule', async function(req, res)
{
        let arrivalAndDeparture = new Date(1990, 0, 1, 0);

        res.json(await Climate.SetHeatingSchedlue(arrivalAndDeparture, arrivalAndDeparture));
});

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
 *      Note: this probably should be moved to Status(?).
 * 
 *      Note 2: instead of bulk updating the whole 'configuration' 
 *      which can lead to issues, this method should be replaced
 *      with more granular calls e.g. update setting x to a.
 *
 *      PUT /Configuration
 */
router.put('/Configuration', async function(req, res)
{
        res.json(await Climate.UpdateConfiguration(req.body));
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