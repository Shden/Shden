const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');

let houseAPI = new ShWadeAPI(config.houseAPIorigin);

// Returns current house status
async function GetHouseStatus() 
{
        let houseStatus = await houseAPI.getStatus();

        // load responce model
        let houseStatusResp = require('../models/houseStatus.json');

        // assign responce fields
        houseStatusResp.climate.outTemp = houseStatus.oneWireStatus.temperatureSensors.outsideTemp;
        houseStatusResp.climate.inTemp = houseStatus.oneWireStatus.temperatureSensors.bedroom;

        houseStatusResp.mode.presence = (houseStatus.config.mode == 'presence') ? 1 : 0;
        houseStatusResp.mode.mains = houseStatus.oneWireStatus.switches.mainsSwitch;

        houseStatusResp.power = houseStatus.powerStatus;

        return houseStatusResp;
}

// Change house presence mode
async function SetHouseMode(newMode)
{
        let updateRequest = {
                oneWireStatus : {
                        switches : { }
                },
                config : {
                        mode : (newMode == 1) ? 'presence' : 'standby'
                }
        };

        if (newMode == 1) { // to presence

                updateRequest.oneWireStatus.switches.ultrasonicSwitch = 0;
                updateRequest.oneWireStatus.switches.mainsSwitch = 1;

        } else if (newMode == 0) { // to standby

                updateRequest.oneWireStatus.switches.streetLight250 = 0;
                updateRequest.oneWireStatus.switches.ultrasonicSwitch = 1;
                updateRequest.oneWireStatus.switches.mainsSwitch = 0;
                updateRequest.oneWireStatus.switches.fenceLight = 0;

        }

        await houseAPI.updateStatus(updateRequest);
        return GetHouseStatus();
}

if (typeof exports !== 'undefined')
{
        exports.GetHouseStatus = GetHouseStatus;
        exports.SetHouseMode = SetHouseMode;
}