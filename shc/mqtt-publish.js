const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

function publishHeatingDataPoint(dataPoint)
{
	const DEVICE_ID = "areim9bfk6muptdal791"; // heating IoT device ID

        return publishDataPoint(
                '../yc/device/heating.key',
                '../yc/device/heating.cert',
                DEVICE_ID, dataPoint);
}

function publishHumidityDataPoint(dataPoint)
{
        const DEVICE_ID = "are6dp175p84uho333u9"; // humidity IoT device ID

        return publishDataPoint(
                '../yc/device/humidity.key',
                '../yc/device/humidity.cert',
                DEVICE_ID, dataPoint);
}

// Generic for publishing data point to mqtt device events topic.
function publishDataPoint(keyFileName, certFileName, iotDeviceID, dataPoint)
{
	const DEVICE_KEY = fs.readFileSync(path.join(__dirname, keyFileName));
	const DEVICE_CERT = fs.readFileSync(path.join(__dirname, certFileName));
	const ROOT_CA = fs.readFileSync(path.join(__dirname, '../yc/rootCA.crt'));
	
	const PORT = 8883;
	const HOST = 'mqtt.cloud.yandex.net';
	
	const DEVICE_EVENTS = "$devices/" + iotDeviceID + "/events";
	
	const deviceOptions = {
		port: PORT,
		host: HOST,
		key: DEVICE_KEY,
		cert: DEVICE_CERT,
		rejectUnauthorized: true,
		ca: ROOT_CA,
		protocol: 'mqtts',
		clientId: 'ShWade'
	};

	return new Promise((resolved, rejected) => {
		device = mqtt.connect(deviceOptions);

		device.on('connect', function() {
			device.publish(DEVICE_EVENTS, JSON.stringify(dataPoint));
			device.end();
			resolved();
		})

		device.on('error', function(error) {
			rejected(error);
		})
	})
}

if (typeof exports !== 'undefined')
{
	// methods
        exports.publishHeatingDataPoint = publishHeatingDataPoint;
        exports.publishHumidityDataPoint = publishHumidityDataPoint;
}