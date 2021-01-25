const should = require('should');
const http = require('http');
const API = require('./api-config').config;
const testers = require('./API-testers');
const HTTPStatus = require('http-status-codes').StatusCodes;

describe(`/API/${API.version}/status testing:`, function() {

	this.timeout(15000);

	describe(`GetHouseStatus`, function() {

		let statusURL = `/API/${API.version}/status/HouseStatus`;
		it(`Status: GET ${statusURL} returns valid house status`, function(done) {
			testers.getTester(statusURL, HTTPStatus.OK, (resp) => {

				let status = JSON.parse(resp);

				status.should.be.an.Object();
				status.should.have.property('oneWireStatus');
				status.should.have.property('powerStatus');
				status.should.have.property('config');
				status.should.have.property('zigbee');
				done();
			});
		});
	});

	describe(`SetHouseMode`, function() {

		let houseModeURL = `/API/${API.version}/status/HouseMode`;
		it(`HouseMode: PUT ${houseModeURL} mode 222 raises exception`, function(done) {
			let modeUpdate = { mode: 222 };
			testers.putTester(houseModeURL, modeUpdate, HTTPStatus.BAD_REQUEST, (res) => {
				done();
			});
		});

		it(`HouseMode: PUT ${houseModeURL} empty object raises exception`, function(done) {
			testers.putTester(houseModeURL, new Object(), HTTPStatus.BAD_REQUEST, (res) => {
				done();
			});
		})

		it(`HouseMode: PUT ${houseModeURL} mode 1 sets to presence mode`, function(done) {
			let modeUpdate = { mode: 1 };
			testers.putTester(houseModeURL, modeUpdate, HTTPStatus.OK, (res) => {
				done();
			});
		});

		it.skip(`HouseMode: PUT ${houseModeURL} mode 0 sets to standby mode`, function(done) {
			let modeUpdate = { mode: 0 };
			testers.putTester(houseModeURL, modeUpdate, HTTPStatus.OK, (res) => {
				done();
			});
		});

	});
});
