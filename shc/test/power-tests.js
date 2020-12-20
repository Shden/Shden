const p = require('../power');

describe('Power meter module tests:', function() {

        it('Can get power meter data', function() {
                return p.getPowerMeterData();
        });

});