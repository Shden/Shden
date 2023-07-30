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
                        persistHeatingData(DBConnectionPool, dataPoint),
                        persistHumidityData(DBConnectionPool, dataPoint.oneWireStatus),
                        persistPowerData(DBConnectionPool, dataPoint.powerStatus),
                        persistNetworkData(DBConnectionPool, dataPoint.network)
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
                                "CALL SP_ADD_HEATING_RECORD(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", 
                                [
                                                                                                        // SP_ADD_HEATING_RECORD params:
                                        null,                                                           // 1 - heater (not used)
                                        dataPoint.oneWireStatus.temperatureSensors.fluid_in,            // 2 - fluid_in
                                        dataPoint.oneWireStatus.temperatureSensors.fluid_out,           // 3 - fluid_out
                                        dataPoint.oneWireStatus.temperatureSensors.outsideTemp,         // 4 - external
                                        dataPoint.oneWireStatus.temperatureSensors.am_bedroom,          // 5 - am_bedroom
                                        dataPoint.oneWireStatus.temperatureSensors.bedroom,             // 6 - bedroom
                                        dataPoint.zigbee.temperatureSensors.cabinet,                    // 7 - cabinet
                                        dataPoint.oneWireStatus.temperatureSensors.child_bedroom,       // 8 - child_bedroom
                                        dataPoint.oneWireStatus.temperatureSensors.kitchen,             // 9 - kitchen
                                        dataPoint.oneWireStatus.temperatureSensors.sauna_ceiling,       // 10 - bathroom_1
                                        dataPoint.oneWireStatus.temperatureSensors.bathroom_1_floor_1   // 11 - bathroom_1_floor
                                ]
                        ).then(() => {
                                dbConnection.end();
                                resolved();              
                        }).catch(err => {
                                //handle error
                                console.log(err); 
                                dbConnection.end();
                                rejected(err);
                        });
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
                        }).catch(err => {
                                //handle error
                                console.log(err); 
                                dbConnection.end();
                                rejected(err);
                        });
                });
        }); 
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
                        }).catch(err => {
                                //handle error
                                console.log(err); 
                                dbConnection.end();
                                rejected(err);
                        });
                });
        });
}

function persistNetworkData(dbConnectionPool, dataPoint)
{
        return new Promise((resolved, rejected) => {
                dbConnectionPool.getConnection().then(dbConnection => {
                        dbConnectionPool.query(
                                "CALL SP_ADD_NETWORK_RECORD(?, ?, ?, ?);", 
                                [
                                        dataPoint.ping.google,
                                        dataPoint.ping.yandex,
                                        dataPoint.ping.EC2.SHWADE,
                                        dataPoint.ping.EC2.VPN
                                ]
                        ).then(() => {
                                dbConnection.end();
                                resolved();              
                        }).catch(err => {
                                //handle error
                                console.log(err); 
                                dbConnection.end();
                                rejected(err);
                        });
                });
        });       
}

if (typeof exports !== 'undefined')
{
        // check methods
        exports.persistHeatingData = persistHeatingData;
        exports.persistPowerData = persistPowerData;
        exports.persistHumidityData = persistHumidityData;
        exports.persistNetworkData = persistNetworkData;

        // check properties for testing
        exports.thingAPI = thingAPI;
        exports.DBConnectionPool = DBConnectionPool;
}