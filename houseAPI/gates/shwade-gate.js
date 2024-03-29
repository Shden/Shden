/* Gateway to all house hardware. Acts as interface and aggregator on the top of:
 *      - onewire-gate
 *      - config-gate
 *      - mercury236-gate
 *      - kincony-relays-gate
 *      - zigbee-gate
 *      - mapmicroart-gate
 *      - etc.
 */ 
const owg = require('./onewire-gate');
const cfg = require('./config-gate');
const mercury236 = require('../gates/mercury236-gate');
const kinconyRelays = require('./kincony-relays-gate');
const zigbee = require('./zigbee-gate');
const microart = require('./mapmicroart-gate');
const network = require('./network-gate');
const { response } = require('express');

async function getStatus()
{
        return new Promise((resolved, rejected) => {
                /* Review needed after a while.
                 * With .all this raises exception if any promise was rejected.
                 * Considering usage .allSettled to provide resuls for resolved and error
                 * reasons for rejected. (?)
                 */
                Promise.all([
                        owg.getStatus(),
                        mercury236.getStatus(),
                        cfg.getConfig(),
                        kinconyRelays.getStatus(),
                        zigbee.getStatus(),
                        microart.getStatus(),
                        network.getStatus()
                ]).then(responces => {
                        var ShWadeStatus = new Object();
                        ShWadeStatus.oneWireStatus = responces[0];
                        ShWadeStatus.powerStatus = responces[1];
                        ShWadeStatus.config = responces[2];
                        ShWadeStatus.kinconyRelays = responces[3]; 
                        ShWadeStatus.zigbee = responces[4];
                        ShWadeStatus.map = responces[5];
                        ShWadeStatus.network = responces[6];
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
        if (newStatus.kinconyRelays != null)
                await kinconyRelays.updateStatus(newStatus.kinconyRelays);
        if (newStatus.zigbee != null)
                await zigbee.updateStatus(newStatus.zigbee);

        return getStatus();
}

if (typeof exports !== 'undefined')
{
	// methods
        exports.getStatus = getStatus;
        exports.updateStatus = updateStatus;
}