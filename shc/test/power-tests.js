const p = require('../power');
const mp = require('../mqtt-publish');

describe('Power meter module tests:', function() {

        it('Can get power meter data', function() {
                return p.getPowerMeterData();
        });

        it('Can publish power meter data', async function() {
                let powerDataPoint = await p.getPowerMeterData();
                return mp.publishPowerDataPoint(powerDataPoint);
        });

});