const e = require('../gates/esp-gate');
const should = require('should');

describe('ESP gate tests:', function() {

        it('getState()', async function() {
                let state = await e.getState();
                state.should.be.an.Object();
        });

        it('updateConfig()', async function() {
                let state = await e.getState();
                await e.updateCachedState(state);
        });

});
