const fs = require('fs');
const config = require('./config/API-config.json');
const houseAPI = require('../houseAPI/shwadeAPI');

// -- configuration constants:
const configurationFileName = __dirname + '/config/ventilation.json';

// -- Start handling --
let thingAPI = new houseAPI(config.APIOrigin);

// read configuration from configuration file
let configuration = JSON.parse(fs.readFileSync(configurationFileName, 'utf8'));

// -- Get current house status from thingAPI
thingAPI.getStatus().then(result => {

	let humidity = result.oneWireStatus.humiditySensors.bathroom_1;
	console.log('Current humidity:', humidity);

	// update EMA humidity in the configuration
	configuration.EMA = EMA(configuration.EMA_steps, configuration.EMA, humidity);

	// update configuration file with new EMA humidity
	fs.writeFileSync(configurationFileName, JSON.stringify(configuration, null, 4));

	// call ventilation control code
	if (humidity < configuration.EMA + configuration.off_threshold)
		// -- turn ventilation off
		thingAPI.updateStatus({ oneWireStatus: { switches: { saunaVentilation: 0 }}}).then(res => {
			console.log('Turning ventilation off', res.oneWireStatus.switches.saunaVentilation);
		});
	else if (humidity > configuration.EMA + configuration.on_threshold)
	{
		// -- turn ventilation on
		thingAPI.updateStatus({ oneWireStatus: { switches: { saunaVentilation: 1 }}}).then(res => {
			console.log('Turning ventilation on', res.oneWireStatus.switches.saunaVentilation);
		});
	}
});

// Exponential moving average as follows:
// EMA[k, n] = EMA[k-1, n]+(2/(n+1))·(P-EMA[k-1, n])
function EMA(n, previousEMA, currentValue)
{
	return previousEMA + 2/(n+1) * (currentValue - previousEMA);
}
