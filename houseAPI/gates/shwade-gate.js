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
const baxiConnect = require('./baxi-connect-gate');

async function getStatus()
{
        return new Promise((resolved, rejected) => {
                /* Revision needed as .all raises exception if any promise was rejected.
                 * Considering usage .allSettled to provide resuls for resolved and error
                 * reasons for rejected. (?)
                 * 
                 * Changed to .allSettled on 21.10.2023, deployed to prod for testing.
                 * Q: in case of error (status: 'rejected'), should some indication be returned? 
                 */
                Promise.allSettled([
                        owg.getStatus(),
                        mercury236.getStatus(),
                        cfg.getConfig(),
                        kinconyRelays.getStatus(),
                        zigbee.getStatus(),
                        microart.getStatus(),
                        network.getStatus(),
                        baxiConnect.getBaxiStatus()
                ]).then(([
                        oneWireGateResult, powerGateResult, configGateResult, kinconyGateResult, 
                        zigbeeGateResult, mapGateResult, networkGateResult, baxiConnectGateResult
                ]) => {
                        var ShWadeStatus = {};
                        
                        if (oneWireGateResult.status === 'fulfilled')
                                ShWadeStatus.oneWireStatus = oneWireGateResult.value;
                        if (powerGateResult.status === 'fulfilled')
                                ShWadeStatus.powerStatus = powerGateResult.value;
                        if (configGateResult.status === 'fulfilled')
                                ShWadeStatus.config = configGateResult.value;
                        if (kinconyGateResult.status === 'fulfilled')
                                ShWadeStatus.kinconyRelays = kinconyGateResult.value; 
                        if (zigbeeGateResult.status === 'fulfilled')
                                ShWadeStatus.zigbee = zigbeeGateResult.value;
                        if (mapGateResult.status === 'fulfilled')
                                ShWadeStatus.map = mapGateResult.value;
                        if (networkGateResult.status === 'fulfilled')
                                ShWadeStatus.network = networkGateResult.value;
                        if (baxiConnectGateResult.status === 'fulfilled')
                                ShWadeStatus.baxiConnect = baxiConnectGateResult.value;

                        resolved(ShWadeStatus);
                });
        });
}

async function updateStatus(newStatus)
{
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