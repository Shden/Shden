const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');

let houseAPI = new ShWadeAPI(config.houseAPIorigin);

// Returns current shutters state
async function GetShuttersState() 
{
        let houseStatus = await houseAPI.getStatus();
        return houseStatus.kinconyRelays.Shutters;
}

// Update shutters state
async function UpdateShuttersState(shuttersUpdate)
{
        let houseStatus = await houseAPI.updateStatus(shuttersUpdate);
        return houseStatus.kinconyRelays.Shutters;
}

if (typeof exports !== 'undefined')
{
        exports.GetShuttersState = GetShuttersState;
        exports.UpdateShuttersState = UpdateShuttersState;
}