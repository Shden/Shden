const n = require('../gates/network-gate');
const should = require('should');

describe('Network gate tests:', function() {

        it('Get network status', function() {
                return n.getStatus().then(status => {
                        status.should.be.an.Object();
                        console.log(status);
                });
        });

});
