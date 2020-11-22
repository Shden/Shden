// Recorder fetches house data using ShWade API to persist live data to DB
const config = require('./config/recorder-config.json');
const houseAPI = require('../houseAPI/shwadeAPI');
const DB = require('mariadb');

console.info(`Recording interval is set to each ${config.RecordingIntervalSec} seconds.`);
console.info(`House API origin configuration: ${JSON.stringify(config.APIOrigin)}`);

let thingAPI = new houseAPI(config.APIOrigin);
let DBConnectionPool = DB.createPool(config.DBConnection);

// API data persisting loop
setInterval(() => {
        console.info('Update started...');
        
        thingAPI.getStatus().then(dataPoint => {
                Promise.all([
                        persistHeatingData(DBConnectionPool, dataPoint.oneWireStatus),
                        persistHumidityData(DBConnectionPool, dataPoint.oneWireStatus),
                        persistPowerData(DBConnectionPool, dataPoint.powerStatus)
                ])
                .then(() => {
                        console.info('updated.');
                })
                .catch(err => {
                        console.error(err);
                })
        })
}, config.RecordingIntervalSec * 1000);

function persistHeatingData(dbConnectionPool, dataPoint)
{
        return new Promise((resolved, rejected) => {
                dbConnectionPool.getConnection().then(dbConnection => {
                        dbConnectionPool.query(
                                "CALL SP_ADD_HEATING_RECORD(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", 
                                [
                                                                                                // SP_ADD_HEATING_RECORD params:
                                        null,                                                   // 1 - heater (not used)
                                        dataPoint.temperatureSensors.fluid_in,                  // 2 - fluid_in
                                        dataPoint.temperatureSensors.fluid_out,                 // 3 - fluid_out
                                        dataPoint.temperatureSensors.outsideTemp,               // 4 - external
                                        dataPoint.temperatureSensors.am_bedroom,                // 5 - am_bedroom
                                        dataPoint.temperatureSensors.bedroom,                   // 6 - bedroom
                                        dataPoint.temperatureSensors.cabinet,                   // 7 - cabinet
                                        dataPoint.temperatureSensors.child_bedroom,             // 8 - child_bedroom
                                        dataPoint.temperatureSensors.kitchen,                   // 9 - kitchen
                                        dataPoint.temperatureSensors.sauna_ceiling,             // 10 - bathroom_1
                                        dataPoint.temperatureSensors.bathroom_1_floor_1,        // 11 - bathroom_1_floor
                                        null,                                                   // 12 - control (not used)
                                        null,                                                   // 13 - heatingOn (not used)
                                        null,                                                   // 14 - pumpOn (not used)
                                        dataPoint.switches.saunaFloorSwitch                     // 15 - bathroom_1_heatingOn
                                ]
                        ).then(() => {
                                dbConnection.end();
                                resolved();              
                        });
                }).catch(err => {
                        //handle error
                        console.log(err); 
                        dbConnection.end();
                        rejected(err);
                });
        });
}

function persistHumidityData(dbConnectionPool, dataPoint)
{
        return new Promise((resolved, rejected) => {
                dbConnectionPool.getConnection().then(dbConnection => {
                        dbConnectionPool.query(
                                "CALL SP_ADD_HUMIDITY_RECORD(?);", [dataPoint.humiditySensors.bathroom_1]
                        ).then(() => {
                                dbConnection.end();
                                resolved();              
                        })
                }).catch(err => {
                        //handle error
                        console.log(err); 
                        dbConnection.end();
                        rejected(err);
                })
        })  
}

function persistPowerData(dbConnectionPool, dataPoint)
{
        return new Promise((resolved, rejected) => {
                dbConnectionPool.getConnection().then(dbConnection => {
                        dbConnectionPool.query(
                                "CALL SP_ADD_POWER_RECORD(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", [
                                        dataPoint.U.p1, 
                                        dataPoint.U.p2, 
                                        dataPoint.U.p3,

                                        dataPoint.I.p1, 
                                        dataPoint.I.p2, 
                                        dataPoint.I.p3,

                                        dataPoint.P.p1, 
                                        dataPoint.P.p2, 
                                        dataPoint.P.p3, 
                                        dataPoint.P.sum,

                                        dataPoint.S.p1, 
                                        dataPoint.S.p2, 
                                        dataPoint.S.p3, 
                                        dataPoint.S.sum,

                                        dataPoint.mainsStatus
                                ]
                        ).then(() => {
                                dbConnection.end();
                                resolved();
                        })
                }).catch(err => {
                       //handle error
                       console.log(err); 
                       dbConnection.end();
                       rejected(err);
                })
        })
}

if (typeof exports !== 'undefined')
{
        // check methods
        exports.persistHeatingData = persistHeatingData;
        exports.persistPowerData = persistPowerData;
        exports.persistHumidityData = persistHumidityData;

        // check properties for testing
        exports.thingAPI = thingAPI;
        exports.DBConnectionPool = DBConnectionPool;
}