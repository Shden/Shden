const mqtt = require('mqtt');
const config = require('../config/zigbee-config.json');

// house modes enumeration
const SwitchState = Object.freeze({ 
        ON : 'ON',
        OFF : 'OFF' 
});

const mqttClient = mqtt.connect(config.mqtt);
const switchState = new Object();
const temperatureSensors = new Object();

mqttClient.on('connect', () => 
{
        console.log('Connected to zigbee mqtt broker:', config.mqtt);

        // -- switches subscriptions:
        for (var switchAlias in config.devices.switches)
        {
                switchState[switchAlias] = null;

                let sw = config.devices.switches[switchAlias];
                console.log('Subscribing to the switch topic:', sw.topic);
                mqttClient.subscribe(sw.topic, (err) => {
                        if (err) 
                                console.log('Subscription error:', err);
                        mqttClient.publish(sw.topic + '/get', JSON.stringify({ [sw.channel] : '' }));
                });
        }

        // -- temperature sensors subscriptions:
        for (var sensorAlias in config.devices.sensors)
        {
                temperatureSensors[sensorAlias] = null;

                let s = config.devices.sensors[sensorAlias];
                console.log('Subscribing to the temperature sensor topic:', s.topic);
                mqttClient.subscribe(s.topic, (err) => {
                        if (err)
                                console.log('Subscription error:', err);
                });
        }
});

// All MQTT messages will be routed here
mqttClient.on('message', (topic, message) =>
{
        let msg = JSON.parse(message.toString());

        // -- lookup switches
        for (var switchAlias in config.devices.switches)
        {
                let sw = config.devices.switches[switchAlias];
                if (sw.topic === topic)
                {
                        // topic match found
                        let swState = msg[sw.channel];
                        if (swState == SwitchState.ON)
                                switchState[switchAlias] = 1;
                        if (swState == SwitchState.OFF)
                                switchState[switchAlias] = 0;
                        // console.log(switchState);
                }
        }

        // -- lookup temperature sensors
        for (var sensorAlias in config.devices.sensors)
        {
                let s = config.devices.sensors[sensorAlias];
                if (s.topic === topic)
                {
                        const temperatureUpdate = msg[s.field];
                        temperatureSensors[sensorAlias] = temperatureUpdate;
                        console.log('Temperature update:', topic, temperatureUpdate);
                }
        }
});

function tearDown()
{
        mqttClient.end(true);
}

// Returns zigbee devices accumulated states
async function getStatus()
{
        return { 
                switches: switchState, 
                temperatureSensors: temperatureSensors 
        };
}

// Update zigbee devices as requested
async function updateStatus(updateRequest)
{
        // traverse all switches in the request
        for (var switchAlias in updateRequest.switches)
        {
                let requestedValue = Number(updateRequest.switches[switchAlias]);
                if (!isNaN(requestedValue) && (requestedValue == 0 || requestedValue == 1))
                {
                        let switchConfig = config.devices.switches[switchAlias];
                        if (switchConfig !== undefined)
                        {
                                let deviceValue = (requestedValue) ? SwitchState.ON : SwitchState.OFF;
                                mqttClient.publish(switchConfig.topic + '/set', JSON.stringify({ [switchConfig.channel]: deviceValue}));
                        }
                }
        }
}


if (typeof exports !== 'undefined')
{
        exports.getStatus = getStatus;
        exports.updateStatus = updateStatus;
        exports.tearDown = tearDown;
}