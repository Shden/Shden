const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');

let houseAPI = new ShWadeAPI(config.houseAPIorigin);

const oneWireSwitches = ['heatingPressureValve'];
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
        'bathroom1OverheadsLight',
        'denisCabinetOverheadsLight',
        'garageOverheadsLight',
        'garageAwningLight',
        'hall1FloorLamp'
];
const houseMainFuseBoxSwitches = ['R12_fenceLight', 'R13_facadeLight', 'R15_streetLight250'];

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

        // HouseMainFuseBoxSwitches
        for (h in houseMainFuseBoxSwitches)
                lightingStatusResp[houseMainFuseBoxSwitches[h]] = houseStatus.kinconyRelays.Relays.House.MainFuseBox[houseMainFuseBoxSwitches[h]];

        return lightingStatusResp;
}

async function ChangeStatus(applianceName, newStatus)
{
        var updateRequest;

        // create request
        if (oneWireSwitches.includes(applianceName))
                updateRequest = { oneWireStatus : { switches : { [applianceName]: newStatus }}};
        else if (zigbeeSwitches.includes(applianceName))
                updateRequest = { zigbee : { switches : { [applianceName]: newStatus }}};
        else if (houseMainFuseBoxSwitches.includes(applianceName))
                updateRequest = { kinconyRelays : { Relays : { House : { MainFuseBox : { [applianceName]: newStatus }}}}};

        if (updateRequest !== undefined)
                await houseAPI.updateStatus(updateRequest);

        // AWS shadow has some latency on update. This is a workaround.
        let lightingStatus = await GetStatus();
        lightingStatus[applianceName] = newStatus;
        return lightingStatus;
}

exports.GetStatus = GetStatus;
exports.ChangeStatus = ChangeStatus;