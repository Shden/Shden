const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');

let houseAPI = new ShWadeAPI(config.houseAPIorigin);

// Returns current relays state REST object
async function GetRelaysState() 
{
        let houseStatus = await houseAPI.getStatus();
        return houseStatus.kinconyRelays.Relays;
}

// Returns current shutters state
async function GetShuttersState() 
{
        let houseStatus = await houseAPI.getStatus();
        return houseStatus.kinconyRelays.Shutters;
}

// Update relays or shutters state
async function UpdateState(relaysUpdate)
{
        let kinconyUpdate = { kinconyRelays : relaysUpdate }; 
        let houseStatus = await houseAPI.updateStatus(kinconyUpdate);
        return houseStatus.kinconyRelays;
}

if (typeof exports !== 'undefined')
{
        exports.GetRelaysState = GetRelaysState;
        exports.GetShuttersState = GetShuttersState;
        exports.UpdateState = UpdateState;
}