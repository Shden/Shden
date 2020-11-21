const shwg = require('../gates/shwade-gate');
const should = require('should');

describe('ShWade gate tests', function() {

	before(function() {
		global.OWDebugMode = true;
	});

        it('getStatus() promise resolved to valid REST object', function() {
                return shwg.getStatus().then(status => {
                        status.should.have.property("oneWireStatus").which.is.an.Object();
                        // console.log(JSON.stringify(status, null, '\t'));
                })
        });

        it('updateStatus() promise resolved to valid REST object', function() {
                return shwg.getStatus().then(status => {
                        shwg.updateStatus(status).then(newStatus => {
                                newStatus.should.have.property("oneWireStatus").which.is.an.Object();
                        });
                });

        });

})