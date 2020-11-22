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
        console.info('Persisting current data.');
}, config.RecordingIntervalSec * 1000);

// Obtaint current house state data point
function getDataPoint()
{
        return thingAPI.getStatus();
}

// // Get DB connection pool
// function getDBConnectionPool()
// {
//         return DB.createPool(config.DBConnection);
// }

if (typeof exports !== 'undefined')
{
	// check methods
        exports.getDataPoint = getDataPoint;
        // exports.getDBConnectionPool = getDBConnectionPool;

        // check properties for testing
        exports.thingAPI = thingAPI;
        exports.DBConnectionPool = DBConnectionPool;
}