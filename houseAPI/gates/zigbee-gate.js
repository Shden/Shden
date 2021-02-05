const mqtt = require('mqtt');
const config = require('../config/zigbee-config.json');

// house modes enumeration
const SwitchState = Object.freeze({ 
        ON : 'ON',
        OFF : 'OFF' 
});

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
                console.log('Subscribing to switch:', sw.topic);
                mqttClient.subscribe(sw.topic, (err) => {
                        if (err) 
                                console.log('Subscription error:', err);
                        mqttClient.publish(sw.topic + '/get', JSON.stringify({ [sw.channel] : '' }));
                });
        }

        // -- presence sensors:
        for (var sensorAlias in config.devices.sensors)
        {
                let sn = config.devices.sensors[sensorAlias];
                console.log('Subscribing to sensor:', sn.topic);
                mqttClient.subscribe(sn.topic, (err) => {
                        if (err) 
                                console.log('Subscription error:', err);
                })
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

        // -- lookup sensors
        for (var sensorAlias in config.devices.sensors)
        {
                let sn = config.devices.sensors[sensorAlias];
                if (sn.topic === topic)
                {
                        // -- traverse all dependend switches and turn on/off each
                        let dependentSwitches = sn.controls;
                        for (var depSwIndex in dependentSwitches)
                        {
                                let depSwName = dependentSwitches[depSwIndex];
                                let sw = config.devices.switches[depSwName];

                                let swToState = msg.occupancy ? SwitchState.ON : SwitchState.OFF;
                                let swFromState = switchState[depSwName] == 1 ? SwitchState.ON : SwitchState.OFF;
                                
                                if (sw !== undefined && swToState != swFromState && sn.illuminanceThreshold < msg.illuminance)
                                {
                                        mqttClient.publish(
                                                sw.topic + '/set',
                                                JSON.stringify({ [sw.channel]: swToState })
                                        )
                                }
                                else
                                        console.log('Invalid dependent switch name specifed:', depSwName);
                        }
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