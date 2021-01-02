// Node.js port of heating controller logic.
const ow = require('./onewire');
const p = require('./power');
const numeral = require('numeral');
const pad = require('pad');
const fs = require('fs');
const http = require('http');

// -- configuration constants:
const configurationFileName = __dirname + '/config/heating.json';

// read configuration file
var configuration = JSON.parse(fs.readFileSync(configurationFileName, 'utf8'));

const EXIT_OK			= 0;
const EXIT_FAILURE		= 1;

const CELCIUS			= '\u00B0C';
const BUILD			= '0.5';

const ON			= 1;
const OFF			= 0;

const CMD_DEBUG			= 'debug';
const CMD_DRY_RUN		= 'dryRun';
const CMD_HELP			= 'help';
const CMD_CSV			= 'csv';

const OutputMode = {
	CONSOLE : 0,
	LOG : 1
};

if (require.main === module)
{
	main();
}

// Main logic
function main()
{
	// -- Check the command line options
	var cmdOptions = parseCommandLine(process.argv);
	if (cmdOptions.invalid != null)
	{
		console.log('Error: Invalid command line options: ' +
			cmdOptions.invalid);
		printUsage();
		return EXIT_FAILURE;
	}
	if (cmdOptions.help)
	{
		printUsage();
		return EXIT_OK;
	}
	global.OWDebugMode = cmdOptions.debug;
	global.OWDryRun = cmdOptions.dryRun;

	var printMode = cmdOptions.csv ? OutputMode.LOG : OutputMode.CONSOLE;

	printOutKV(printMode, 'Controller build', BUILD);
	printOutKV(printMode, 'Started', new Date());

	// -- Start handling --
	printOutKV(printMode, 'OW Debug mode', global.OWDebugMode);
	printOutKV(printMode, 'OW Dry run mode', global.OWDryRun);


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
		getCurrentPowerConsumption(),
		ow.getT(ow.sensors.externalSensor),
		ow.getT(ow.sensors.amSensor),
		ow.getT(ow.sensors.bedroomSensor),
		ow.getT(ow.sensors.cabinetSensor)
		])
	.then(results => {
		var idx = 0;
		var controlTemp 	= results[idx++];
		var outgoingFluidTemp 	= results[idx++];
		var ingoingFluidTemp 	= results[idx++];
		var electricHeaterTemp	= results[idx++];
		var kitchenTemp 	= results[idx++];
		var bathroomTemp 	= results[idx++];
		var childrenSmallTemp 	= results[idx++];
		var saunaFloorTemp 	= results[idx++];
		var targetTemp 		= results[idx++];
		var consumption 	= results[idx++];
		var externalTemp 	= results[idx++];
		var amBedroomTemp 	= results[idx++];
		var bedroomTemp		= results[idx++];
		var cabinetTemp		= results[idx++];

		printOutKV(printMode, 'Target temperature',
			numeral(targetTemp).format('0.00'), CELCIUS);
		printOutKV(printMode, 'Control temperature',
			numeral(controlTemp).format('0.00'), CELCIUS);
		printOutKV(printMode, 'Sauna floor temperature',
			numeral(saunaFloorTemp).format('0.00'), CELCIUS);
		printOutKV(printMode, 'Power consumption',
			numeral(consumption).format('0,0'), 'W');

		// -- Control everything
		Promise.all([

			// -- Control sauna floor temp
			controlSaunaFloor(saunaFloorTemp,
				configuration.heating.saunaFloorTemp,
				consumption),

			// -- Individual rooms control
			configuration.roomControlDescriptors.map(function(item) {
				return controlRoom(item, targetTemp);
			})
		])
		.then(results => {
			var saunaFloorHeatingState = results[0];

			printOutKV(printMode, 'Heater', OnOff(0));	// deprecated but stay as 0 to keep CSV format now
			printOutKV(printMode, 'Sauna floor',
				OnOff(saunaFloorHeatingState));

			printOutKV(printMode, 'Pump', OnOff(0));	// deprecated but stay as 0 to keep CSV format now

			var dataPoint = {
				heater			: electricHeaterTemp,
				fluid_in		: ingoingFluidTemp,
				fluid_out		: outgoingFluidTemp,
				external		: externalTemp,
				am_bedroom		: amBedroomTemp,
				bedroom			: bedroomTemp,
				cabinet			: cabinetTemp,
				child_bedroom		: childrenSmallTemp,
				kitchen			: kitchenTemp,
				bathroom_1		: bathroomTemp,
				bathroom_1_floor	: saunaFloorTemp,
				control			: controlTemp,
				heating			: 0,	// deprecated
				pump			: 0,	// deprecated
				bathroom_1_heating	: saunaFloorHeatingState
			}
		});
	})
	.catch(err => {
		printOutKV(printMode, 'Execution failed', err);
	});
}
// -- End main

function printUsage()
{
	console.log('Usage:');
	console.log('  node heating.js [options]');
	console.log('  options:');
	console.log(`    --${CMD_DEBUG}\t- to use 1wire stub instad of real network.`);
	console.log(`    --${CMD_DRY_RUN}\t- run logic but do not change anything.`);
	console.log(`    --${CMD_CSV}\t- output format: CSV.`);
	console.log(`    --${CMD_HELP}\t- to print this screen.`);
}

function parseCommandLine(argv)
{
	var options = [CMD_DEBUG, CMD_DRY_RUN, CMD_HELP, CMD_CSV];
	var result = new Object();

	// pass 1: check what from options in argv
	options.forEach((item) => {
		// slice(2) to skip the first two items (node and script)
		result[item] = argv.slice(2).indexOf('--' + item) != -1;
	});

	// pass 2: chech if there are any unrecoginsed items
	argv.slice(2).forEach((item) => {

		// each cmd line opton should follow the format
		var xx = item.match(/-{2}(\S+)/);

		if (xx == null || xx.length < 1 || options.indexOf(xx[1]) == -1) {
			if (result.invalid == null)
				result.invalid = new Array();
			result.invalid.push(item);
		}
	});

	return result;
}

// Key-value pair print out, format depends on mode param.
function printOutKV(mode, key, value, unit)
{
	if (mode === OutputMode.CONSOLE && (key != '' || value != ''))
	{
		process.stdout.write(pad(25, key));
		process.stdout.write(' : ');
		process.stdout.write(
			pad(40, (' ' +
				value.toLocaleString() +
				((typeof(unit) !== 'undefined') ? unit : '')), '.'));
		process.stdout.write('\n');
	}
	else if (mode === OutputMode.LOG)
	{
		process.stdout.write(value.toLocaleString() + '|');
	}
}

function OnOff(value)
{
	return value ? "ON" : "OFF";
}
// -- Ancillary methods

// Returnes the temperature to be controlled.
// Might be combined measure e.g. avergage temperature etc.
function getControlTemperature()
{
	return Promise.all([
		ow.getT(ow.sensors.kitchenSensor),
		ow.getT(ow.sensors.bedroomSensor)
	])
	.then(results => {
		var kitchenTemp = results[0];
		var bedroomTemp = results[1];
		return (kitchenTemp + bedroomTemp) / 2;
	});
}

// Sauna floor control
function setSaunaFloor(ison)
{
	const sw = ow.switches.saunaFloorSwitch;
	ow.changeSwitch(sw.address, sw.channel, ison);
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
					if (isAdvanceNightHeating())
						resolved(configuration.heating.presenceTemperature)
					else
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
			.then(heatingStart => {
				var now = new Date();
				var presenceFinish = new Date(configuration.schedule.departure);
				var isPresence = now >= heatingStart && now <= presenceFinish;

				resolved(isPresence);
			});
	});
}

// Advance night heating time is taken as (configuration.heating.advanceNightHeating)
// hours from (configuration.heating.arrival). This is to simplify testing and
// logic.
function isAdvanceNightHeating()
{
	var now = new Date();
	var arrival = new Date(configuration.schedule.arrival);
	var advanceNightHeatingStart = new Date(
		arrival -
		configuration.heating.advanceNightHeating * 60 * 60 * 1000
	);

	return isSaving() &&
		now  >= advanceNightHeatingStart &&
		now <= arrival;
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
					? OFF : ON;
				ow.changeSwitch(
					roomDescr.switch.address,
					roomDescr.switch.channel,
					switchState);
					resolved();
			});
	});
}

/*
 *	Sauna floor control procedure.
 */
function controlSaunaFloor(currentFloorTemp, targetFloorTemp, consumption)
{
	// TODO: handle consumption overrun
	return new Promise((resolved, rejected) => {
		isPresenceHeating()
			.then(isPresence => {
				var floorHeatingON =
					(isPresence &&
					currentFloorTemp < targetFloorTemp)
					? ON : OFF;
				setSaunaFloor(floorHeatingON);
				resolved(floorHeatingON);
			});
	});
}

// What is the current house power consumption. To stay within power limit.
function getCurrentPowerConsumption()
{
	return new Promise((resolved, rejected) => {
		p.getPowerMeterData()
			.then(result => {
				resolved(result.P.sum)
			})
			.catch(err => {
				console.log(err);
				rejected(err);
			});

	})
}

// -- Exports for testing
// If we're running under Node,
if (typeof exports !== 'undefined')
{
	// methods
	exports.getControlTemperature = getControlTemperature;
	exports.isPresenceHeating = isPresenceHeating;
	exports.isAdvanceNightHeating = isAdvanceNightHeating;
	exports.getTargetTemp = getTargetTemp;
	exports.getHeatingTime = getHeatingTime;
	exports.getHeatingStartTime = getHeatingStartTime;
	exports.checkIfNowWithinInterval = checkIfNowWithinInterval;
	exports.setSaunaFloor = setSaunaFloor;
	exports.controlRoom = controlRoom;
	exports.controlSaunaFloor = controlSaunaFloor;
	exports.getCurrentPowerConsumption = getCurrentPowerConsumption;
	exports.parseCommandLine = parseCommandLine;

	// data
	exports.configuration = configuration;
}
