var p = require('../power');
const mp = require('../mqtt-publish');

describe('Power meter module tests:', function() {

        const mercury236CmdLine = '/Users/den/Shden/mercury236/mercury236 RS485 --testRun --json';

        it('Can get power meter data', function() {
                // dry run for testing
                return p.getPowerMeterData(mercury236CmdLine);
        });

        it('Can publish power meter data', async function() {

                let output = await p.getPowerMeterData(mercury236CmdLine);
                var powerDataPoint = JSON.parse(output);
                return mp.publishPowerDataPoint(powerDataPoint);
        });

});