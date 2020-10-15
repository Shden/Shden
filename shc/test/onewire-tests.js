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
			ow.getStubNet().should.have.property(ow.switches.saunaFloorSwitch.address);
			ow.getStubNet().should.have.property(ow.switches.childrenSmallSwitch.address);
		});
	});

	describe('Temperature sensors', function() {
		
		it('Temperature is numeric', function() {
			ow.getStubNet()[ow.sensors.heaterSensor].should.have.property("temperature").which.is.a.Number();
			ow.getStubNet()[ow.sensors.bedroomSensor].should.have.property("temperature").which.is.a.Number();
			ow.getStubNet()[ow.sensors.externalSensor].should.have.property("temperature").which.is.a.Number();
		});

		it('getT', function() {
			ow.getT(ow.sensors.heaterSensor).should.be.eventually.equal(44.2);
			ow.getT(ow.sensors.bedroomSensor).should.be.eventually.a.Number();
			ow.getT(ow.sensors.externalSensor).should.be.eventually.a.Number();
		});
	});

	describe('Switches:', function() {

		it('Switches changeable to ON when dryRun=false:', function() {

			global.OWDryRun = false;
			var p = new Array();

			for (var sw in ow.switches) {
				var s = ow.switches[sw];
				ow.changeSwitch(s.address, s.channel, 1);
				p.push(ow.getSwitchState(s.address, s.channel));
			}

			return Promise.all(p).
				then((result) => {
					result.forEach((switchValue) => {
						switchValue.should.be.equal(1);
					})
				});
		});

		it('Switches changeable to OFF when dryRun=false:', function() {

			global.OWDryRun = false;
			var p = new Array();

			for (var sw in ow.switches) {
				var s = ow.switches[sw];
				ow.changeSwitch(s.address, s.channel, 0);
				p.push(ow.getSwitchState(s.address, s.channel));
			}

			return Promise.all(p).
				then((result) => {
					result.forEach((switchValue) => {
						switchValue.should.be.equal(0);
					})
				});
		});


		it('Switches blocked when dryRun=true', function() {

			// set all to 0
			global.OWDryRun = false;
			for (var sw in ow.switches) {
				var s = ow.switches[sw];
				ow.changeSwitch(s.address, s.channel, 0);
			}

			// try set all to 1 in dry mode
			global.OWDryRun = true;
			var p = new Array();

			for (var sw in ow.switches) {
				var s = ow.switches[sw];
				ow.changeSwitch(s.address, s.channel, 1);
				p.push(ow.getSwitchState(s.address, s.channel));
			}

			return Promise.all(p).
				then((result) => {
					result.forEach((switchValue) => {
						switchValue.should.be.equal(0);
					})
				});
		});

		after(function() {
			global.OWDryRun = false;
		});
	});
});
