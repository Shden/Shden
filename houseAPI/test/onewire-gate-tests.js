const ow = require('../gates/onewire-gate');
const should = require('should');

describe('Onewire filesystem gate tests', function() {

	before(function() {
		global.OWDebugMode = true;
	});

	describe('Stub net checks', function() {

		it('stubnet created', function() {
			ow.getStubNet().should.be.not.null();
		});

		it('stubnet has temperature sensors', function() {
			ow.getStubNet().should.have.property(ow.temperatureSensors.heater);
			ow.getStubNet().should.have.property(ow.temperatureSensors.bedroom);
			ow.getStubNet().should.have.property(ow.temperatureSensors.external);
		});

		it('stubnet has switches', function() {
			ow.getStubNet().should.have.property(ow.switches.saunaFloorSwitch.address);
			ow.getStubNet().should.have.property(ow.switches.childrenSmallSwitch.address);
		});
	});

	describe('Temperature', function() {
		
		it('1-wire stub has temperature sensors', function() {
			ow.getStubNet()[ow.temperatureSensors.heater].should.have.property("temperature").which.is.a.Number();
			ow.getStubNet()[ow.temperatureSensors.bedroom].should.have.property("temperature").which.is.a.Number();
			ow.getStubNet()[ow.temperatureSensors.external].should.have.property("temperature").which.is.a.Number();
		});

		it('getT() returns temperature', function() {
			ow.getT(ow.temperatureSensors.heater).should.be.eventually.equal(44.2);
			ow.getT(ow.temperatureSensors.bedroom).should.be.eventually.a.Number();
			ow.getT(ow.temperatureSensors.external).should.be.eventually.a.Number();
		});
	});

	describe('Humidity', function() {
		
		it('1-wire stub has humidity sensors', function() {
			ow.getStubNet()[ow.humiditySensors.bathroom_1].should.have.property("humidity").which.is.a.Number();
		});

		it('getH() returns humidity', function() {
			ow.getH(ow.humiditySensors.bathroom_1).should.be.eventually.equal(43.62);
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

			global.OWDryRun = false;

			return Promise.all(p).
				then((result) => {
					result.forEach((switchValue) => {
						switchValue.should.be.equal(0);
					})
				});
		});

	});

	describe('1-wire status operations', function() {

		it('getStatus() promise resolved to valid REST object', function() {
			return ow.getStatus().then(status => {
				status.should.have.property("temperatureSensors").which.is.an.Object();
				status.should.have.property("switches").which.is.an.Object();
				status.should.have.property("humiditySensors").which.is.an.Object();
			});
		});

		it('updateStatus() can change switches', function() {
			ow.getStatus().then(status => {
				// saunaFloorSwitch check:
				status.switches.saunaFloorSwitch = 1;
				ow.updateStatus(status)
					.then(res => {
						res.switches.saunaFloorSwitch.should.be.equal(1);

						res.switches.saunaFloorSwitch = 0;
						ow.updateStatus(res).then(res => {
							res.switches.saunaFloorSwitch.should.be.equal(0);
						});
					});

				// childrenSmallSwitch check:
				status.switches.childrenSmallSwitch = 1;
				ow.updateStatus(status)
					.then(res => {
						res.switches.childrenSmallSwitch.should.be.equal(1);

						res.switches.childrenSmallSwitch = 0;
						ow.updateStatus(res).then(res => {
							res.switches.childrenSmallSwitch.should.be.equal(0);
						});
					});

			});
		})

		it('updateStatus() unknowns do not affect knowns', function() {
			ow.getStatus().then(status => {
				status.switches['unknown_switch'] = 1;

				ow.updateStatus(status).then(updatedStatus => {
					updatedStatus.switches.saunaFloorSwitch.should.be.equal(0);
					updatedStatus.switches.childrenSmallSwitch.should.be.equal(0);
					Object.keys(updatedStatus.switches).length.should.be.equal(2);
				})
			});
		})
	});

	after(function() {
		global.OWDebugMode = false;
	});
});
