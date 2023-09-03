const should = require('should');
const testers = require('./API-testers');
const HTTPStatus = require('http-status-codes').StatusCodes;
const API = require('./api-config').config;

describe(`/API/${API.version}/shutters testing:`, function () {

    let stateURL = `/API/${API.version}/shutters/State`;
    it(`State: GET ${stateURL}`, function (done) {

        this.timeout(15000);
        testers.getTester(stateURL, HTTPStatus.OK, (response) => {
            var shuttersStatus = JSON.parse(response);
            shuttersStatus.should.have.property("House").which.is.an.Object();
            shuttersStatus.should.have.property("Garage").which.is.an.Object();
            shuttersStatus.House.should.have.property("F1").which.is.an.Object();
            shuttersStatus.House.should.have.property("F1").which.is.an.Object();
            done();
        });
    });

    it(`State: PUT ${stateURL}`, function (done) {

        const SET_TO = 1;

        let request = {
            Shutters: {
                House: {
                    F1: { W2: SET_TO }
                }
            }
        };

        this.timeout(15000);
        testers.putTester(stateURL, request, HTTPStatus.OK, (response) => {
            var shuttersStatus = JSON.parse(response);
            shuttersStatus.Shutters.House.F1.W2.should.be.equal(SET_TO);
            done();
        })
    });
});