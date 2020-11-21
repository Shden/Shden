const chai = require('chai');
const should = require('should');
const server = require('../shwade-thing');
const API = require('../shwadeAPI');


describe('ShWade API tests', function() {

	before(function() {
		global.OWDebugMode = true;
        });
        
        // aid methods
        function checkGetStatus(API, done)
        {
                API.getStatus()
                        .then(status => {
                                // console.log(status);
                                status.should.have.property('oneWireStatus');

                                status.oneWireStatus.should.have.property('temperatureSensors');
                                status.oneWireStatus.should.have.property('switches');
                                status.oneWireStatus.should.have.property('humiditySensors');
                                done();
                        });
        }

        function checkUpdateStatus(API, done)
        {
                API.getStatus()
                        .then(status => {
                                // status.oneWireStatus.switches.saunaFloorSwitch =
                                //         (status.oneWireStatus.switches.saunaFloorSwitch) ? 0 : 1;
                                // status.oneWireStatus.switches.childrenSmallSwitch =
                                //         (status.oneWireStatus.switches.childrenSmallSwitch) ? 0 : 1;

                                API.updateStatus(status)
                                        .then(result => {
                                                result.should.have.property('oneWireStatus');
                
                                                result.oneWireStatus.should.have.property('switches');

                                                done();
                
                                                // result.oneWireStatus.switches.saunaFloorSwitch.should.be.equal(
                                                //         status.oneWireStatus.switches.saunaFloorSwitch
                                                // );
                                                // result.oneWireStatus.switches.childrenSmallSwitch.should.be.equal(
                                                //         status.oneWireStatus.switches.childrenSmallSwitch
                                                // );
                                        });
                        });
        }

        describe('Thing API tests (local)', function () {

                let thingAPI = new API({ thingAPI: true });

                it('getStatus()', function(done) {
                        checkGetStatus(thingAPI, done);
                })

                it('updateStatus()', function(done) {
                        checkUpdateStatus(thingAPI, done);
                })
                
        });

        describe('Shadow API tests (AWS)', function () {

                let shadowAPI = new API({ shadowAPI: true });
                
                it('getStatus()', function(done) {
                        checkGetStatus(shadowAPI, done);
                })

                it('updateStatus()', function(done) {
                        checkUpdateStatus(shadowAPI, done);
                })

        });
});