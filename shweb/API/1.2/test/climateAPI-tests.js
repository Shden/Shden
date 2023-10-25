const should = require('should');
const http = require('http');
const moment = require('moment');
const { log } = require('console');
const API = require('./api-config').config;
const climateService = require('../services/climate');
const { HouseMode } = require('../services/id');
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

                it('GetModeChangeUpdate()', function(done) {
                        this.timeout(15000);
                        climateService.GetModeChangeUpdate(HouseMode.SHORTTERM_STANDBY)
                                .then((res) => {
                                        // console.log(res);
                                        done();
                                })
                })

                describe('UpdateHeatingSetting:', function() {

                        this.timeout(15000);

                        function RequestGetsStatusCode(done, updateRequest, statusCode) {
                                var req = http.request({
                                        host: API.host,
                                        port: API.port,
                                        path: `/API/${API.version}/climate/UpdateHeatingSetting`,
                                        method: 'PUT',
                                        headers: {
                                                'Content-type': 'application/json; charset=UTF-8',
                                        }
                                }, function(responce) {
                                        responce.statusCode.should.be.equal(statusCode);
                                        done();
                                });
                                if (updateRequest !== undefined)
                                        req.write(JSON.stringify(updateRequest));
                                req.end();
                        }

                        const InvalidRequestGetsBadRequest = (done, updateRequest) => 
                                RequestGetsStatusCode(done, updateRequest, HTTPStatus.BAD_REQUEST);
                        const ValidRequestGetsOK = (done, updateRequest) =>
                                RequestGetsStatusCode(done, updateRequest, HTTPStatus.OK);

                        it('No request gets BAD_REQUEST', done => InvalidRequestGetsBadRequest(done));
                        it('Empty request gets BAD_REQUEST', done => InvalidRequestGetsBadRequest(done, {}));
                        it('Incomplete request gets BAD_REQUEST', done => InvalidRequestGetsBadRequest(done, { saunaFloor: {} }));
                        it('Incomplete request gets BAD_REQUEST', done => InvalidRequestGetsBadRequest(done, { saunaFloor: { settings: {} } }));
                        it('Incomplete request gets BAD_REQUEST', done => InvalidRequestGetsBadRequest(done, { saunaFloor: { settings: { presence: 0 } } }));
                        it('Incomplete request gets BAD_REQUEST', done => InvalidRequestGetsBadRequest(done, { saunaFloor: { settings: { presence: 0, shortTermStandby: 0 } } }));

                        it('Valid request gets OK', done => ValidRequestGetsOK(done, { nanaoBoiler: { settings: { presence: 22, shortTermStandby: 18, longTermStandby: 15 } } }));

                });
        });
});
