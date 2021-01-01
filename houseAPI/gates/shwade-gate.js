/* Gateway to all house hardware. Acts as interface and aggregator on the top of:
 *      - onewire-gate
 *      - config-gate
 *      - mercury236-gate
 *      - esp8266-gate (maybe in the future)
 *      - shutters-gate
 *      - etc.
 */ 
const owg = require('./onewire-gate');
const cfg = require('./config-gate');
const mercury236 = require('../gates/mercury236-gate');
const shutters = require('./shutters-gate');
const { response } = require('express');

async function getStatus()
{
        return new Promise((resolved, rejected) => {
                Promise.all([
                        owg.getStatus(),
                        mercury236.getStatus(),
                        cfg.getConfig(),
                        shutters.getStatus()
                ]).then(responces => {
                        var ShWadeStatus = new Object();
                        ShWadeStatus.oneWireStatus = responces[0];
                        ShWadeStatus.powerStatus = responces[1];
                        ShWadeStatus.config = responces[2];
                        ShWadeStatus.shutters = responces[3]; 
                        resolved(ShWadeStatus);
                });
        });
}

async function updateStatus(newStatus)
{
        // console.log('shwade-gate');
        // console.log(newStatus);

        if (newStatus.oneWireStatus != null)
                await owg.updateStatus(newStatus.oneWireStatus);
        if (newStatus.config != null)
                await cfg.updateConfig(newStatus.config);

        return getStatus();
}

if (typeof exports !== 'undefined')
{
	// methods
        exports.getStatus = getStatus;
        exports.updateStatus = updateStatus;
}