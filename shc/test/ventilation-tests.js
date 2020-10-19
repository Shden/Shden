const v = require('../ventilation');
const ow = require('../onewire');       // ??
const should = require('should');       // ??
const mp = require('../mqtt-publish');

global.OWDebugMode = true;              // ??

describe('Ventiltion Module Tests:', () => {

        it('Publish humidity data point to YC IoT device', function() {
                this.timeout(5000);
                return mp.publishHumidityDataPoint({ humiditySensor1: 33.5, humiditySensor2: 68.12 });
        });

});