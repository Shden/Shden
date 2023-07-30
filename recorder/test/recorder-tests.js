const R = require('../recorder');
const should = require('should');


describe('Recorder tests', function() {

        it('Can get data point using API', function() {
                return R.thingAPI.getStatus().then(dataPoint => {
                        dataPoint.should.be.an.Object();
                        dataPoint.should.have.property('oneWireStatus');
                        dataPoint.oneWireStatus.should.have.property('temperatureSensors');
                        dataPoint.oneWireStatus.should.have.property('switches');
                        dataPoint.oneWireStatus.should.have.property('humiditySensors');
                });
        });

        it('DB connection check', function() {
                R.DBConnectionPool.should.be.an.Object();
                return R.DBConnectionPool.getConnection().then(connection => {
                        connection.should.be.an.Object();
                });
        });

        describe('Data persist checks', function() {
                it('persistHeatingData() check', function(done) {
                        R.thingAPI.getStatus().then(dataPoint => {
                                R.persistHeatingData(R.DBConnectionPool, dataPoint).then(() => {
                                        done();
                                })
                        });
                });
        
                it('persistHumidityData() check', function(done) {
                        R.thingAPI.getStatus().then(dataPoint => {
                                R.persistHumidityData(R.DBConnectionPool, dataPoint.oneWireStatus).then(() => {
                                        done();
                                })
                        });
                });
        
                it('persistPowerData() check', function(done) {
                        R.thingAPI.getStatus().then(dataPoint => {
                                R.persistPowerData(R.DBConnectionPool, dataPoint.powerStatus).then(() => {
                                        done();
                                })
                        });
        
                });

                it('persistNetworkData() check', function(done) {
                        R.thingAPI.getStatus().then(dataPoint => {
                                R.persistNetworkData(R.DBConnectionPool, dataPoint.powerStatus).then(() => {
                                        done();
                                })
                        });
        
                });
        });
});