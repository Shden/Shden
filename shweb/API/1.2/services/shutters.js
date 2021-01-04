const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');

let houseAPI = new ShWadeAPI(config.houseAPIorigin);

// Returns current shutters state
async function GetShuttersState() 
{
        let houseStatus = await houseAPI.getStatus();
        return houseStatus.shutters;
}

// Update shutters state
async function UpdateShuttersState(shuttersUpdate)
{
        return await houseAPI.updateStatus(shuttersUpdate).shutters;
}

if (typeof exports !== 'undefined')
{
        exports.GetShuttersState = GetShuttersState;
        exports.UpdateShuttersState = UpdateShuttersState;
}