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
			ow.getStubNet().should.have.property(ow.temperatureSensors.fluid_in);
			ow.getStubNet().should.have.property(ow.temperatureSensors.bedroom);
			ow.getStubNet().should.have.property(ow.temperatureSensors.outsideTemp);
		});

		it('stubnet has switches', function() {
			ow.getStubNet().should.have.property(ow.switches.saunaFloorSwitch.address);
			ow.getStubNet().should.have.property(ow.switches.childrenSmallSwitch.address);
		});
	});

	describe('Temperature', function() {
		
		it('1-wire stub has temperature sensors', function() {
			ow.getStubNet()[ow.temperatureSensors.fluid_in].should.have.property("temperature").which.is.a.Number();
			ow.getStubNet()[ow.temperatureSensors.bedroom].should.have.property("temperature").which.is.a.Number();
			ow.getStubNet()[ow.temperatureSensors.outsideTemp].should.have.property("temperature").which.is.a.Number();
		});

		it('getT() returns temperature', function() {
			ow.getT(ow.temperatureSensors.fluid_in).should.be.eventually.equal(32.6);
			ow.getT(ow.temperatureSensors.bedroom).should.be.eventually.a.Number();
			ow.getT(ow.temperatureSensors.outsideTemp).should.be.eventually.a.Number();
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

		describe('updateStatus() for valid switches works', function() {

			function checkSwitch(switchName) { 
				return ow.getStatus().then(status => {
					status.should.not.be.null();
					status.should.be.an.Object();
					
					let newState = {
						switches : { }
					};
					// toggle state
					newState.switches[switchName] = (status.switches[switchName]) ? 0 : 1;
					ow.updateStatus(newState).then(result => {
						result.switches[switchName].should.be.equal(newState.switches[switchName]);
					});
				});
			};

			it('saunaFloorSwitch works', function() {
				return checkSwitch('saunaFloorSwitch');
			});

			it('childrenSmallSwitch works', function() {
				return checkSwitch('childrenSmallSwitch');
			});
		});

		it('updateStatus() for unknowns do not affect knowns', function() {
			let wrongUpdateWithUnknownSensor = {
				switches : { 
					unknown_switch : 1
				}
			};

			return ow.updateStatus(wrongUpdateWithUnknownSensor).then(updatedStatus => {
				updatedStatus.switches.saunaFloorSwitch.should.be.equal(0);
				updatedStatus.switches.childrenSmallSwitch.should.be.equal(0);
				Object.keys(updatedStatus.switches).length.should.be.equal(Object.keys(ow.switches).length);
			});
		});

		it('updateStatus() rejects temperatureSensors updates', function() {
			let wrongUpdateWithTemperatureSensors = {
				temperatureSensors : {
					sensor1 : 10,
					sensor2 : 18.5
				}
			}

			ow.updateStatus(wrongUpdateWithTemperatureSensors).should.be.rejected();
		});

		it('updateStatus() rejects humiditySensors updates', function() {
			let wrongUpdateWithHumiditySensors = {
				humiditySensors : {
					sensor1 : 10,
					sensor2 : 18.5
				}
			}

			ow.updateStatus(wrongUpdateWithHumiditySensors).should.be.rejected();
		});
	});

	after(function() {
		global.OWDebugMode = false;
	});
});
