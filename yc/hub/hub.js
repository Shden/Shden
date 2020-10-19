// Cloud based hub module to handle events from home IoT devices.
const mqtt = require('mqtt');
const mariadb = require('mariadb');
const fs = require('fs');
const path = require('path');
const { resolve } = require('path');

const REGISTRY_KEY = fs.readFileSync(path.join(__dirname, '../registry/key.pem'));
const REGISTRY_CERT = fs.readFileSync(path.join(__dirname, '../registry/cert.pem'));
const ROOT_CA = fs.readFileSync(path.join(__dirname, '../rootCA.crt'));

const PORT = 8883;
const HOST = 'mqtt.cloud.yandex.net';

const HEATING_DEVICE_ID = "areim9bfk6muptdal791";       // heating IoT device ID
const HUMIDITY_DEVICE_ID = "are6dp175p84uho333u9";      // humidity IoT device ID
const HEATING_EVENTS = deviceEventsTopic(HEATING_DEVICE_ID);
const HUMIDITY_EVENTS = deviceEventsTopic(HUMIDITY_DEVICE_ID);

function deviceEventsTopic(deviceID)
{
        return "$devices/" + deviceID + "/events";
}

if (require.main === module)
{
        // Should have 3 arguments (dbhost, dbuser, dbpassword) besides 2 (node + script name)
        if (process.argv.length < 5)
        {
                console.warn('Invalid command line arguments.');
                printUsage();
                process.exit();
        }

        const pool = mariadb.createPool({
                host: process.argv[2], 
                user: process.argv[3], 
                password: process.argv[4],
                connectionLimit: 5,
                database: 'SHDEN'
        });

        var registryOptions = {
                port: PORT,
                host: HOST,
                key: REGISTRY_KEY,
                cert: REGISTRY_CERT,
                rejectUnauthorized: true,
                // The CA list will be used to determine if server is authorized
                ca: ROOT_CA,
                protocol: 'mqtts'
        };

        var registry = mqtt.connect(registryOptions);

        registry.on('connect', function () {
                console.log('Connected to MQTT server.');
                registry.subscribe(HEATING_EVENTS, (err) => {
                        if (!err)
                                console.log(`Hub subscribed to heating events at ${HEATING_EVENTS}.`);
                        else
                                console.error('Registry subscription error: ' + err);
                })

                registry.subscribe(HUMIDITY_EVENTS, (err) => {
                        if (!err)
                                console.log(`Hub subscribed to humidity events at ${HUMIDITY_EVENTS}.`);
                        else
                                console.error('Registry subscription error: ' + err);
                })
        })
        
        registry.on('message', (topic, message) => {
                if (topic == HEATING_EVENTS)
                {
                        console.log(`Hub received heating update message: ${message.toString()}`);
                        var dataPoint = JSON.parse(message);
                        persistHeatingData(pool, dataPoint);
                };

                if (topic == HUMIDITY_EVENTS)
                {
                        console.log(`Hub received humidity update message: ${message.toString()}`);
                        var dataPoint = JSON.parse(message);
                        persistHumidityData(pool, dataPoint);
                }
        })
}

function persistHeatingData(dbConnectionPool, dataPoint)
{
        return new Promise((resolve, reject) => {
                dbConnectionPool.getConnection()
                .then(dbConnection => {
        
                        dbConnectionPool.query(
                                "CALL SP_ADD_HEATING_RECORD(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
                                        [dataPoint.heater, dataPoint.fluid_in, dataPoint.fluid_out,
                                        dataPoint.external, dataPoint.am_bedroom, dataPoint.bedroom,
                                        dataPoint.cabinet, dataPoint.child_bedroom,
                                        dataPoint.kitchen, dataPoint.bathroom_1, dataPoint.bathroom_1_floor,
                                        dataPoint.control, dataPoint.heating, dataPoint.pump, 
                                        dataPoint.bathroom_1_heating]
                        ).then(() => {
                                console.log('Temperature records updated.')
                                dbConnection.end();
                                resolve();              
                        })
                }).catch(err => {
                        //handle error
                        console.log(err); 
                        dbConnection.end();
                        reject(err);
                })
        })  
}

function persistHumidityData(dbConnectionPool, dataPoint)
{
        return new Promise((resolve, reject) => {
                dbConnectionPool.getConnection()
                .then(dbConnection => {
        
                        dbConnectionPool.query(
                                "CALL SP_ADD_HUMIDITY_RECORD(?);", [dataPoint.firstFloorSauna]
                        ).then(() => {
                                console.log('Humidity records updated.')
                                dbConnection.end();
                                resolve();              
                        })
                }).catch(err => {
                        //handle error
                        console.log(err); 
                        dbConnection.end();
                        reject(err);
                })
        })  
}

function printUsage()
{
        console.log('Usage: node hub.js DBHost DBUser DBPass');
        console.log('  DBHost - database host name.');
        console.log('  DBUser - database user name.');
        console.log('  DBPass - database user password.');
}

if (typeof exports !== 'undefined')
{
	// methods
        exports.persistHeatingData = persistHeatingData;
        exports.persistHumidityData = persistHumidityData;
}