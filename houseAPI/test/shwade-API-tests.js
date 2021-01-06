// const chai = require('chai');
const should = require('should');
// const server = require('../shwade-thing');
const API = require('../shwadeAPI');


describe('ShWade API tests', function() {

	before(function() {
		global.OWDebugMode = true;
        });
        
        // aid methods
        async function checkGetStatus(API)
        {
                let status = await API.getStatus();

                status.should.have.property('oneWireStatus');

                status.oneWireStatus.should.have.property('temperatureSensors');
                status.oneWireStatus.should.have.property('switches');
                status.oneWireStatus.should.have.property('humiditySensors');
        }

        function checkUpdateStatus(API)
        {
                let validUpdateRequest = {
                        oneWireStatus : {
                                switches : {
                                        sw22 : 1
                                }
                        }
                };
                return API.updateStatus(validUpdateRequest).then(result => {
                        result.should.have.property('oneWireStatus');
                        result.oneWireStatus.should.have.property('switches');
                });
        }

        describe('Thing API tests (local)', function () {

                

                let thingAPI = new API({ thingAPI: true });

                it('getStatus()', function() {
                        this.timeout(15000);
                        return checkGetStatus(thingAPI);
                })

                it('updateStatus()', function() {
                        this.timeout(15000);
                        return checkUpdateStatus(thingAPI);
                })
                
        });

        describe('Shadow API tests (AWS)', function () {

                let shadowAPI = new API({ shadowAPI: true });
                
                it('getStatus()', function() {
                        return checkGetStatus(shadowAPI);
                })

                it('updateStatus()', function() {
                        return checkUpdateStatus(shadowAPI);
                })

        });
});