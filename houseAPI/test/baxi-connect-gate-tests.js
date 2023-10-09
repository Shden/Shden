const b = require('../gates/baxi-connect-gate');
const should = require('should');

describe('Baxi-connect gate tests:', function() {

        this.timeout(15000);

        it('Can pull baxi-connect state from zont cloud', function() {
                return b.getStatus().then((result) => {
                        result.should.be.an.Object();
                        result.should.have.property("baxiConnect").which.is.an.Object();
                        result.should.have.property("heatingCircut").which.is.an.Object();
                        result.should.have.property("hotWaterCircut").which.is.an.Object();
                        result.should.have.property("nanaoBoiler").which.is.an.Object();
                        result.should.have.property("backupBoiler").which.is.an.Object();
                        result.should.have.property("sensors").which.is.an.Object();
                        result.should.have.property("ot_sensors").which.is.an.Object();
                        // console.log(result);
                });
        });

});