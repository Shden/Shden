const should = require('should');
const testers = require('./API-testers');
const HTTPStatus = require('http-status-codes').StatusCodes;
const { response } = require('express');
const API = require('./api-config').config;

describe(`/API/${API.version}/gateways testing:`, function() {

	this.timeout(30000);

	let openURL = `/API/${API.version}/gateways/Open/gateA`;
	it.skip(`Open: PUT ${openURL}`, function(done) {
		testers.putTester(openURL, {}, HTTPStatus.OK, (response) => {
			done();
		})
	});

	let closeURL = `/API/${API.version}/gateways/Close/gateA`;
	it.skip(`Close: PUT ${closeURL}`, function(done) {
		testers.putTester(closeURL, {}, HTTPStatus.OK, (response) => {
			done();
		})
	});
});
