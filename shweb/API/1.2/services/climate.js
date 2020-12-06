const DB = require('mariadb');
const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');

let dbConnectionPool = DB.createPool(config.DBConnection);
let houseAPI = new ShWadeAPI(config.houseAPIorigin);

async function GetTempHistory(days)
{
        let dbConnection = await dbConnectionPool.getConnection();
        try
        {
                return await dbConnection.query(`\
                        SELECT DATE(time) as Date, HOUR(time) as Hour, \
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
                                `SELECT DATE(time) as Date, HOUR(time) as Hour, MINUTE(time) as Minute, bathroom \
                                FROM humidity \
                                WHERE time > DATE_ADD(NOW(), INTERVAL -${days} DAY) \
                                ORDER BY time;`
                        :
                                // avg by hours for longer time periods
                                `SELECT DATE(time) as Date, HOUR(time) as Hour, 0 as Minute, AVG(bathroom) as bathroom \
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

async function GetHeatingSchedule()
{
        function getConfigDate(status, name)
        {
                if (status !== undefined && status.config !== undefined && status.config.schedule !== undefined)
                        return status.config.schedule[name];
                return new Date(0);
        }

        let houseStatus = await houseAPI.getStatus();
        let schedule = require('../models/heatingSchedule.json');

        schedule.from = getConfigDate(houseStatus, 'arrival');
        schedule.to = getConfigDate(houseStatus, 'departure');
        schedule.active = (schedule.to > new Date()) ? 1 : 0;

        return schedule;
}

async function SetHeatingSchedlue(arrival, departure)
{
        let configUpdate = {
                config: {
                        schedule: {
                                arrival: arrival,
                                departure: departure
                        }
                }
        };

        await houseAPI.updateStatus(configUpdate);
        return await GetHeatingSchedule();
}

async function GetHeatingConfiguration()
{
        let houseStatus = await houseAPI.getStatus();
        // not sure is this will be needed as a separate 'heating' configuration.
        // so far will return whole config.
        return houseStatus.config;
}

async function UpdateHeatingConfiguration(config)
{
        // also as in GetHeatingConfiguration(), this will not separate 'heating' of
        // the whole configuration.
         return await houseAPI.updateStatus(config);
}

exports.GetTempHistory = GetTempHistory;
exports.GetHumidityHistory = GetHumidityHistory;
exports.GetTempStatistics = GetTempStatistics;
exports.GetHeatingSchedule = GetHeatingSchedule;
exports.SetHeatingSchedlue = SetHeatingSchedlue;
exports.GetHeatingConfiguration = GetHeatingConfiguration;
exports.UpdateHeatingConfiguration = UpdateHeatingConfiguration;