const DB = require('mariadb');
const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');
const HouseMode = require('./id').HouseMode;

let dbConnectionPool = DB.createPool(config.DBConnection);
let houseAPI = new ShWadeAPI(config.houseAPIorigin);

async function GetTempHistory(days)
{
        let dbConnection = await dbConnectionPool.getConnection();
        try
        {
                return await dbConnection.query(`\
                        SELECT DATE_FORMAT(time, "%Y-%m-%d %H:00:00") as date, \
                        AVG(external) as outTemp, (AVG(bedroom) + AVG(kitchen)) / 2 as inTemp, \
                        AVG(bedroom) as bedroom, AVG(kitchen) as kitchen, \
                        AVG(fluid_in) as heaterIn, AVG(fluid_out) as heaterOut, \
                        AVG(sauna_floor) as saunaFloor, \
                        AVG(hall_floor_1) as hall_floor_1, \
                        AVG(hall_floor_2) as hall_floor_2, \
                        AVG(hall_floor_3) as hall_floor_3 \
                        FROM heating \
                        WHERE time > DATE_ADD(NOW(), INTERVAL -${days} DAY) \
                        GROUP BY HOUR(time), DATE(time) \ 
                        ORDER BY DATE(time), HOUR(time);`);
        }
        finally
        {
                dbConnection.end();
        }
}

async function GetHumidityHistory(days)
{
        let dbConnection = await dbConnectionPool.getConnection();
        try
        {
                return await dbConnection.query(
                        (days < 2)
                        ?
                                // all datapoints for shorter time periods
                                `SELECT DATE_FORMAT(time, "%Y-%m-%d %H:%i:00") as date, bathroom \
                                FROM humidity \
                                WHERE time > DATE_ADD(NOW(), INTERVAL -${days} DAY) \
                                ORDER BY time;`
                        :
                                // avg by hours for longer time periods
                                `SELECT DATE_FORMAT(time, "%Y-%m-%d %H:%i:00") as date, AVG(bathroom) as bathroom \
                                FROM humidity \
                                WHERE time > DATE_ADD(NOW(), INTERVAL -${days} DAY) \
                                GROUP BY HOUR(time), DATE(time) \
                                ORDER BY DATE(time), HOUR(time);`

                );
        }
        finally
        {
                dbConnection.end();
        }
}

async function GetTempStatistics(days)
{
        let dbConnection = await dbConnectionPool.getConnection();
        try
        {
                return await dbConnection.query(`\
                        SELECT MIN(external), AVG(external), MAX(external), \
                        MIN(control), AVG(control), MAX(control) \
                        FROM heating WHERE time > DATE_SUB(NOW(), INTERVAL ${days} DAY);`);
        }
        finally
        {
                dbConnection.end();
        }
}

async function GetConfiguration()
{
        let houseStatus = await houseAPI.getStatus();
        // not sure is this will be needed as a separate 'heating' configuration.
        // so far will return whole config.
        return houseStatus.config;
}

async function UpdateConfiguration(config)
{
        // also as in GetHeatingConfiguration(), this will not separate 'heating' of
        // the whole configuration.
        let updateRequest = { config: config };
        return await houseAPI.updateStatus(updateRequest);
}

// Returns climate settings change object as required for house mode given.
// Currently includes floor temperature setpoint updates (sauna and hall).
async function GetModeChangeUpdate(newMode)
{
        // "config": {
        //         "mode": "presence",
        //         "heating": {
        //           "saunaFloorTemp": 28,
        //           "saunaFloorTempShortStandBy": 25,
        //           "saunaFloorTempLongStandBy": 5,
        //           "house1FloorTemp": 23,
        //           "saunaFloor": {
        //             "setPoint": 28,
        //             "settings": {
        //               "presence": 28,
        //               "shortTermStandby": 18,
        //               "longTermStandby": 5
        //             }
        //           },
        //           "hallFloor": {
        //             "setPoint": 23,
        //             "settings": {
        //               "presence": 23,
        //               "shortTermStandby": 18,
        //               "longTermStandby": 5
        //             }
        //           }
        //         },
        //         "modeDescription": "Presence mode",
        //         "modeId": 1
        //       },

        let config = await GetConfiguration();

        const zoneModeSetPoint =  (mode, zone) => {

                switch(mode) {
                        case HouseMode.PRESENCE_MODE:
                                return config.heating[zone]?.settings?.presence ?? 22;

                        case HouseMode.SHORTTERM_STANDBY:
                                return config.heating[zone]?.settings?.shortTermStandby ?? 15;

                        case HouseMode.LONGTERM_STANDBY:
                                return config.heating[zone]?.settings?.longTermStandby ?? 5;

                        default:
                                throw(`Invalid mode requested: ${mode}.`);
                }
        }
        
        let updateRequest = {
                config: {
                        heating: {
                                saunaFloor: {
                                        setPoint: zoneModeSetPoint(newMode, 'saunaFloor')
                                },
                                hallFloor: {
                                        setPoint: zoneModeSetPoint(newMode, 'hallFloor')
                                }
                        }
                }
        }

        return updateRequest;
}

/**
 * Update temperature setting for specifc appliance and mode of house.
 * Example: set hallFloor temperature for presence mode to 24 celsius.
 */
async function UpdateHeatingSetting(forApplianceName, forHouseMode, newTemperatureSetting)
{
        let updateRequest = {
                config: {
                        heating: {
                                [forApplianceName]: {
                                        settings: {
                                                [forHouseMode]: Number(newTemperatureSetting)
                                        }
                                }
                        }
                }
        };

        return await houseAPI.updateStatus(updateRequest);
}

async function SetBathVentilationOn(duration)
{
        // just turns on -- temporary implementation
        let updateRequest = {
                oneWireStatus : {
                        switches : { 
                                saunaVentilation : 1
                        }
                }
        };

        return await houseAPI.updateStatus(updateRequest);
}

exports.GetTempHistory = GetTempHistory;
exports.GetHumidityHistory = GetHumidityHistory;
exports.GetTempStatistics = GetTempStatistics;
exports.GetConfiguration = GetConfiguration;
exports.UpdateConfiguration = UpdateConfiguration;
exports.SetBathVentilationOn = SetBathVentilationOn;
exports.GetModeChangeUpdate = GetModeChangeUpdate;
exports.UpdateHeatingSetting = UpdateHeatingSetting;