const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');

let houseAPI = new ShWadeAPI(config.houseAPIorigin);

const oneWireSwitches = ['streetLight250', 'fenceLight'];
const zigbeeSwitches = ['streetLight150', 'balconyLight', 'kitchenOverheadsLight', 'stairwayLight'];

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
        lightingStatusResp.kitchenOverheadsLight = houseStatus.zigbee.switches.kitchenOverheadsLight;
        lightingStatusResp.stairwayLight = houseStatus.zigbee.switches.stairwayLight;

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

        // AWS shadow has some latency on update. This is a workaround.
        let lightingStatus = GetStatus();
        lightingStatus[applianceName] = newStatus;
        return lightingStatus;
}

exports.GetStatus = GetStatus;
exports.UpdateStatus = UpdateStatus;