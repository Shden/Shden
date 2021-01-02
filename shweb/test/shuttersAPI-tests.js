const should = require('should');
const http = require('http');
const testers = require('./API-testers');
const HTTPStatus = require('http-status-codes');
const { response } = require('express');
const API = require('./api-config').config;

describe(`/API/${API.version}/shutters testing:`, function() {

	let stateURL = `/API/${API.version}/shutters/State`;
	it(`State: GET ${stateURL}`, function(done) {

		// this.timeout(15000);
		testers.getTester(stateURL, HTTPStatus.OK, (response) => {
                        var shuttersStatus = JSON.parse(response);
			shuttersStatus.should.have.property("F1").which.is.an.Object();
			shuttersStatus.should.have.property("F2").which.is.an.Object();
			done();
		});
        });

        it(`State: PUT ${stateURL}`, function(done) {

                // WIP 
                // let request = 
        });
});