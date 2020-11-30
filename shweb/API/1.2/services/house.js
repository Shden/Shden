// const DB = require('mariadb');
const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');

// let dbConnectionPool = DB.createPool(config.DBConnection);
let houseAPI = new ShWadeAPI(config.houseAPIorigin);

// Returns current house status
async function GetHouseStatus() 
{
        // let dbConnection = await dbConnectionPool.getConnection();
        // let [ presence, result2 ] = await Promise.all([
        //         dbConnection.query("SELECT time, isin FROM presence ORDER BY time desc LIMIT 1;"),
        //         dbConnection.query("SELECT external, kitchen, bedroom FROM heating WHERE time > date_sub(now(), \
        //                                 INTERVAL 5 MINUTE) order by time desc limit 1;")
        // ]);
        // dbConnection.end();

        // console.log(presence);
        // console.log(result2);

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

exports.GetHouseStatus = GetHouseStatus;
exports.SetHouseMode = SetHouseMode;