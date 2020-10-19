const h = require('../hub');
const mariadb = require('mariadb');

const dbConnectionPool = mariadb.createPool({
        host: 'localhost', 
        user: 'hubuser', 
        password: 'hubuser',
        connectionLimit: 5,
        database: 'SHDEN'
});

const dataPoint = {
        heater			: 44.2,
        fluid_in		: 20,
        fluid_out		: 30,
        external		: -10,
        am_bedroom		: 21,
        bedroom			: 22,
        cabinet			: 23,
        child_bedroom		: 24,
        kitchen			: 25,
        bathroom_1		: 26,
        bathroom_1_floor	: 27,
        control			: 22,
        heating			: 1,
        pump			: 1,
        bathroom_1_heating	: 1
};

describe('ShWade cloud hub tests:', function() {

        it('Can persist heating data to DB', function() {
                return h.persistHeatingData(dbConnectionPool, dataPoint);
        });

        it('Can persist humidity data to DB', function() {
                return h.persistHumidityData(dbConnectionPool, { firstFloorSauna: 44.8 });
        });
});

after(function() {
        dbConnectionPool.end();
});

