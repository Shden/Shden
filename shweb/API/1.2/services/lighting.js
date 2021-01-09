const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');

let houseAPI = new ShWadeAPI(config.houseAPIorigin);

const oneWireSwitches = ['streetLight250', 'fenceLight'];
const zigbeeSwitches = ['streetLight150', 'balconyLight'];

async function GetStatus()
{
        let houseStatus = await houseAPI.getStatus();

        // load responce model
        let lightingStatusResp = require('../models/lightingStatus.json');

        // assign responce fields
        lightingStatusResp.streetLight250 = houseStatus.oneWireStatus.switches.streetLight250;
        lightingStatusResp.streetLight150 = houseStatus.zigbee.switches.streetLight150;
        lightingStatusResp.balconyLight = houseStatus.zigbee.switches.balconyLight;
        lightingStatusResp.fenceLight = houseStatus.oneWireStatus.switches.fenceLight;

        return lightingStatusResp;
}

async function UpdateStatus(applianceName, newStatus)
{
        var updateRequest;

        // create request
        if (oneWireSwitches.includes(applianceName))
                updateRequest = { oneWireStatus : { switches : { [applianceName]: newStatus }}};
        else if (zigbeeSwitches.includes(applianceName))
                updateRequest = { zigbee : { switches : { [applianceName]: newStatus }}};

        if (updateRequest !== undefined)
                await houseAPI.updateStatus(updateRequest);
        return GetStatus();
}

exports.GetStatus = GetStatus;
exports.UpdateStatus = UpdateStatus;