// Onewire file system operations and addressing
var fs = require('fs');

/* Temperature sensors */
const sensors = {
	heaterSensor           : "28.0AB28D020000",	/* датчик ТЭН */
	externalSensor         : "28.0FF26D020000",	/* улица */
	outputSensor           : "28.18DB6D020000",	/* жидкость на выходе */
	amSensor               : "28.ED64B4040000",	/* комната для гостей (АМ) */
	inputSensor            : "28.BCBC6D020000",	/* жидкость на входе */
	bedroomSensor          : "28.99C68D020000",	/* спальня */
	//cabinetSensor          : "28.EA09B5040000",	/* кабинет */
	kitchenSensor          : "28.AAC56D020000",	/* кухня */
	childrenSmallSensor    : "28.CFE58D020000",	/* детская (Аг) */
	bathRoomSensor         : "10.AEFF8F020800",	/* ванная на 1-м этаже */
	saunaFloorSensor       : "28.FF3545511603"	/* датчик температуры пола (душ) */
};

/* Switches */
const switches = {
	saunaFloorSwitch       : { "address" : "3A.14280D000000", "channel" : "PIO.B"},
	childrenSmallSwitch    : { "address" : "3A.CB9703000000", "channel" : "PIO.A"}
};

// Creates stubnet with all sensor and switches if not yet created.
function getStubNet()
{
	if (global.stubnet == null && global.OWDebugMode)
	{
		global.stubnet = new Object();
		var stubnet = global.stubnet;

		// create temperature sensors
		for (var sensor in sensors) {
			if (sensors.hasOwnProperty(sensor)) {
				stubnet[sensors[sensor]] = new Object();
				stubnet[sensors[sensor]].temperature = 0;
			}
		}

		// create switches
		for (var sw in switches) {
			if (switches.hasOwnProperty(sw)) {
				if (stubnet[switches[sw].address] == null)
					stubnet[switches[sw].address] = new Object();
				stubnet[switches[sw].address][switches[sw].channel] = 0;
			}
		}

		// initialization
		stubnet[sensors.heaterSensor].temperature = 44.2;
		stubnet[sensors.externalSensor].temperature = -8.2;
		stubnet[sensors.outputSensor].temperature = 42.36;
		stubnet[sensors.amSensor].temperature = 21.6;
		stubnet[sensors.inputSensor].temperature = 32.6;
		stubnet[sensors.bedroomSensor].temperature = 12.44;
		stubnet[sensors.cabinetSensor].temperature = 21.4;
		stubnet[sensors.kitchenSensor].temperature = 23.7;
		stubnet[sensors.childrenSmallSensor].temperature = 22.8;
		stubnet[sensors.bathRoomSensor].temperature = 26.1;
		stubnet[sensors.saunaFloorSensor].temperature = 27.45;
	}

	return global.stubnet;
}

// Get temperature from a sensor
function getT(sensorAddress)
{
	return getFV(sensorAddress, "temperature");
}

// Get floating point value from a sensor
function getFV(sensorAddress, valueName)
{
	return new Promise((resolved, rejected) => {
		if (!global.OWDebugMode) {
			var valuePath = `/mnt/1wire/${sensorAddress}/${valueName}`;
			fs.readFile(valuePath, (err, data) => {
				if (err)
					rejected(err);
				resolved(parseFloat(data));
			});
		} else {
			resolved(getStubNet()[sensorAddress][valueName]);
		}
	});
}

// Change switch state
function changeSwitch(switchAddress, switchChannel, switchStatus)
{
	if (switchStatus != 0 && switchStatus != 1)
		throw "Invalid switch status: " + switchStatus;

	if (!global.OWDryRun) {
		if (!global.OWDebugMode) {
			var valuePath = `/mnt/1wire/${switchAddress}/${switchChannel}`;
			fs.writeFileSync(valuePath, switchStatus);
		} else {
			getStubNet()[switchAddress][switchChannel] = switchStatus;
		}
	}
}

// Get switch state
function getSwitchState(switchAddress, switchChannel)
{
	return getFV(switchAddress, switchChannel);
}

if (typeof exports !== 'undefined')
{
	// methods
	exports.getT = getT;
	exports.getSwitchState = getSwitchState;
	exports.changeSwitch = changeSwitch;
	exports.getStubNet = getStubNet;

	exports.sensors = sensors;
	exports.switches = switches;
}
