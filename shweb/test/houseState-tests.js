const HouseState = require('../API/1.2/services/house').HouseState;
const HouseMode = require('../API/1.2/services/house').HouseMode;

describe('HouseState tests', function() {

        it('allLightsOff()', function() {
                console.log(new HouseState().allLightsOff().updateRequest);
        });

        it('closeShutters(1)', function() {
                console.log(new HouseState().closeShutters(1).updateRequest);
        });

        it('closeShutters(2)', function() {
                console.log(new HouseState().closeShutters(2).updateRequest);
        });

        it('goto PRESENCE_MODE', function() {
                console.log(new HouseState().gotoMode(HouseMode.PRESENCE_MODE).updateRequest);
        });

        it('goto SHORTTERM_STANDBY', function() {
                console.log(new HouseState().gotoMode(HouseMode.SHORTTERM_STANDBY).updateRequest);
        });

        it('goto LONGTERM_STANDBY', function() {
                console.log(new HouseState().gotoMode(HouseMode.LONGTERM_STANDBY).updateRequest);
        });
});