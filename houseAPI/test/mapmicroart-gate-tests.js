const m = require('../gates/mapmicroart-gate');
const should = require('should');

describe('MAP invertor gate tests:', function() {

        it('getStatus() promise resolved to valid REST object', function() {

                return m.getStatus().then(res => {
                        res.should.be.an.Object();
                        // console.log(res);
                })
        });
});