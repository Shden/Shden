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

// -- Start handling --
// --------------------
// read configuration from configuration file
global.OWDebugMode = true;

console.log('Controller build:\t0.2');
console.log(`Debug mode:\t\t${global.OWDebugMode}`);

var configuration = JSON.parse(fs.readFileSync(configurationFileName, 'utf8'));

if (wasOverheated())
{
	setHeater(0);
	setPump(1);
	console.log('Previous heater failure detected. Cannot run.');
	return EXIT_FAILURE;
}

// -- Measure current temperatures and set out the target
var controlTemp = getControlTemperature();
var outgoingFluidTemp = ow.getT(ow.sensors.outputSensor);
var ingoingFluidTemp = ow.getT(ow.sensors.inputSensor);
var electricHeaterTemp = ow.getT(ow.sensors.heaterSensor);
var kitchenTemp = ow.getT(ow.sensors.kitchenSensor);
var bathroomTemp = ow.getT(ow.sensors.bathRoomSensor);
var childrenSmallTemp = ow.getT(ow.sensors.childrenSmallSensor);
var targetTemp = getTargetTemp();

console.log(`Target temperature:\t${numeral(targetTemp).format('0.0')}\u00B0C`);
console.log(`Control temperature:\t${numeral(controlTemp).format('0.0')}\u00B0C`);

// Check current power consumption
getCurrentPowerConsumption()
	.then(consumption => {
		console.log(consumption);
	});
// -- Control heater
var heaterState =
	controlHeater(controlTemp, electricHeaterTemp, outgoingFluidTemp);
console.log(`Heater:\t\t\t${heaterState ? "ON" : "OFF"}`);

// -- Control sauna floor temp
var saunaFloorTemp = ow.getT(ow.sensors.saunaFloorSensor);
var saunaFloorTargetTemp = configuration.heating.saunaFloorTemp;
var saunaFloorHeatingState =
	controlSaunaFloor(saunaFloorTemp, saunaFloorTargetTemp);
console.log(`Sauna floor:\t\t${saunaFloorHeatingState ? "ON" : "OFF"}`);

// -- Control pump
var pumpState = controlPump([controlTemp, electricHeaterTemp, ingoingFluidTemp,
	outgoingFluidTemp, bathroomTemp, kitchenTemp, childrenSmallTemp]);
console.log(`Pump:\t\t\t${pumpState ? "ON" : "OFF"}`);

// -- Individual rooms control
for (var r in configuration.roomControlDescriptors)
	controlRoom(configuration.roomControlDescriptors[r], targetTemp);


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

// Current target temperature, depending on configuration setting and time
function getTargetTemp()
{
	// -- Check precence time
	if (isPresenceHeating())
	{
		/* TMP solution for comfort sleep. Once per room valves are installed, this code should be gone
		to controlRoom() function. */
		if (checkIfNowWithinInterval(
			configuration.heating.comfortSleepStartHour, 0,
			configuration.heating.comfortSleepEndHour, 0))
			return configuration.heating.comfortSleepTargetTemperature;
		else
			return configuration.heating.presenceTemperature;
	}

	// -- If in standby, check day/night targets to save power
	if (isSaving())
	{
		return configuration.heating.standbyNightTemperature;
	}

	return configuration.heating.standbyTemperature;
}

// TRUE if presence heating mode or FALSE if standby heating mode
function isPresenceHeating()
{
	// -- Check precence time
	var now = new Date();
	var presenceStart = getHeatingStartTime();
	var presenceFinish = new Date(configuration.schedule.departure);

	return now >= presenceStart && now <= presenceFinish;
}

// Time (in hours) required to heat up the house to presence temperature.
function getHeatingTime()
{
 	const heatingSpeed = 1.0;	// speed of heating up, C/hour.
	var currentTemperature = getControlTemperature();
 	return (configuration.heating.presenceTemperature - currentTemperature) / heatingSpeed; // hours
}

// Time to start heating so that house is heated by arrival
function getHeatingStartTime()
{
	var arrival = new Date(configuration.schedule.arrival);
	return new Date(arrival - getHeatingTime() * 60 * 60 * 1000); // hours to milliseconds
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
	var roomTemp = ow.getT(roomDescr.sensorAddress);
	if (roomTemp > targetTemp + configuration.heating.tempDelta) {
		ow.changeSwitch(
			roomDescr.switch.address,
			roomDescr.switch.channel,
			0);
	} else {
		ow.changeSwitch(
			roomDescr.switch.address,
			roomDescr.switch.channel,
			1);
	}
}

/** Heater control routine.
 *	controlTemp - current control temperature
 *	heaterTemp - current electric heater temperature to control (ref: O1)
 *	outgoingFluidTemp - current outgoing temperature of the fluid
 *			    (oven + electric heater, ref: O2)
 */
function controlHeater(controlTemp, heaterTemp, outgoingFluidTemp)
{
	/* First check heater for overheat */
	if (heaterTemp >= heaterCutOffTemp)
	{
		setHeater(0);
		setPump(1);

		configuration.error = `${new Date().toLocaleString()}: Heater failure detected t=${heaterTemp}C.`;

		fs.writeFileSync(configurationFileName, JSON.stringify(configuration, null, 4));
		console.log(configuration.error);

		throw configuration.error;
	}

	if (outgoingFluidTemp > configuration.heating.electricHeaterOffTemp &&
	    outgoingFluidTemp - heaterTemp > configuration.heating.ovenExtraOffTemp)
	{
		// Oven heater is providing enough heat, no need to run electricity
		setHeater(0);
		return 0;
	}
	else if (controlTemp < getTargetTemp())
	{
		setHeater(1);
		return 1;
	}
	else if (controlTemp > getTargetTemp() + configuration.heating.tempDelta)
	{
		setHeater(0);
		// Dont stop pump until fluid temp will go down
		// Other heat sources may still be on
		return 0;
	}
	// return current state
	return getHeaterState();
}

/*
 *	Sauna floor control procedure.
 */
function controlSaunaFloor(currentFloorTemp, targetFloorTemp)
{
	var floorHeatingON = 0;
	if (isPresenceHeating() && currentFloorTemp < targetFloorTemp)
	{
		floorHeatingON = 1;
	}
	setSaunaFloor(floorHeatingON);
	return floorHeatingON;
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
