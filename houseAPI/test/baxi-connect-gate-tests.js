const b = require('../gates/baxi-connect-gate');
const should = require('should');

describe('Baxi-connect gate tests:', function() {

        this.timeout(15000);

        it.skip('Can pull Baxi Connect state from Zont Cloud', function() {
                return b.getBaxiStatus().then((result) => {
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

        it('Empty Baxi update rejected', function() {
                return Promise.any([
                        // everything below should be rejected
                        b.updateBaxiStatus(),
                        b.updateBaxiStatus({}),
                        b.updateBaxiStatus(333),
                        b.updateBaxiStatus({ heatingCircut: {} }),
                        b.updateBaxiStatus({ heatingCircut: { target_temp: 'NaN' }}),
                        b.updateBaxiStatus({ heatingCircut: { current_mode: 'NaN' }})
                ]).should.be.rejected();
        });

        it.skip('Can update target_temp', function() {
                return b.updateBaxiStatus({ heatingCircut: { target_temp: 23 }});
        })
});