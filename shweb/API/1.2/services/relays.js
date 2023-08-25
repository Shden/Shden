const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');

let houseAPI = new ShWadeAPI(config.houseAPIorigin);

// Returns complete current relays state REST object
async function GetRelaysState() 
{
        let houseStatus = await houseAPI.getStatus();
        return houseStatus.kinconyRelays;
}

// Returns current shutters state, which is a subset of relays data
async function GetShuttersState() 
{
        let houseStatus = await houseAPI.getStatus();
        return houseStatus.kinconyRelays.Shutters;
}

// Update relays state
async function UpdateRelaysState(relaysUpdate)
{
        let houseStatus = await houseAPI.updateStatus(relaysUpdate);
        return houseStatus.kinconyRelays;
}

// Update shutters state
async function UpdateShuttersState(shuttersUpdate)
{
        let relaysUpdate = { kinconyRelays : shuttersUpdate };
        return this.UpdateRelaysState(relaysUpdate);
}

if (typeof exports !== 'undefined')
{
        exports.GetRelaysState = GetRelaysState;
        exports.GetShuttersState = GetShuttersState;
        exports.UpdateRelaysState = UpdateRelaysState;
        exports.UpdateShuttersState = UpdateShuttersState;
}