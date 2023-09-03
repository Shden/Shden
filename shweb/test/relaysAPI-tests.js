const should = require('should');
const testers = require('./API-testers');
const HTTPStatus = require('http-status-codes').StatusCodes;
const API = require('./api-config').config;

describe(`/API/${API.version}/relays testing:`, function () {

    let stateURL = `/API/${API.version}/relays/State`;
    it(`State: GET ${stateURL}`, function (done) {

        this.timeout(15000);
        testers.getTester(stateURL, HTTPStatus.OK, (response) => {
            var relaysStatus = JSON.parse(response);
            relaysStatus.should.have.property("Garage").which.is.an.Object();
            relaysStatus.Garage.should.have.property("R1").which.is.a.Number();
            relaysStatus.Garage.should.have.property("R13").which.is.a.Number();
            done();
        });
    });

    it(`State: PUT ${stateURL}`, function (done) {

        const SET_TO = 1;

        let request = {
            Relays: {
                Garage: {
                    R3: SET_TO 
                }
            }
        };

        this.timeout(15000);
        testers.putTester(stateURL, request, HTTPStatus.OK, (response) => {
            var relaysStatus = JSON.parse(response);
            relaysStatus.Relays.Garage.R3.should.be.equal(SET_TO);
            done();
        })
    });
});