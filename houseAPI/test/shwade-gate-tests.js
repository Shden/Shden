const shwg = require('../gates/shwade-gate');
const should = require('should');

describe('ShWade gate tests', function() {

	before(function() {
		global.OWDebugMode = true;
	});

        it('getStatus() promise resolved to valid REST object', function() {
                this.timeout(15000);
                return shwg.getStatus().then(status => {
                        status.should.have.property("oneWireStatus").which.is.an.Object();
                        status.should.have.property("powerStatus").which.is.an.Object();
                        status.should.have.property("config").which.is.an.Object();
                        status.should.have.property("shutters").which.is.an.Object();
                        status.should.have.property("map").which.is.an.Object();
                })
        });

        it.skip('updateStatus() promise resolved to valid REST object', function() {
                let validUpdateRequest = {
                        oneWireStatus : {
                                switches : {
                                        sw1 : 0,
                                        sw2 : 1
                                }
                        }
                }
                this.timeout(15000);
                return shwg.updateStatus(validUpdateRequest).then(updatedStatus => {
                        updatedStatus.should.have.property("oneWireStatus").which.is.an.Object();
                });
        });

})