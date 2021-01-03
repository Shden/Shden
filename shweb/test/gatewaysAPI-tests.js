const should = require('should');
const testers = require('./API-testers');
const HTTPStatus = require('http-status-codes').StatusCodes;
const { response } = require('express');
const API = require('./api-config').config;

describe(`/API/${API.version}/gateways testing:`, function() {

	let getStatusURL = `/API/${API.version}/gateways/GetStatus`;
	it(`GetStatus: GET ${getStatusURL}`, function(done) {
		testers.getTester(getStatusURL, HTTPStatus.OK, (response) => {
			var status = JSON.parse(response);
			status.should.have.property("parking");
			status.should.have.property("territory");
			done();
		})
	});

	it.skip('Move', function(done) {
		// Not implemented yet.
	});
});
