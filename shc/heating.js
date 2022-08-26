// -- Heating controller.
const numeral = require('numeral');
const pad = require('pad');
const config = require('./config/API-config.json');
const houseAPI = require('../houseAPI/shwadeAPI');
const HouseMode = require('../shweb/API/1.2/services/house').HouseMode;

const EXIT_OK		= 0;
const EXIT_FAILURE	= 1;

const CELCIUS		= '\u00B0C';
const BUILD		= '2.1';

const CMD_DRY_RUN	= 'dryRun';
const CMD_HELP		= 'help';

// -- Main logic
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

let dryRun = cmdOptions.dryRun;

printOutKV('Controller build', BUILD);
printOutKV('House API origin configuration', JSON.stringify(config.APIOrigin));
printOutKV('Dry run mode', dryRun);

// -- Start handling --
let thingAPI = new houseAPI(config.APIOrigin);

// -- Get *everything* from thingAPI
thingAPI.getStatus().then(results => {
	let saunaFloorTemp = results.oneWireStatus.temperatureSensors.bathroom_1_floor_1;
	let consumption = results.powerStatus.P.sum;
	let targetTemp = getSetPoint(results.config);

	printOutKV('Target temperature', numeral(targetTemp).format('0.00'), CELCIUS);
	printOutKV('Floor temperature', numeral(saunaFloorTemp).format('0.00'), CELCIUS);
	printOutKV('Power consumption', numeral(consumption).format('0,0'), 'W');

	// -- Control sauna floor temp
	let floorHeatingState = (saunaFloorTemp < targetTemp) ? 1 : 0;
	let currentHeatingState = results.oneWireStatus.switches.saunaFloorSwitch;
	if (!dryRun && floorHeatingState != currentHeatingState)
	{
		let updateRequest = { oneWireStatus: { switches: { saunaFloorSwitch: floorHeatingState }}};
		thingAPI.updateStatus(updateRequest).then((res) => {
			printOutKV('Floor heating changed', OnOff(res.oneWireStatus.switches.saunaFloorSwitch));

		});
	}
	else
	printOutKV('Floor heating stays the same', OnOff(currentHeatingState));
})
.catch(err => {
	printOutKV('Execution failed', err);
});
// -- End main

function printUsage()
{
	console.log('Usage:');
	console.log('  node heating.js [options]');
	console.log('  options:');
	console.log(`    --${CMD_DRY_RUN}\t- run logic but do not change anything.`);
	console.log(`    --${CMD_HELP}\t- to print this screen.`);
}

function parseCommandLine(argv)
{
	var options = [CMD_DRY_RUN, CMD_HELP];
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
		process.stdout.write(pad(30, key));
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

function getSetPoint(config)
{
	switch (config.modeId)
	{
		case HouseMode.PRESENCE_MODE:
			return config.heating.saunaFloorTemp;
		case HouseMode.SHORTTERM_STANDBY:
			return config.heating.saunaFloorTempShortStandBy;
		case HouseMode.LONGTERM_STANDBY:
			return config.heating.saunaFloorTempLongStandBy;
	}
}
