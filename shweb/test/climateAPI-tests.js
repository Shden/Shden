const should = require('should');
const http = require('http');
const moment = require('moment');
const { log } = require('console');
const API = require('./api-config').config;
const climateService = require('../API/1.2/services/climate');
const HTTPStatus = require('http-status-codes').StatusCodes;

describe(`/API/${API.version}/climate testing:`, function() {

	describe.skip('Statistics testing:', function() {

		function CSn(endpointName, n, done, expectedStatusCode) {
			http.get({
				host: API.host,
				port: API.port,
				path: `/API/${API.version}/climate/${endpointName}/${n}`
			}, function(responce) {
				responce.statusCode.should.be.equal(expectedStatusCode);
				var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
					if (responce.statusCode == HTTPStatus.OK)
					{
						JSON.parse(data);
						// console.log(data);
					}
					done();
				});
			});
		}

		describe(`GetTempHistory: GET /API/${API.version}/climate/GetTempHistory`, function() {

			it('GetTempHistory/1 responds OK', function(done) {
				CSn('GetTempHistory', 1, done, HTTPStatus.OK)
			});
			it('GetTempHistory/7 responds OK', function(done) {
				CSn('GetTempHistory', 7, done, HTTPStatus.OK)
			});
			it('GetTempHistory/0 responds BAD_REQUEST', function(done) {
				CSn('GetTempHistory', 0, done, HTTPStatus.BAD_REQUEST)
			});
			it('GetTempHistory/301 responds BAD_REQUEST', function(done) {
				CSn('GetTempHistory', 301, done, HTTPStatus.BAD_REQUEST)
			});
			it('GetTempHistory/blah-blah responds BAD_REQUEST', function(done) {
				CSn('GetTempHistory', 'blah-blah', done, HTTPStatus.BAD_REQUEST)
			});
		});

		describe(`GetHumidityHistory: GET /API/${API.version}/climate/GetHumidityHistory`, function() {

			it('GetHumidityHistory/1 responds OK', function(done) {
				CSn('GetHumidityHistory', 1, done, HTTPStatus.OK)
			});
			it('GetHumidityHistory/7 responds OK', function(done) {
				CSn('GetHumidityHistory', 7, done, HTTPStatus.OK)
			});
			it('GetHumidityHistory/0 responds BAD_REQUEST', function(done) {
				CSn('GetHumidityHistory', 0, done, HTTPStatus.BAD_REQUEST)
			});
			it('GetHumidityHistory/301 responds BAD_REQUEST', function(done) {
				CSn('GetHumidityHistory', 301, done, HTTPStatus.BAD_REQUEST)
			});
			it('GetHumidityHistory/blah-blah responds BAD_REQUEST', function(done) {
				CSn('GetHumidityHistory', 'blah-blah', done, HTTPStatus.BAD_REQUEST)
			});
		});

		describe(`GetTempStatistics: GET /API/${API.version}/climate/GetTempStatistics`, function() {

			it('GetTempStatistics/1 responds OK', function(done) {
				CSn('GetTempStatistics', 1, done, HTTPStatus.OK)
			});
			it('GetTempStatistics/7 responds OK', function(done) {
				CSn('GetTempStatistics', 7, done, HTTPStatus.OK)
			});
			it('GetTempStatistics/0 responds BAD_REQUEST', function(done) {
				CSn('GetTempStatistics', 0, done, HTTPStatus.BAD_REQUEST)
			});
			it('GetTempStatistics/1001 responds BAD_REQUEST', function(done) {
				CSn('GetTempStatistics', 1001, done, HTTPStatus.BAD_REQUEST)
			});
			it('GetTempStatistics/blah-blah responds BAD_REQUEST', function(done) {
				CSn('GetTempStatistics', 'blah-blah', done, HTTPStatus.BAD_REQUEST)
			});
		});

		if (API.version == '1.1')
		{	
			// this won't be supported in 1.2 and beyond
			describe(`GetHeatingConsumption: GET /API/${API.version}/climate/GetHeatingConsumption`, function() {

				it('GetHeatingConsumption/1 responds OK', function(done) {
					CSn('GetHeatingConsumption', 1, done, HTTPStatus.OK)
				});
				it('GetHeatingConsumption/7 responds OK', function(done) {
					CSn('GetHeatingConsumption', 7, done, HTTPStatus.OK)
				});
				it('GetHeatingConsumption/0 responds BAD_REQUEST', function(done) {
					CSn('GetHeatingConsumption', 0, done, HTTPStatus.BAD_REQUEST)
				});
				it('GetHeatingConsumption/1001 responds BAD_REQUEST', function(done) {
					CSn('GetHeatingConsumption', 1001, done, HTTPStatus.BAD_REQUEST)
				});
				it('GetHeatingConsumption/blah-blah responds BAD_REQUEST', function(done) {
					CSn('GetHeatingConsumption', 'blah-blah', done, HTTPStatus.BAD_REQUEST)
				});
			});
		}
	});

	describe('Configuration testing:', function() {

		this.timeout(15000);

		var config;
		it(`GET /API/${API.version}/climate/Configuration`, function(done) {
			http.get({
				host: API.host,
				port: API.port,
				path: `/API/${API.version}/climate/Configuration`
			}, function(responce) {
				responce.statusCode.should.be.equal(HTTPStatus.OK);
				var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
					config = JSON.parse(data);
                                        // console.log(JSON.stringify(config, null, 4));
					config.should.have.property("heating");
					done();
				});
			});
		});

		it.skip(`PUT /API/${API.version}/climate/Configuration`, function(done) {
			var req = http.request({
				host: API.host,
				port: API.port,
				path: `/API/${API.version}/climate/Configuration`,
				method: 'PUT'
			}, function(responce) {
				responce.statusCode.should.be.equal(HTTPStatus.OK);
				var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
					done();
				});
			});
			req.setHeader('Content-Type', 'application/json');
			req.write(JSON.stringify(config, null, 4), encoding='utf8');
			req.end();
		});

                it.skip('GetModeChangeUpdate()', function(done) {
                        this.timeout(15000);
                        climateService.GetModeChangeUpdate(1)
                                .then((res) => {
                                        console.log(res);
                                        done();
                                })
                })
	});

        describe('UpdateHeatingSetting:', function() {

                this.timeout(15000);

                it('Invalid appliance name brings BAD_REQUEST', function(done) {
			var req = http.request({
				host: API.host,
				port: API.port,
				path: `/API/${API.version}/climate/UpdateHeatingSetting/INVALID_APPLIANCE_NAME/1/2`,
				method: 'PUT'
			}, function(responce) {
				responce.statusCode.should.be.equal(HTTPStatus.BAD_REQUEST);
                                done();
			});
                        req.end();
                });

                it('Invalid mode name birngs BAD_REQUEST', function(done) {
			var req = http.request({
				host: API.host,
				port: API.port,
				path: `/API/${API.version}/climate/UpdateHeatingSetting/hallFloor/INVALID_MODE/2`,
				method: 'PUT'
			}, function(responce) {
				responce.statusCode.should.be.equal(HTTPStatus.BAD_REQUEST);
                                done();
                        });
                        req.end();
                });

                it('Invalid temperature birngs BAD_REQUEST', function(done) {
			var req = http.request({
				host: API.host,
				port: API.port,
				path: `/API/${API.version}/climate/UpdateHeatingSetting/hallFloor/presence/99`,
				method: 'PUT'
			}, function(responce) {
				responce.statusCode.should.be.equal(HTTPStatus.BAD_REQUEST);
                                done();
                        });
                        req.end();
                });

                it('Valid request updates setting', function(done) {
                        var req = http.request({
				host: API.host,
				port: API.port,
				path: `/API/${API.version}/climate/UpdateHeatingSetting/hallFloor/presence/23`,
				method: 'PUT'
			}, function(responce) {
				responce.statusCode.should.be.equal(HTTPStatus.OK);
                                var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
                                        let updatedStatus = JSON.parse(data);
                                        updatedStatus.config.heating.hallFloor.settings.presence.should.be.equal(23);
					done();
				});
                        });            
                        req.end();            
                })
        });
});
