// Onewire file system gateway. Provides async methods to get and update 1-wire network.
const { rejects } = require('assert');
var fs = require('fs');

/* Temperature sensors mapping, this should reflect actual 1-wire network devices */
const temperatureSensors = {
	kitchen_storage         : "10.AEFF8F020800",	// 1 - комната между кухней и сауной, кухонная кладовая
	sauna_ceiling		: "10.C0F48F020800", 	// 1 - сауна на потолке
	bathroom_1_floor_2 	: "10.CE0290020800",	// 1 - датчик температуры пола (унитаз)	
	boiler_room		: "28.0AB28D020000",	// 1 - температура в котельной
	outsideTemp         	: "28.0FF26D020000",	// 1 - улица 
	fluid_out           	: "28.18DB6D020000",	// 1 - теплоноситель на выходе котельной
	bedroom          	: "28.99C68D020000",	// 2 - спальня наша
	kitchen          	: "28.AAC56D020000",	// 1 - кухня
	fluid_in            	: "28.BCBC6D020000",	// 1 - теплоноситель на входе котельной
	child_bedroom    	: "28.CFE58D020000",	// 2 - детская (Аг) 
	cabinet          	: "28.EA09B5040000",	// 2 - мой кабинет 
	am_bedroom              : "28.ED64B4040000",	// 2 - комната для гостей (АМ) 
	bathroom_1_floor_1      : "28.FF3545511603"	// 1 - датчик температуры пола (душ)

};

/* Humidity sensors mapping, this should reflect actual 1-wire network devices */
const humiditySensors = {
	bathroom_1		: "26.140A56010000"	// 1 - датчик влажности в ванной
};

/* Switches mapping */
const switches = {
	saunaVentilation	: { "address" : "3A.14280D000000", "channel" : "PIO.A" },	// 1 - вентиляция в ванной
	saunaFloorSwitch       	: { "address" : "3A.14280D000000", "channel" : "PIO.B" },	// 1 - подогрев пола в ванной
	// 					3A.14EE0E000000 не используется. ключ клапана в нашей спальне
	mainsSwitch		: { "address" : "3A.35EE0E000000", "channel" : "PIO.B" },	// 1 - подача внешнего электричества
	fenceLight		: { "address" : "3A.35EE0E000000", "channel" : "PIO.A" },	// наружняя подсветка
	//					3A.3E9403000000 не используется. реле ТЭН и циркуляции	
	//					3A.4A370D000000 не работает. свет на озеро и на балконе
	streetLight250		: { "address" : "3A.B8380D000000", "channel" : "PIO.A" },	// уличный фонарь
	ultrasonicSwitch	: { "address" : "3A.C19703000000", "channel" : "PIO.B" },	// ключ ультразвук от грызунов
	
	childrenSmallSwitch    	: { "address" : "3A.CB9703000000", "channel" : "PIO.A" },	// не используется
	
	WU01			: { "address" : "29.97B511000000", "channel" : "PIO.0" },	// окно 1 вверх
	WU02			: { "address" : "29.97B511000000", "channel" : "PIO.1" },	// окно 2 вверх
	WU03			: { "address" : "29.97B511000000", "channel" : "PIO.2" },	// окно 3 вверх
	WU04			: { "address" : "29.97B511000000", "channel" : "PIO.3" },	// окно 4 вверх
	WU05			: { "address" : "29.97B511000000", "channel" : "PIO.4" },	// окно 5 вверх
	WU06			: { "address" : "29.97B511000000", "channel" : "PIO.5" },	// окно 6 вверх
	WU07			: { "address" : "29.97B511000000", "channel" : "PIO.6" },	// окно 7 вверх
	WU08			: { "address" : "29.97B511000000", "channel" : "PIO.7" },	// окно 8 вверх

	WU09			: { "address" : "29.A4B511000000", "channel" : "PIO.0" },	// окно 9 вверх
	WU10			: { "address" : "29.A4B511000000", "channel" : "PIO.1" },	// окно 10 вверх
	WU11			: { "address" : "29.A4B511000000", "channel" : "PIO.2" },	// окно 11 вверх
	WU12			: { "address" : "29.A4B511000000", "channel" : "PIO.3" },	// окно 12 вверх
	WU13			: { "address" : "29.A4B511000000", "channel" : "PIO.4" },	// окно 13 вверх
	WU14			: { "address" : "29.A4B511000000", "channel" : "PIO.5" },	// окно 14 вверх
	WU15			: { "address" : "29.A4B511000000", "channel" : "PIO.6" },	// окно 15 вверх
	WU16			: { "address" : "29.A4B511000000", "channel" : "PIO.7" },	// окно 16 вверх

	WD01			: { "address" : "29.9CB511000000", "channel" : "PIO.0" },	// окно 1 вниз
	WD02			: { "address" : "29.9CB511000000", "channel" : "PIO.1" },	// окно 2 вниз
	WD03			: { "address" : "29.9CB511000000", "channel" : "PIO.2" },	// окно 3 вниз
	WD04			: { "address" : "29.9CB511000000", "channel" : "PIO.3" },	// окно 4 вниз
	WD05			: { "address" : "29.9CB511000000", "channel" : "PIO.4" },	// окно 5 вниз
	WD06			: { "address" : "29.9CB511000000", "channel" : "PIO.5" },	// окно 6 вниз
	WD07			: { "address" : "29.9CB511000000", "channel" : "PIO.6" },	// окно 7 вниз
	WD08			: { "address" : "29.9CB511000000", "channel" : "PIO.7" },	// окно 8 вниз

	WD09			: { "address" : "29.9FB511000000", "channel" : "PIO.0" },	// окно 9 вниз
	WD10			: { "address" : "29.9FB511000000", "channel" : "PIO.1" },	// окно 10 вниз
	WD11			: { "address" : "29.9FB511000000", "channel" : "PIO.2" },	// окно 11 вниз
	WD12			: { "address" : "29.9FB511000000", "channel" : "PIO.3" },	// окно 12 вниз
	WD13			: { "address" : "29.9FB511000000", "channel" : "PIO.4" },	// окно 13 вниз
	WD14			: { "address" : "29.9FB511000000", "channel" : "PIO.5" },	// окно 14 вниз
	WD15			: { "address" : "29.9FB511000000", "channel" : "PIO.6" },	// окно 15 вниз
	WD16			: { "address" : "29.9FB511000000", "channel" : "PIO.7" }	// окно 16 вниз
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
		//stubnet[temperatureSensors.heater].temperature = 44.2;
		stubnet[temperatureSensors.fluid_in].temperature = 32.6;
		stubnet[temperatureSensors.fluid_out].temperature = 42.36;
		stubnet[temperatureSensors.outsideTemp].temperature = -8.2;
		stubnet[temperatureSensors.am_bedroom].temperature = 21.6;
		stubnet[temperatureSensors.bedroom].temperature = 12.44;
		stubnet[temperatureSensors.cabinet].temperature = 21.4;
		stubnet[temperatureSensors.kitchen].temperature = 23.7;
		stubnet[temperatureSensors.child_bedroom].temperature = 22.8;
		stubnet[temperatureSensors.kitchen_storage].temperature = 26.1;
		stubnet[temperatureSensors.bathroom_1_floor_1].temperature = 27.45;

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
async function getStatus()
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
	return new Promise((resolved, rejected) => {

		if (newStatus['temperatureSensors'] != null)
			rejected("Can't update temperatureSensors.");

		if (newStatus['humiditySensors'] != null)
			rejected("Can't update humiditySensors.");

		if (newStatus.switches == null)
			resolved(getStatus());
		
		let changeRequests = new Array();
		// traverse all known switches - we do not need any unknown data to come in
		for (var sw in switches)
		{
			// only consider a given sw item if it is in the new status object
			if (newStatus.switches[sw] != null)
			{
				changeRequests.push(new Promise((resolved, rejected) => {
					let address = switches[sw].address;
					let channel = switches[sw].channel;
					let newValue = newStatus.switches[sw];

					// now check if change needed
					getSwitchState(address, channel).then(state => {
						if (state != newValue)
							// only change if needed
							changeSwitch(address, channel, newValue).then(resolved());
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
