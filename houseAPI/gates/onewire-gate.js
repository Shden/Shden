// Onewire file system gateway. Provides async methods to get and update 1-wire network.
var fs = require('fs');

/* Temperature sensors mapping */
const temperatureSensors = {
	heater			: "28.0AB28D020000",	/* датчик ТЭН */
	fluid_in            	: "28.BCBC6D020000",	/* жидкость на входе */
	fluid_out           	: "28.18DB6D020000",	/* жидкость на выходе */
	external         	: "28.0FF26D020000",	/* улица */
	am_bedroom              : "28.ED64B4040000",	/* комната для гостей (АМ) */
	bedroom          	: "28.99C68D020000",	/* спальня */
	cabinet          	: "28.EA09B5040000",	/* кабинет */
	kitchen          	: "28.AAC56D020000",	/* кухня */
	child_bedroom    	: "28.CFE58D020000",	/* детская (Аг) */
	bathroom_1         	: "10.AEFF8F020800",	/* ванная на 1-м этаже */
	bathroom_1_floor       	: "28.FF3545511603"	/* датчик температуры пола (душ) */
};

/* Humidity sensors mapping */
const humiditySensors = {
	bathroom_1		: "26.140A56010000"	/* датчик влажности в ванной на 1-м этаже */
};

/* Switches mapping */
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
		for (var sensor in temperatureSensors) {
			if (temperatureSensors.hasOwnProperty(sensor)) {
				stubnet[temperatureSensors[sensor]] = new Object();
				stubnet[temperatureSensors[sensor]].temperature = 0;
			}
		}

		// create humidity sensors
		for (var sensor in humiditySensors) {
			if (humiditySensors.hasOwnProperty(sensor)) {
				stubnet[humiditySensors[sensor]] = new Object();
				stubnet[humiditySensors[sensor]].humidity = 0;
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
		stubnet[temperatureSensors.heater].temperature = 44.2;
		stubnet[temperatureSensors.fluid_in].temperature = 32.6;
		stubnet[temperatureSensors.fluid_out].temperature = 42.36;
		stubnet[temperatureSensors.external].temperature = -8.2;
		stubnet[temperatureSensors.am_bedroom].temperature = 21.6;
		stubnet[temperatureSensors.bedroom].temperature = 12.44;
		stubnet[temperatureSensors.cabinet].temperature = 21.4;
		stubnet[temperatureSensors.kitchen].temperature = 23.7;
		stubnet[temperatureSensors.child_bedroom].temperature = 22.8;
		stubnet[temperatureSensors.bathroom_1].temperature = 26.1;
		stubnet[temperatureSensors.bathroom_1_floor].temperature = 27.45;

		stubnet[humiditySensors.bathroom_1].humidity = 43.62;
	}

	return global.stubnet;
}

async function getTemperatureSensorsData()
{
	// create a vector of async requests to get temperature data per temperatureSensors key
	let keys = Object.keys(temperatureSensors);
	let temperatureRequests = keys.map(sensorName => getT(temperatureSensors[sensorName]));
	
	// exec all requests and store results in the given container
	return Promise.all(temperatureRequests)
		.then(temperatureResults => 
			{
				let temperatureSensors = new Object();
				for (var i = 0; i < temperatureResults.length; i++)
				{
					temperatureSensors[keys[i]] = temperatureResults[i];
				}
				return temperatureSensors;
			});
}

async function getSwitchesState()
{
	// create a vector of async requests to get switches state per switches key
	let keys = Object.keys(switches);
	let vals = Object.values(switches);
	let switchRequests = vals.map(swch => getSwitchState(swch.address, swch.channel));
	
	// exec all requests and store results in the given container
	return Promise.all(switchRequests)
		.then(switchStates => 
			{
				let switches = new Object();
				for (var i = 0; i < switchStates.length; i++)
				{
					switches[keys[i]] = switchStates[i];
				}
				return switches;
			});
}

async function getHumiditySensorsData()
{
	// create a vector of async requests to get humidity data per humiditySensors key
	let keys = Object.keys(humiditySensors);
	let humidityRequests = keys.map(sensorName => getH(humiditySensors[sensorName]));
	
	// exec all requests and store results in the given container
	return Promise.all(humidityRequests)
		.then(humidityResults => 
			{
				let humiditySensors = new Object();
				for (var i = 0; i < humidityResults.length; i++)
				{
					humiditySensors[keys[i]] = humidityResults[i];
				}
				return humiditySensors;
			});
}


// Creates REST object representing 1-wire network state including all devices states
function getStatus()
{
	return new Promise((resolved, rejected) => {
		Promise.all([
			getTemperatureSensorsData(),
			getSwitchesState(),
			getHumiditySensorsData()
		]).then(containers => {
	
			// console.log('done2');
	
			let RESTContainer = new Object();
	
			RESTContainer.temperatureSensors = containers[0];
			RESTContainer.switches = containers[1];
			RESTContainer.humiditySensors = containers[2];
	
			resolved(RESTContainer);
		});
	})
}

// Updates 1-wire netowork devices based on the requested new state
async function updateStatus(newStatus)
{
	// console.log('onewire-gate');
	// console.log(newStatus);

	if (newStatus.switches == null)
		return getStatus();

	else return new Promise((resolved, rejected) => {	
		
		let changeRequests = new Array();
		// traverse all known switches - we do not need any unknown data to come in
		for (var sw in switches)
		{
			// this known sw might be in the new status object, only consider such items
			if (newStatus.switches[sw] != null)
			{
				// now check if change needed
				var newValue = newStatus.switches[sw];

				changeRequests.push(new Promise((resolved, rejected) => {
					let address = switches[sw].address;
					let channel = switches[sw].channel;

					getSwitchState(address, channel)
					.then(state => {
						if (state != newValue)
						{
							// only change if needed
							changeSwitch(address, channel, newValue)
								.then(resolved());
						}
						else
							// nothing to do => we are done
							resolved();
					});
					
				}));
			}
		}

		Promise.all(changeRequests).then(() => { resolved(getStatus()); });
	});
}

// Get temperature from a sensor
async function getT(sensorAddress)
{
	return getFV(sensorAddress, "temperature");
}

async function getH(sensorAddress)
{
	return getFV(sensorAddress, "humidity");
}

// Get floating point value from a sensor
async function getFV(sensorAddress, valueName)
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
async function changeSwitch(switchAddress, switchChannel, switchStatus)
{
	return new Promise((resolved, rejected) => {
		if (switchStatus != 0 && switchStatus != 1)
			rejected(`Invalid switch status change request: ${switchStatus}, rejected.`);

		if (!global.OWDryRun) {
			if (!global.OWDebugMode) {
				var valuePath = `/mnt/1wire/${switchAddress}/${switchChannel}`;
				fs.writeFile(valuePath, switchStatus, (err) => {
					if (err)
						rejected(err);
					resolved(switchStatus);
				});
			} else {
				getStubNet()[switchAddress][switchChannel] = switchStatus;
				resolved(switchStatus);
			}
		}
	});
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
	exports.getH = getH;
	exports.getSwitchState = getSwitchState;
	exports.changeSwitch = changeSwitch;
	exports.getStubNet = getStubNet;
	exports.getStatus = getStatus;
	exports.updateStatus = updateStatus;

	exports.temperatureSensors = temperatureSensors;
	exports.humiditySensors = humiditySensors;
	exports.switches = switches;
}
