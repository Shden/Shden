/* ShWade as AWS thing:
 *      - has local API to report/update house status
 *      - updates AWS thing shadow to keep it in sync with ShWade state
 *      - subscribed to mqtt updates arising as result of AWS thing shadow updates
 */

const ShWadeGate = require('./gates/shwade-gate');
const express = require('express');
const awsIot = require('aws-iot-device-sdk');
const config = require('./config/shwade-thing-config.json');
const bodyParser = require('body-parser');

global.OWDebugMode = config.OWDebugMode; // Debug mode for one wire

const app = express();

app.use(bodyParser.json());

app.route('/things/ShWade')
        .get(getShWadeStatus)
        .put(updateShWadeStatus);

app.listen(config.port, (err) => {
        if (err) {
                return console.log('ShWade House API REST server start failed: ', err);
        }
        console.log(`ShWade House API REST server is listening on port: ${config.port}.`);
});

function getShWadeStatus(request, response)
{
        ShWadeGate.getStatus()
                .then(res => { response.json(res); });
}

function updateShWadeStatus(request, response)
{
        //console.log(request.body);
        ShWadeGate.updateStatus(request.body)
                .then(res => { response.json(res); response.end(); });        
}

var ShWadeThing = awsIot.device({
        keyPath:        '.keys/f5883bf09b-private.pem.key',
        certPath:       '.keys/f5883bf09b-certificate.pem.crt',
        caPath:         '.keys/rootCA.crt',
        clientId:       'ShWade',
        host:           'a288okaq8ycyr9-ats.iot.eu-central-1.amazonaws.com',
        debug:          config["mqtt-debug"]
});

ShWadeThing
        .on('connect', function() {
                // console.log('connected');
                ShWadeThing.subscribe('$aws/things/ShWade/shadow/update/delta');
        });

ShWadeThing
        .on('message', function(topic, payload) {
                // console.log('message', topic, payload.toString());

                // -- delta message from shadow came in
                if (topic == '$aws/things/ShWade/shadow/update/delta')
                {
                        var newState = JSON.parse(payload).state;
                        console.log('Shadow update received: ');
                        console.log(JSON.stringify(newState));
                        ShWadeGate.updateStatus(newState);
                }
        });

// this reports IoT thing state each config.AWSShadowUpdateInteral milliseconds to update AWS shadow.
setInterval(() =>
{
        ShWadeGate.getStatus().then((status) => {
                
                let update = {
                        state : {
                                reported : status
                        }
                };
                let payload = JSON.stringify(update);
                
                console.log('Updating AWS shadow:\n', payload);        
                ShWadeThing.publish('$aws/things/ShWade/shadow/update', payload);

        });

}, config.AWSShadowUpdateInteral);

console.log(`AWS Shadow will be updated each ${config.AWSShadowUpdateInteral} milliseconds.`)

module.exports = app; // for testing