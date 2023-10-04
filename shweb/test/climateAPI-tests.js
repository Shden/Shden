const should = require('should');
const http = require('http');
const moment = require('moment');
const { log } = require('console');
const API = require('./api-config').config;
const climateService = require('../API/1.2/services/climate');
const HTTPStatus = require('http-status-codes').StatusCodes;

describe(`/API/${API.version}/climate testing:`, function() {

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
