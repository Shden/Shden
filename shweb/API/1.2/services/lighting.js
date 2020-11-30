const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');

let houseAPI = new ShWadeAPI(config.houseAPIorigin);

async function GetStatus()
{
        let houseStatus = await houseAPI.getStatus();

        // load responce model
        let lightingStatusResp = require('../models/lightingStatus.json');

        // assign responce fields
        lightingStatusResp.streetLight250 = houseStatus.oneWireStatus.switches.streetLight250;
        lightingStatusResp.streetLight150 = 0; // TMP
        lightingStatusResp.balkonLight = 0; // TMP
        lightingStatusResp.fenceLight = houseStatus.oneWireStatus.switches.fenceLight;

        return lightingStatusResp;
}

async function UpdateStatus(applianceName, newStatus)
{
        let updateRequest = {
                oneWireStatus : {
                        switches : { }
                }
        };

        updateRequest.oneWireStatus.switches[applianceName] = newStatus;

        await houseAPI.updateStatus(updateRequest);
        return GetStatus();
}

exports.GetStatus = GetStatus;
exports.UpdateStatus = UpdateStatus;