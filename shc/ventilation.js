var fs = require('fs');

// -- configuration constants:
var bathRoomHumiditySensor = '/mnt/1wire/26.140A56010000/humidity';
var bathVentilationSwitch = '/mnt/1wire/3A.14280D000000/PIO.A';
// var bathRoomHumiditySensor = __dirname + '/test/humidity.dat';
// var bathVentilationSwitch = __dirname + '/test/switch.dat';
var configurationFileName = __dirname + '/ventilation_config/ventilation.json';

// read configuration from configuration file
var configuration = JSON.parse(fs.readFileSync(configurationFileName, 'utf8'));

// then get humidity
var humidity = getHumidity();

// update EMA humidity in the configuration
configuration.EMA = EMA(configuration.EMA_steps, configuration.EMA, humidity);

// call ventilation control code and write out log data
// Log format:
// 2016-05-12 22:42:03|43.73|0
console.log(
	new Date().toISOString() + '|' + 
	humidity.toPrecision(4) + '|' + 
	controlBathVentilation(humidity) + '|' +
	configuration.EMA.toPrecision(4)
);
	
// update configuration file with new EMA humidity
fs.writeFileSync(configurationFileName, JSON.stringify(configuration, null, 4));

function getHumidity()
{
	return parseFloat(fs.readFileSync(bathRoomHumiditySensor, 'utf8'));
}

function controlBathVentilation(humidity)
{
	if (humidity < configuration.EMA + configuration.off_threshold)
	{
		// -- off
		changeSwitch(bathVentilationSwitch, 0);
		return 0;
	}
	else if (humidity > configuration.EMA + configuration.on_threshold)
	{
		// -- on
		changeSwitch(bathVentilationSwitch, 1);
		return 1;
	}
	// No change
	return 2;
}

function changeSwitch(switchAddress, switchStatus)
{
	if (switchStatus != 0 && switchStatus != 1)
		throw "Invalid switch status: " + switchStatus;
	
	fs.writeFileSync(switchAddress, switchStatus);
}

// Exponential moving average as follows:
// EMA[k, n] = EMA[k-1, n]+(2/(n+1))·(P-EMA[k-1, n])
function EMA(n, previousEMA, currentValue)
{
	return previousEMA + 2/(n+1) * (currentValue - previousEMA);
}