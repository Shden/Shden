/* Gateway to all house hardware. Acts as interface and aggregator on the top of:
 *      - onewire-gate
 *      - mercury236-gate
 *      - esp8266-gate
 *      - etc.
 */ 
const owg = require('./onewire-gate');
const mercury236 = require('../gates/mercury236-gate');
const { response } = require('express');

async function getStatus()
{
        return new Promise((resolved, rejected) => {
                Promise.all([
                        owg.getStatus(),
                        mercury236.getStatus()
                ]).then(responces => {
                        var ShWadeStatus = new Object();
                        ShWadeStatus.oneWireStatus = responces[0];
                        ShWadeStatus.powerStatus = responces[1];
                        resolved(ShWadeStatus);
                });
        });
}

async function updateStatus(newStatus)
{
        // console.log('shwade-gate');
        // console.log(newStatus);

        //return owg.updateStatus(newStatus.oneWireStatus);

        return new Promise((resolved, rejected) => {
                // updateRequests = new Array();

                // if (newStatus.oneWireStatus != null)
                //         updateRequests.push(new Promise((resolved, rejected) => { 
                //                 owg.updateStatus(newStatus.oneWireStatus).then(() => resolved());
                //         }));

                Promise.all([
                        owg.updateStatus(newStatus.oneWireStatus) 
                ]).then(() => {
                        resolved(getStatus());
                });
        });
}

if (typeof exports !== 'undefined')
{
	// methods
        exports.getStatus = getStatus;
        exports.updateStatus = updateStatus;
}