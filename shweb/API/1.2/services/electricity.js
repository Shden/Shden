const DB = require('mariadb');
const config = require('../config/api-config.json');
const ShWadeAPI = require('../../../../houseAPI/shwadeAPI');

let dbConnectionPool = DB.createPool(config.DBConnection);
let houseAPI = new ShWadeAPI(config.houseAPIorigin);

async function GetPowerMeterData()
{
        let status = await houseAPI.getStatus();
        return status.powerStatus;
}

async function GetPowerStatistics(days)
{
        let dbConnection = await dbConnectionPool.getConnection();
        try
        {
                return await dbConnection.query(`\
                        CALL SP_GET_POWER_STATISTICS(DATE(DATE_ADD(NOW(), INTERVAL -${days+1} DAY)), NOW());`);
        }
        finally
        {
                dbConnection.end();
        }

}

async function GetPowerConsumptionByHours(days)
{
        let dbConnection = await dbConnectionPool.getConnection();
        try
        {
                return await dbConnection.query(`\
                        SELECT DATE(time) as Date, HOUR(time) as Hour, \
                        SUM(SS)/60/1000 as ssPower \
                        FROM power \
                        WHERE time > DATE_ADD(NOW(), INTERVAL -${days} DAY) \
                        GROUP BY HOUR(time), DATE(time) \
                        ORDER BY DATE(time), HOUR(time);`);
        }
        finally
        {
                dbConnection.end();
        }
}

async function GetPowerConsumptionByDays(days)
{
        let dbConnection = await dbConnectionPool.getConnection();
        try
        {
                return await dbConnection.query(`\
                        SELECT DATE(time) as Date, \
                        SUM(SS)/60/1000 as ssPower \
                        FROM power \
                        WHERE time > DATE_ADD(NOW(), INTERVAL -${days} DAY) \
                        GROUP BY DATE(time) \
                        ORDER BY DATE(time);`);
        }
        finally
        {
                dbConnection.end();
        }
}

exports.GetPowerMeterData = GetPowerMeterData;
exports.GetPowerStatistics = GetPowerStatistics;
exports.GetPowerConsumptionByHours = GetPowerConsumptionByHours;
exports.GetPowerConsumptionByDays = GetPowerConsumptionByDays;