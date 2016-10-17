var ow = require('../onewire');
var should = require('should');

describe('Onewire filesystem testing', function() {

	before(function() {
		global.OWDebugMode = true;
	});

	describe('Stub net checks', function() {
		it('stubnet created', function() {
			ow.getStubNet().should.be.not.null();
		});

		it('stubnet has temperature sensors', function() {
			ow.getStubNet().should.have.property(ow.sensors.heaterSensor);
			ow.getStubNet().should.have.property(ow.sensors.bedroomSensor);
			ow.getStubNet().should.have.property(ow.sensors.externalSensor);
		});

		it('stubnet has switches', function() {
			ow.getStubNet().should.have.property(ow.switches.heaterSwitch.address);
			ow.getStubNet().should.have.property(ow.switches.saunaFloorSwitch.address);
			ow.getStubNet().should.have.property(ow.switches.childrenSmallSwitch.address);
		});
	});

	describe('Temperature senors', function() {
		it('Temperature is numeric', function() {
			ow.getStubNet()[ow.sensors.heaterSensor].should.have.property("temperature").which.is.a.Number();
			ow.getStubNet()[ow.sensors.bedroomSensor].should.have.property("temperature").which.is.a.Number();
			ow.getStubNet()[ow.sensors.externalSensor].should.have.property("temperature").which.is.a.Number();
		});

		it('getT', function() {
			ow.getT(ow.sensors.heaterSensor).should.be.equal(44.2);
			ow.getT(ow.sensors.bedroomSensor).should.be.a.Number();
			ow.getT(ow.sensors.externalSensor).should.be.a.Number();
		});

		it('Switching', function() {
			for (var sw in ow.switches) {
				s = ow.switches[sw];
				ow.changeSwitch(s.address, s.channel, 0);
				ow.getSwitchState(s.address, s.channel).should.be.equal(0);

				ow.changeSwitch(s.address, s.channel, 1);
				ow.getSwitchState(s.address, s.channel).should.be.equal(1);
			}
		});
	});
});
