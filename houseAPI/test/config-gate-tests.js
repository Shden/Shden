const c = require('../gates/config-gate');
const should = require('should');

describe('Configuration gate tests:', function() {

        it('getConfig()', async function() {
                let config = await c.getConfig();
                console.log(config);
                config.should.be.an.Object();
        });

        it('updateConfig()', async function() {
                let config = await c.getConfig();
                await c.updateConfig(config);
        });

});
