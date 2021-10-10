const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');

let houseAPI = new ShWadeAPI(config.houseAPIorigin);

const GATE_DELAY = 20000; // 20 sec

function sleep(ms) 
{
        return new Promise(resolve => setTimeout(resolve, ms));
}

async function Open(gatewayName)
{
        if ('gateA' === gatewayName) {
                const updateRequest = { zigbee : { switches : { gateACloseSignal: 0, gateAOpenSignal: 1 } } };
                console.log(updateRequest);
                await houseAPI.updateStatus(updateRequest);
                await sleep(GATE_DELAY);
                updateRequest.zigbee.switches.gateAOpenSignal = 0;
                return await houseAPI.updateStatus(updateRequest);
        }
}

async function Close(gatewayName)
{
        if ('gateA' === gatewayName) {
                const updateRequest = { zigbee : { switches : { gateAOpenSignal: 0, gateACloseSignal: 1 } } };
                await houseAPI.updateStatus(updateRequest);
                await sleep(GATE_DELAY);
                updateRequest.zigbee.switches.gateACloseSignal = 0;
                return await houseAPI.updateStatus(updateRequest);
        }
}

exports.Open = Open;
exports.Close = Close;