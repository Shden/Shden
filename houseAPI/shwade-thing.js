/* ShWade thing:
 *      - provides local REST API to report/update house status
 *      - updates AWS thing shadow to keep it in sync with ShWade state
 *      - subscribed to mqtt updates arising as result of AWS thing shadow updates
 */

const ShWadeGate = require('./gates/shwade-gate');
const express = require('express');
const awsIot = require('aws-iot-device-sdk');
const config = require('./config/shwade-thing-config.json');
const bodyParser = require('body-parser');

console.log(`1-wire runtime mode: ${config.OWDebugMode ? 'debug' : 'productive'}`);
console.log(`1-wire dry run mode: ${config.OWDryRun}`);
global.OWDebugMode = config.OWDebugMode; // Debug mode for one wire
global.OWDryRun = config.OWDryRun;

var thingCache; // keeps actual thing status

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
        if (thingCache !== undefined)
                response.json(thingCache);
        else
                ShWadeGate.getStatus().then(res => { 
                        thingCache = res;
                        response.json(res); 
                });
}

function updateShWadeStatus(request, response)
{
        console.log('Updating thing status:', request.body);
        ShWadeGate.updateStatus(request.body).then(res => { 
                thingCache = res;
                response.json(res); 
        });        
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
                ShWadeThing.subscribe('$aws/things/ShWade/shadow/update/delta');
                ShWadeThing.subscribe('$aws/things/ShWade/shadow/update');
        });

ShWadeThing
        .on('message', function(topic, payload) {
                // -- delta message => shadow on AWS was updated
                if (topic == '$aws/things/ShWade/shadow/update/delta')
                {
                        var newState = JSON.parse(payload).state;
                        console.log('Shadow update received:', JSON.stringify(newState));
                        ShWadeGate.updateStatus(newState).then((updatedStatus) => {

                                // update cache
                                thingCache = updatedStatus;
                                
                                let reportingBack = JSON.stringify({
                                        state : {
                                                reported : updatedStatus,
                                                desired : null                                       
                                                }
                                        });
                                
                                console.log('Reporting back to AWS shadow:', reportingBack);        
                                ShWadeThing.publish('$aws/things/ShWade/shadow/update', reportingBack);
                        })
                };

                // -- update message => thing was updated
                if (topic == '$aws/things/ShWade/shadow/update')
                {
                        // we only need ESP updates 
                        let update = JSON.parse(payload).state;
                        if (update.reported.ESP != null)
                        {
                                console.log('Thing update received:', JSON.stringify(update));
                                ShWadeGate.updateStatus(update);
                        }
                }
         });

// this reports IoT thing state each config.AWSShadowUpdateInteral milliseconds to update AWS shadow.
setInterval(() =>
{
        ShWadeGate.getStatus().then((status) => {
                
                // update cache
                thingCache = status;

                let payload = JSON.stringify({
                        state : {
                                reported : status
                                // desired : null                                       
                                }
                        });
                
                console.log('Updating AWS shadow:', payload);        
                ShWadeThing.publish('$aws/things/ShWade/shadow/update', payload);

        });

}, config.AWSShadowUpdateInteral);

console.log(`AWS Shadow will be updated each ${config.AWSShadowUpdateInteral} milliseconds.`)

module.exports = app; // for testing