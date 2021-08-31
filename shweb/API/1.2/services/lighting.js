const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');

let houseAPI = new ShWadeAPI(config.houseAPIorigin);

const oneWireSwitches = ['streetLight250', 'fenceLight'];
const zigbeeSwitches = [
        'streetLight150', 'balconyLight', 'kitchenOverheadsLight', 'stairwayLight',
        'pantryOverheadsLight', 'hallwayOverheadsLight', 'hallwayTambourOverheadsLight', 'porchOverheadsLight',
        'hall1OverheadsMainLight', 'hall1OverheadsExtraLight', 'alyaCabinetOverheadsLight', 'dressingRoomOverheadsLight',
        'ourBedroomOverheadsLight',
        'smallChildrenRoomOverheadsLight',
        'colivingTambourOverheadsLight',
        'colivingOverheadsLight',
        'biggerChildrenRoomOverheadsLight1',
        'biggerChildrenRoomOverheadsLight2',
        'hall2OverheadsLight',
        'sashaOverheadsLight',
        'sashaTambourOverheadsLight',
        'bathroom2OverheadsLight',
        'boilerRoomOverheadsLight',
        'saunaOverheadsLight',
        'saunaUnderLight',
        'bathroom1OverheadsLight'
];

async function GetStatus()
{
        let houseStatus = await houseAPI.getStatus();

        let lightingStatusResp = new Object();

        // assign responce fields
        // 1wire
        for (o in oneWireSwitches)
                lightingStatusResp[oneWireSwitches[o]] = houseStatus.oneWireStatus.switches[oneWireSwitches[o]];

        // zigbee
        for (z in zigbeeSwitches)
                lightingStatusResp[zigbeeSwitches[z]] = houseStatus.zigbee.switches[zigbeeSwitches[z]];

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
        let lightingStatus = await GetStatus();
        lightingStatus[applianceName] = newStatus;
        return lightingStatus;
}

exports.GetStatus = GetStatus;
exports.UpdateStatus = UpdateStatus;