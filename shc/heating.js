// Node.js port of heating controller logic.
const ow = require('./onewire');
const p = require('./power');
const numeral = require('numeral');
const pad = require('pad');
const fs = require('fs');

// -- configuration constants:
const configurationFileName = __dirname + '/config/heating.json';

// read configuration file
var configuration = JSON.parse(fs.readFileSync(configurationFileName, 'utf8'));

const EXIT_OK			= 0;
const EXIT_FAILURE		= 1;

const CELCIUS			= '\u00B0C';
const BUILD			= '2.0';

const ON			= 1;
const OFF			= 0;

const CMD_DEBUG			= 'debug';
const CMD_DRY_RUN		= 'dryRun';
const CMD_HELP			= 'help';

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

	printOutKV('Controller build', BUILD);
	printOutKV('Started', new Date());

	// -- Start handling --
	printOutKV('OW Debug mode', global.OWDebugMode);
	printOutKV('OW Dry run mode', global.OWDryRun);


	// -- Measure current temperatures and set out the target temperature
	Promise.all([
		ow.getT(ow.sensors.saunaFloorSensor),
		getCurrentPowerConsumption()
		])
	.then(results => {
		var idx = 0;
		var saunaFloorTemp 	= results[idx++];
		var consumption 	= results[idx++];

		var targetTemp = configuration.heating.saunaFloorTemp;

		printOutKV('Target temperature',
			numeral(targetTemp).format('0.00'), CELCIUS);
		printOutKV('Floor temperature',
			numeral(saunaFloorTemp).format('0.00'), CELCIUS);
		printOutKV('Power consumption',
			numeral(consumption).format('0,0'), 'W');

		// -- Control everything
		Promise.all([

			// -- Control sauna floor temp
			controlSaunaFloor(saunaFloorTemp,
				targetTemp,
				consumption),

			// -- Individual rooms control
			configuration.roomControlDescriptors.map(function(item) {
				return controlRoom(item, targetTemp);
			})
		])
		.then(results => {
			var saunaFloorHeatingState = results[0];

			printOutKV('Floor heating',
				OnOff(saunaFloorHeatingState));
		});
	})
	.catch(err => {
		printOutKV('Execution failed', err);
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
	console.log(`    --${CMD_HELP}\t- to print this screen.`);
}

function parseCommandLine(argv)
{
	var options = [CMD_DEBUG, CMD_DRY_RUN, CMD_HELP];
	var result = new Object();

	// pass 1: check what from options in argv
	options.forEach((item) => {
		// slice(2) to skip the first two items (node and script)
		result[item] = argv.slice(2).indexOf('--' + item) != -1;
	});

	// pass 2: check if there are any unrecoginsed items
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
function printOutKV(key, value, unit)
{
	if (key != '' || value != '')
	{
		process.stdout.write(pad(25, key));
		process.stdout.write(' : ');
		process.stdout.write(
			pad(40, (' ' +
				value.toLocaleString() +
				((typeof(unit) !== 'undefined') ? unit : '')), '.'));
		process.stdout.write('\n');
	}
}

function OnOff(value)
{
	return value ? "ON" : "OFF";
}
// -- Ancillary methods

// Sauna floor control
function setSaunaFloor(ison)
{
	const sw = ow.switches.saunaFloorSwitch;
	ow.changeSwitch(sw.address, sw.channel, ison);
}

// Will eventually bring TRUE if presence heating mode
// or FALSE if standby heating mode
function isPresenceHeating()
{
	return new Promise((resolved, rejected) => {
		var now = new Date();
		var presenceStart = new Date(configuration.schedule.arrival);
		var presenceFinish = new Date(configuration.schedule.departure);
		var isPresence = now >= presenceStart && now <= presenceFinish;

		resolved(isPresence);
	});
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
	return new Promise((resolved, rejected) => {
		isPresenceHeating()
			.then((isPresence) => {
				var floorHeatingON =
					(isPresence && currentFloorTemp < targetFloorTemp)
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
	exports.isPresenceHeating = isPresenceHeating;
	exports.setSaunaFloor = setSaunaFloor;
	exports.controlRoom = controlRoom;
	exports.controlSaunaFloor = controlSaunaFloor;
	exports.getCurrentPowerConsumption = getCurrentPowerConsumption;
	exports.parseCommandLine = parseCommandLine;

	// data
	exports.configuration = configuration;
}
