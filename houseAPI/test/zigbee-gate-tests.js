const z = require('../gates/zigbee-gate');
const should = require('should');

describe('Zigbee gate tests:', function() {

        before(function(done) {
                console.log('Just 1 second please, MQTT stuff has to be processed first...');
                setTimeout(() => { done(); }, 1000);
        });

        it('GetStatus()', function() {
                return z.getStatus().then((res) => {
                        // console.log(res);
                });
        });

        it('UpdateStatus()', function() {
                return z.getStatus().then((res) => {
                        res.switches.balconyLight = (res.switches.balconyLight + 1) % 2;
                        z.updateStatus(res);
                        // console.log(res);
                });
        });

        after(function() {
                z.tearDown();
        })
});