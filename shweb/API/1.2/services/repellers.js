const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');
const config = require('../config/api-config.json');

let houseAPI = new ShWadeAPI(config.houseAPIorigin);

async function GetStatus()
{
        let repellersStatus = require('../models/repellersStatus.json');
        let status = await houseAPI.getStatus();
        repellersStatus.kitchen = status.oneWireStatus.switches.ultrasonicSwitch;
        return repellersStatus;
}

async function SetStatus(newStatus)
{
        let updateRequest = {
                oneWireStatus : {
                        switches : { 
                                ultrasonicSwitch : newStatus
                        }
                }
        };
        await houseAPI.updateStatus(updateRequest);
        return GetStatus();
}

exports.GetStatus = GetStatus;
exports.SetStatus = SetStatus;