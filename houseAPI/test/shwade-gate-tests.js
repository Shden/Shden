const shwg = require('../gates/shwade-gate');
const should = require('should');

describe('ShWade gate tests', function() {

	before(function() {
		global.OWDebugMode = true;
	});

        it('getStatus() promise resolved to valid REST object', function() {
                return shwg.getStatus().then(status => {
                        status.should.have.property("oneWireStatus").which.is.an.Object();
                })
        });

        it('updateStatus() promise resolved to valid REST object', function() {
                let validUpdateRequest = {
                        oneWireStatus : {
                                switches : {
                                        sw1 : 0,
                                        sw2 : 1
                                }
                        }
                }
                return shwg.updateStatus(validUpdateRequest).then(updatedStatus => {
                        updatedStatus.should.have.property("oneWireStatus").which.is.an.Object();
                });
        });

})