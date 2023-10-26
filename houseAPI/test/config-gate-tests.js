const c = require('../gates/config-gate');
const should = require('should');

describe('Configuration gate tests:', function() {

        it('getConfig()', async function() {
                let config = await c.getConfig();
                config.should.be.an.Object();
        });

        it.skip('updateConfig()', async function() {
                let config = await c.getConfig();
                await c.updateConfig(config);
        });

});
