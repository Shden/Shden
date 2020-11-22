const r = require('../recorder');
const should = require('should');


describe('Recorder tests', function() {

        it('Can get data point using API', function() {
                return r.getDataPoint().then(dataPoint => {
                        dataPoint.should.be.an.Object();
                        dataPoint.should.have.property('oneWireStatus');
                        dataPoint.oneWireStatus.should.have.property('temperatureSensors');
                        dataPoint.oneWireStatus.should.have.property('switches');
                        dataPoint.oneWireStatus.should.have.property('humiditySensors');
                });
        });

        it('DB connection check', function() {
                // r.DBConnectionPool.should.be.an.Object();
                return r.DBConnectionPool.getConnection().then(connection => {
                        connection.should.be.an.Object();
                })
        })
})