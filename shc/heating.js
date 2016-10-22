// Node.js port of heating controller logic.
var fs = require('fs');
var ow = require('./onewire');
var http = require('http');
var numeral = require('numeral');

// -- configuration constants:
const configurationFileName = __dirname + '/config/heating.json';

const heaterCutOffTemp		= 95.0;		/* Heater failure temperature */
const EXIT_OK			= 0;
const EXIT_FAILURE		= 1;

const MAX_POWER			= 17250;	/* 25 * 230 * 3 */
const HEATER_POWER		= 12000;

// -- Start handling --
// --------------------
global.OWDebugMode = true;

console.log('Controller build:\t0.3');
console.log(`Debug mode:\t\t${global.OWDebugMode}`);

// read configuration file
var configuration = JSON.parse(fs.readFileSync(configurationFileName, 'utf8'));

if (wasOverheated())
{
	setHeater(0);
	setPump(1);
	console.log('Previous heater failure detected. Cannot run.');
	return EXIT_FAILURE;
}

// -- Measure current temperatures and set out the target temperature
Promise.all([
	getControlTemperature(),
	ow.getT(ow.sensors.outputSensor),
	ow.getT(ow.sensors.inputSensor),
	ow.getT(ow.sensors.heaterSensor),
	ow.getT(ow.sensors.kitchenSensor),
	ow.getT(ow.sensors.bathRoomSensor),
	ow.getT(ow.sensors.childrenSmallSensor),
	ow.getT(ow.sensors.saunaFloorSensor),
	getTargetTemp(),
	getCurrentPowerConsumption()
	])
.then(results => {
	var controlTemp = results[0];
	var outgoingFluidTemp = results[1];
	var ingoingFluidTemp = results[2];
	var electricHeaterTemp = results[3];
	var kitchenTemp = results[4];
	var bathroomTemp = results[5];
	var childrenSmallTemp = results[6];
	var saunaFloorTemp = results[7];
	var targetTemp = results[8];
	var consumption = results[9];

	console.log(`Target temperature:\t${numeral(targetTemp).format('0.0')}\u00B0C`);
	console.log(`Control temperature:\t${numeral(controlTemp).format('0.0')}\u00B0C`);
	console.log(`Power consumption:\t${numeral(consumption).format('0,0')}W`);

	// -- Control heater
	controlHeater(
		controlTemp, electricHeaterTemp, outgoingFluidTemp, consumption)
	.then(heaterState => {
		console.log(`Heater:\t\t\t${heaterState ? "ON" : "OFF"}`);
	});

	// -- Control sauna floor temp
	var saunaFloorTargetTemp = configuration.heating.saunaFloorTemp;
	controlSaunaFloor(saunaFloorTemp, saunaFloorTargetTemp)
	.then(saunaFloorHeatingState => {
		console.log(`Sauna floor:\t\t${saunaFloorHeatingState ? "ON" : "OFF"}`);
	});

	// -- Control pump
	var pumpState = controlPump([controlTemp, electricHeaterTemp, ingoingFluidTemp,
		outgoingFluidTemp, bathroomTemp, kitchenTemp, childrenSmallTemp]);
	console.log(`Pump:\t\t\t${pumpState ? "ON" : "OFF"}`);

	// // -- Individual rooms control
	Promise.all(
		configuration.roomControlDescriptors.map(function(item) {
			return controlRoom(item, targetTemp);
		})
	);
});

// -- End handling
// -- Ancillary methods

// Returnes the temperature to be controlled.
// Might be combined measure e.g. avergage temperature etc.
function getControlTemperature()
{
	return ow.getT(ow.sensors.bedroomSensor);
}

// Heater control
function setHeater(ison)
{
	const sw = ow.switches.heaterSwitch;
	ow.changeSwitch(sw.address, sw.channel, ison);
}

// Pump control
function setPump(ison)
{
	const sw = ow.switches.pumpSwitch;
	ow.changeSwitch(sw.address, sw.channel, ison);
}

// Sauna floor control
function setSaunaFloor(ison)
{
	const sw = ow.switches.saunaFloorSwitch;
	ow.changeSwitch(sw.address, sw.channel, ison);
}

// Current heater state
function getHeaterState()
{
	const sw = ow.switches.heaterSwitch;
	return ow.getSwitchState(sw.address, sw.channel);
}

// Current pump state
function getPumpState()
{
	const sw = ow.switches.pumpSwitch;
	return ow.getSwitchState(sw.address, sw.channel);
}

// Will eventually bring current target temperature,
// depending on configuration setting and time.
function getTargetTemp()
{
	return new Promise((resolved, rejected) => {

		// -- Check if it is presence heating mode now
		isPresenceHeating()
			.then(isPresence => {
				if (isPresence)
				{
					/* TMP solution for comfort sleep. Once per room valves
					   are installed, this code should be gone
					   to controlRoom() function. */
					if (checkIfNowWithinInterval(
						configuration.heating.comfortSleepStartHour, 0,
						configuration.heating.comfortSleepEndHour, 0))
						resolved(configuration.heating.comfortSleepTargetTemperature);
					else
						resolved(configuration.heating.presenceTemperature);
				}

				// -- If in standby, check day/night targets to save power
				if (isSaving())
				{
					resolved(configuration.heating.standbyNightTemperature);
				}

				resolved(configuration.heating.standbyTemperature);
			});
	});
}

// Will eventually bring TRUE if presence heating mode
// or FALSE if standby heating mode
function isPresenceHeating()
{
	return new Promise((resolved, rejected) => {
		getHeatingStartTime()
			.then(presenceStart => {
				var now = new Date();
				var presenceFinish = new Date(configuration.schedule.departure);
				var isPresence = now >= presenceStart && now <= presenceFinish;
				resolved(isPresence);
			});
	});
}

// Will eventually bring the time (in hours) required to heat up the house
// to presence temperature.
function getHeatingTime()
{
	return new Promise((resolved, rejected) => {
		getControlTemperature()
			.then(currentTemperature => {
				const heatingSpeed = 1.0;	// speed of heating up, C/hour.
				var heatingTime =
					(configuration.heating.presenceTemperature -
					currentTemperature) / heatingSpeed; // hours
				resolved(heatingTime);
			});
	});
}

// Time to start heating so that house is heated by arrival
function getHeatingStartTime()
{
	return new Promise((resolved, rejected) => {
		getHeatingTime()
			.then(heatingTime => {
				var arrival = new Date(configuration.schedule.arrival);
				var startTime = new Date(
					arrival - heatingTime *
					60 * 60 * 1000); // hours to milliseconds
				resolved(startTime);
			});
	});
}

// TRUE if saving (night) tariff is on or FALSE otherwise
function isSaving()
{
	return checkIfNowWithinInterval(
		configuration.heating.nightTariffStartHour, 0,
		configuration.heating.nightTariffEndHour, 0);
}

/* Helper function.
  Checks if now we are within time interval specified by its start (h:m) and end (h:m) */
function checkIfNowWithinInterval(startHour, startMin, endHour, endMin)
{
	var nowDate = new Date();
	const MPH = 60;

	// all 3 below in minutes
	var start = startHour * MPH + startMin;
	var end = endHour * MPH + endMin;
	var now = nowDate.getHours() * MPH + nowDate.getMinutes();

	if (start < end)
	{
		// interval start is earlier than end, straightforward interval (e.g. 14 to 20)
		return (now >= start && now <= end);
	}
	else
	{
		// interval start is later than end, looped interval (e.g. 23 to 7)
		return (now >= start || now <= end);
	}
}

/** Room control routine.
 *	roomDescr - descriptor of the room to control
 *	targetTemp - target temperature for the room
 */
function controlRoom(roomDescr, targetTemp)
{
	return new Promise((resolved, rejected) => {
		ow.getT(roomDescr.sensorAddress)
			.then(roomTemp => {
				var switchState =
					(roomTemp > targetTemp +
						configuration.heating.tempDelta)
					? 0 : 1;
				ow.changeSwitch(
					roomDescr.switch.address,
					roomDescr.switch.channel,
					switchState);
					resolved();
			});
	});
}

/** Heater control routine.
 *	controlTemp - current control temperature
 *	heaterTemp - current electric heater temperature to control (ref: O1)
 *	outgoingFluidTemp - current outgoing temperature of the fluid
 *			    (oven + electric heater, ref: O2)
 *	currentPowerConsumption - total current power consumption from powher
 *				meter.
 */
function controlHeater(
	controlTemp, heaterTemp, outgoingFluidTemp, currentPowerConsumption)
{
	/* First, immediately check heater for overheat */
	if (heaterTemp >= heaterCutOffTemp)
	{
		setHeater(0);
		setPump(1);

		configuration.error =
			`${new Date().toLocaleString()}: Heater failure detected t=${heaterTemp}C.`;

		fs.writeFileSync(configurationFileName, JSON.stringify(configuration, null, 4));
		console.log(configuration.error);

		throw configuration.error;
	}

	return new Promise((resolved, rejected) => {

		// Then check if oven provides enough heating
		if (outgoingFluidTemp > configuration.heating.electricHeaterOffTemp &&
		    outgoingFluidTemp - heaterTemp > configuration.heating.ovenExtraOffTemp)
		{
			// Oven heater is providing enough heat, no need to run electricity
			setHeater(0);
			resolved(0);
		}

		Promise.all([
			getHeaterState(),
			getTargetTemp()
		])
		.then(results => {
			var heaterState = results[0];
			var targetTemp = results[1];

			// Check power consumption limit
			if ((heaterState == 1 && currentPowerConsumption > MAX_POWER) ||
			    (heaterState == 0 && currentPowerConsumption > MAX_POWER - HEATER_POWER))
			{
				if (heaterState == 1)
				{
					setHeater(0);
				}
				resolved(0);
			}

			// Third go to electrc heater control and see if action needed
			else if (controlTemp < targetTemp)
			{
				setHeater(1);
				resolved(1);
			}
			else if (controlTemp > targetTemp + configuration.heating.tempDelta)
			{
				setHeater(0);
				// Dont stop pump until fluid temp will go down
				// Other heat sources may still be on
				resolved(0);
			}

			// Finally if nothing needed to be changed,
			// just return the current status.
			else {
				resolved(heaterState);
			}
		});
	});
}

/*
 *	Sauna floor control procedure.
 */
function controlSaunaFloor(currentFloorTemp, targetFloorTemp)
{
	return new Promise((resolved, rejected) => {
		isPresenceHeating()
			.then(isPresence => {
				var floorHeatingON =
					(isPresence &&
					currentFloorTemp < targetFloorTemp)
					? 1 : 0;
				setSaunaFloor(floorHeatingON);
				resolved(floorHeatingON);
			});
	});
}

/*
 *	Pump control procedure
 *	temperatureVector - vector of temperatures across the house
 *
 *	Pump shall be on while the vector contains devations more than configured.
 */
function controlPump(temperatureVector)
{
	var minT = Math.min.apply(null, temperatureVector);
	    maxT = Math.max.apply(null, temperatureVector);

	var pumpState =
		(maxT - minT > configuration.heating.stopPumpTempDelta) ? 1 : 0;
	setPump(pumpState);
	return pumpState;
}

// Checks if heating error was reported.
function wasOverheated()
{
	return configuration.error != null;
}

// What is the current house power consumption. To stay within power limit.
function getCurrentPowerConsumption()
{
	return new Promise((resolved, rejected) => {
		getPowerMeterData()
			.then(result => {
				resolved(result.P.sum)
			})
			.catch(err => {
				console.log(err);
				rejected(err);
			});

	})
}

// Returns promise to bring current power meter data.
function getPowerMeterData()
{
	return new Promise((resolved, rejected) => {
		http.get({
			host: 'localhost',
			path: '/API/1.1/consumption/electricity/GetPowerMeterData'
		}, function(responce) {
			if (responce.statusCode != 200)
				rejected(responce.statusCode);

			var data = '';
			responce.on('data', function(b) {
				data += b;
			});
			responce.on('end', function() {
				var powerInfo = JSON.parse(data);
				resolved(powerInfo);
			});
			responce.on('error', function(err) {
				rejected(err);
			});
		});
	});
}

// -- Exports for testing
// If we're running under Node,
if (typeof exports !== 'undefined')
{
	// methods
	exports.getControlTemperature = getControlTemperature;
	exports.isPresenceHeating = isPresenceHeating;
	exports.getTargetTemp = getTargetTemp;
	exports.getHeatingTime = getHeatingTime;
	exports.getHeatingStartTime = getHeatingStartTime;
	exports.checkIfNowWithinInterval = checkIfNowWithinInterval;
	exports.setHeater = setHeater;
	exports.setPump = setPump;
	exports.setSaunaFloor = setSaunaFloor;
	exports.getHeaterState = getHeaterState;
	exports.getPumpState = getPumpState;
	exports.controlRoom = controlRoom;
	exports.controlHeater = controlHeater;
	exports.controlSaunaFloor = controlSaunaFloor;
	exports.controlPump = controlPump;
	exports.wasOverheated = wasOverheated;
	exports.getPowerMeterData = getPowerMeterData;
	exports.getCurrentPowerConsumption = getCurrentPowerConsumption;

	// data
	exports.configuration = configuration;
}
