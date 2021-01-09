const mqtt = require('mqtt');
const config = require('../config/zigbee-config.json');

const mqttClient = mqtt.connect(config.mqtt);
const switchState = new Object();

mqttClient.on('connect', () => 
{
        console.log('Connected!');

        // -- switches subscriptions:
        for (var switchAlias in config.devices.switches)
        {
                switchState[switchAlias] = null;

                let sw = config.devices.switches[switchAlias];
                console.log('Subscribing to:', sw.topic);
                mqttClient.subscribe(sw.topic, (err) => {
                        if (err) 
                                console.log('Subscription error:', err);
                        mqttClient.publish(sw.topic + '/get', JSON.stringify({ state_right : '' }));
                });
        }
});

// All MQTT messages will be routed here
mqttClient.on('message', (topic, message) =>
{
        let msg = JSON.parse(message.toString());

        // lookup switches
        for (var switchAlias in config.devices.switches)
        {
                let sw = config.devices.switches[switchAlias];
                if (sw.topic === topic)
                {
                        // topic match found
                        let swState = msg[sw.channel];
                        if (swState == "ON")
                                switchState[switchAlias] = 1;
                        if (swState == "OFF")
                                switchState[switchAlias] = 0;
                        // console.log(switchState);
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
        return { switches: switchState };
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
                                let deviceValue = (requestedValue) ? "ON" : "OFF";
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