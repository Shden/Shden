var h = require('../heating');
var ow = require('../onewire');
var fs = require('fs');
var should = require('should');

global.OWDebugMode = true;

describe('Heating Module Tests:', function() {

	const T = 18.07; // for kitchen and bedroom average T

	describe('Check preset:', function() {
		it(`44.2 на ТЭН (${ow.sensors.heaterSensor})`, function() {
			ow.getT(ow.sensors.heaterSensor).should.be.eventually.equal(44.2);
		});
		it(`${T} в спальне (${ow.sensors.bedroomSensor})`, function() {
			ow.getT(ow.sensors.bedroomSensor).should.be.eventually.equal(T);
		});
		it(`getControlTemperature() is ${T}`, function() {
			h.getControlTemperature().should.be.eventually.equal(T);
		});
		it('presenceTemperature is configured at 22.5', function() {
			h.configuration.heating.presenceTemperature.should.be.equal(22.5);
		});
	});

	describe('Switches are working:', function() {
		it('Heater', function() {
			h.setHeater(1);
			h.getHeaterState().should.be.eventually.equal(1);
			h.setHeater(0);
			h.getHeaterState().should.be.eventually.equal(0);
			(function() { h.setHeater(333); }).should.throw();
		});
		it('Pump', function() {
			h.setPump(1);
			h.getPumpState().should.be.eventually.equal(1);
			h.setPump(0);
			h.getPumpState().should.be.eventually.equal(0);
			(function() { h.setPump(333); }).should.throw();
		});
	});

	describe('Check heating time calculations:', function() {

		it(`Heating duration in hours for current: ${T}C and target ${h.configuration.heating.presenceTemperature}C is 10.06 hours`,
			function() {
				h.getHeatingTime().should.be.eventually.equal(10.06);
			});

		it('Heating start should be 2016-09-30 23:56:24 for arrival at 2016-10-01 10:00',
			function() {
				h.configuration.schedule.arrival = '2016-10-01 10:00';
				h.getHeatingStartTime().should.eventually.eql(
					new Date(2016, 08, 30, 23, 56, 24)
				);
			});

		describe('isPresenceHeating() boundary moments handling check', function() {

			const hoursToMs = 60 * 60 * 1000;

			var heatingTime;

			before(function() {
				return h.getHeatingTime().
					then(time => {
						heatingTime = time;
					});
			});

			it('1 minute BEFORE start heating is OFF', function() {
				h.configuration.schedule.arrival =
					new Date(Date.now() + heatingTime * hoursToMs + 1 * 60 * 1000).toLocaleString();
				h.configuration.schedule.departure =
					new Date(Date.now() + 24 * hoursToMs).toLocaleString();
				return h.isPresenceHeating().
					then(res => {
						res.should.be.equal(false);
					});
			});

			it('1 minute AFTER start heating is ON', function() {
				h.configuration.schedule.arrival =
					new Date(Date.now() + heatingTime * hoursToMs - 1 * 60 * 1000).toLocaleString();
				h.configuration.schedule.departure =
					new Date(Date.now() + 24 * hoursToMs).toLocaleString();
				return h.isPresenceHeating().
					then(res => {
						res.should.be.equal(true);
					});
			});

			it('1 minute BEFORE finish heating is ON', function() {
				h.configuration.schedule.arrival =
					new Date(Date.now() - 1 * hoursToMs).toLocaleString();
				h.configuration.schedule.departure =
					new Date(Date.now() + 1 * 60 * 1000).toLocaleString();
				return h.isPresenceHeating().
					then(res => {
						res.should.be.equal(true);
					});
			});

			it('1 minute AFTER finish heating is OFF', function() {
				h.configuration.schedule.arrival =
					new Date(Date.now() - 1 * hoursToMs).toLocaleString();
				h.configuration.schedule.departure =
					new Date(Date.now() - 1 * 60 * 1000).toLocaleString();
				return h.isPresenceHeating().
					then(res => {
						res.should.be.equal(false);
					});
			});
		});

		describe('isAdvanceNightHeating() tests', function() {

			describe('Day time', function() {

				before(function() {
					toDayTariff();
				});

				it('NO advance heating for day time', function() {
					return h.isAdvanceNightHeating().should.be.equal(false);
				});
			});

			describe('Night time tests', function() {

				before(function() {
					toNightTariff();
					h.configuration.heating.advanceNightHeating = 1;
				});

				it('1 minute before advance night start heating is OFF', function() {
					var _61minPastNow = new Date(Date.now() + 61 * msPerMin);
					h.configuration.schedule.arrival = _61minPastNow.toLocaleString();
					h.configuration.schedule.departure = _2hoursAfter.toLocaleString();
					return h.isAdvanceNightHeating().should.be.equal(false);
				});

				it('1 minute past advance night start heating is ON', function() {
					var _59minPastNow = new Date(Date.now() + 59 * msPerMin);
					h.configuration.schedule.arrival = _59minPastNow.toLocaleString();
					h.configuration.schedule.departure = _2hoursAfter.toLocaleString();
					return h.isAdvanceNightHeating().should.be.equal(true);
				});

				it('1 minute before arrival heating is ON', function() {
					h.configuration.schedule.arrival = _1minAfter.toLocaleString();
					h.configuration.schedule.departure = _2hoursAfter.toLocaleString();
					return h.isAdvanceNightHeating().should.be.equal(true);
				});

				it('1 minute past arrival heating is OFF', function() {
					h.configuration.schedule.arrival = _1minBefore.toLocaleString();
					h.configuration.schedule.departure = _2hoursAfter.toLocaleString();
					return h.isAdvanceNightHeating().should.be.equal(false);
				});
			});

			after(function() {
				h.configuration.heating.nightTariffStartHour = 23;
				h.configuration.heating.nightTariffEndHour = 7;
				h.configuration.heating.advanceNightHeating = 24;
			});

		});
	});

	const msPerMin  = 60 * 1000;
	const msPerHour = 60 * msPerMin;
	const msPerDay  = 24 * msPerHour;

	var _1minBefore = new Date(Date.now() - 1 * msPerMin);
	var _1minAfter  = new Date(Date.now() + 1 * msPerMin);
	var _2minsAfter = new Date(Date.now() + 2 * msPerMin);

	var _1dayBefore  = new Date(Date.now() - 1 * msPerDay);
	var _2daysBefore = new Date(Date.now() - 2 * msPerDay);
	var _1dayAfter   = new Date(Date.now() + 1 * msPerDay);

	var _1hourBefore = new Date(Date.now() - 1 * msPerHour);
	var _1hourAfter  = new Date(Date.now() + 1 * msPerHour);
	var _2hoursAfter = new Date(Date.now() + 2 * msPerHour);

	// now is within arrival..departure dates i.e. presence mode
	function toPresenceMode()
	{
		h.configuration.schedule.arrival = _1dayBefore.toLocaleString();
		h.configuration.schedule.departure = _1dayAfter.toLocaleString();
	}

	// now is after departure i.e. standby mode
	function toStandbyMode()
	{
		h.configuration.schedule.arrival = _2daysBefore.toLocaleString();
		h.configuration.schedule.departure = _1dayBefore.toLocaleString();
	}

	function toDayTariff()
	{
		// from 25 to 26 hours i.e. no saving time
		h.configuration.heating.nightTariffStartHour = 25;
		h.configuration.heating.nightTariffEndHour = 26;
	}

	function toNightTariff()
	{
		// 0 to 24 i.e. always saving tariff
		h.configuration.heating.nightTariffStartHour = 0;
		h.configuration.heating.nightTariffEndHour = 24;
	}

	describe('Helper functions testing:', function() {

		it('checkIfNowWithinInterval positive test', function() {
			h.checkIfNowWithinInterval(
				_1minBefore.getHours(), _1minBefore.getMinutes(),
				_1minAfter.getHours(), _1minAfter.getMinutes()
			).should.be.equal(true);
			h.checkIfNowWithinInterval(
				_1hourBefore.getHours(), _1hourBefore.getMinutes(),
				_1hourAfter.getHours(), _1hourAfter.getMinutes()
			).should.be.equal(true);
		});

		it('checkIfNowWithinInterval negative test', function() {
			h.checkIfNowWithinInterval(
				_1minAfter.getHours(), _1minAfter.getMinutes(),
				_2minsAfter.getHours(), _2minsAfter.getMinutes()
			).should.be.equal(false);
			h.checkIfNowWithinInterval(
				_1hourAfter.getHours(), _1hourAfter.getMinutes(),
				_2hoursAfter.getHours(), _2hoursAfter.getMinutes()
			).should.be.equal(false);
		});
	});

	describe('Target temperature testing:', function() {

		describe('Target temperature testing in presence mode:', function() {

			before(function() {
				toPresenceMode();
			});

			it('Presence temperature during a day time', function() {
				// day time
				h.configuration.heating.comfortSleepStartHour = _1hourAfter.getHours();
				h.configuration.heating.comfortSleepEndHour = _2hoursAfter.getHours();

				h.getTargetTemp().should.be.eventually.equal(
					h.configuration.heating.presenceTemperature
				);
			});

			it('Presence temperature during a sleep time', function() {
				// sleep time
				h.configuration.heating.comfortSleepStartHour = _1hourBefore.getHours();
				h.configuration.heating.comfortSleepEndHour = _1hourAfter.getHours();

				h.getTargetTemp().should.be.eventually.equal(
					h.configuration.heating.comfortSleepTargetTemperature
				);
			});

			after(function() {
				h.configuration.heating.comfortSleepStartHour = 0;
				h.configuration.heating.comfortSleepEndHour = 6;
			})
		});

		describe('Target temperature testing in standby mode:', function () {

			before(function() {
				toStandbyMode();
			});

			it('Standby temperature for day tariff time', function() {
				// set day tariff for now
				h.configuration.heating.nightTariffStartHour = _1hourAfter.getHours();
				h.configuration.heating.nightTariffEndHour = _2hoursAfter.getHours();

				h.getTargetTemp().should.be.eventually.equal(
					h.configuration.heating.standbyTemperature
				);
			});

			it('Standby temperature for night tariff time', function() {
				// set night tariff for now
				h.configuration.heating.nightTariffStartHour = _1hourBefore.getHours();
				h.configuration.heating.nightTariffEndHour = _1hourAfter.getHours();

				h.getTargetTemp().should.be.eventually.equal(
					h.configuration.heating.standbyNightTemperature
				);
			});

			after(function() {
				h.configuration.heating.nightTariffStartHour = 23;
				h.configuration.heating.nightTariffEndHour = 7;
			})
		});
	});

	describe('Room control:', function() {
		it('Valve switch is ON while temperature lower than the target', function() {
			ow.getStubNet()[ow.sensors.childrenSmallSensor].temperature = 10.0;
			h.controlRoom(
				h.configuration.roomControlDescriptors[0],
				20.0
			).then(() => {
				ow.getSwitchState(
					ow.switches.childrenSmallSwitch.address,
					ow.switches.childrenSmallSwitch.channel
				).should.be.eventually.equal(1);
			});
		});
		it('Valve switch is OFF when temperature is above the target', function() {
			ow.getStubNet()[ow.sensors.childrenSmallSensor].temperature = 25.0;
			h.controlRoom(
				h.configuration.roomControlDescriptors[0],
				20.0
			).then(() => {
				ow.getSwitchState(
					ow.switches.childrenSmallSwitch.address,
					ow.switches.childrenSmallSwitch.channel
				).should.be.eventually.equal(0);
			});
		});
	});

	describe('Heating control:', function() {

		describe('Throws and reports on overheat:', function() {


			it('More than 95C is a failire', function(done) {
				(function() { h.controlHeater(22.0, 96.0, 25.0, 0) }).should.throw();
				h.configuration.should.have.property("error");
				h.getPumpState().should.be.eventually.equal(1);
				h.getHeaterState().should.be.eventually.equal(0);
				h.wasOverheated().should.be.equal(true);
				done();
			});

			it('Less than 95C is OK', function(done) {
				delete h.configuration.error;
				(function() { h.controlHeater(22.0, 94.0, 25.0, 0) }).should.not.throw();
				h.configuration.should.not.have.property("error");
				h.wasOverheated().should.be.equal(false);
				done();
			});

			// To clean up alarm temperature flag from configuration.
			after(function() {
				const configurationFileName = __dirname + '/../config/heating.json';
				var cfg = JSON.parse(fs.readFileSync(configurationFileName, 'utf8'));
				delete cfg.error;
				fs.writeFileSync(configurationFileName, JSON.stringify(cfg, null, 4));
			})
		});

		describe('Oven offs heating:', function() {

			it('Small extra temperature from oven does not off heating', function() {
				h.controlHeater(1.0, 85.0, 86.0, 0)
				.then(() => {
					h.getHeaterState().should.be.eventually.equal(1);
				});
			});

			it('More extra temperature from oven offs heating', function() {
				h.controlHeater(1.0, 71.0, 79.0, 0)
				.then(() => {
					h.getHeaterState().should.be.eventually.equal(0);
				});
			});
		});

		describe('Temperature control:', function() {

			it('Heating is ON when colder than target temperature', function() {
				h.getTargetTemp()
				.then((targetTemp) => {
					h.controlHeater(targetTemp - 0.25, 40.0, 40.0, 0)
					.then((heaterState) => {
						h.getHeaterState().should.be.eventually.equal(1);
					});
				});
			});

			it('Heating is OFF when hoter than target temperature', function() {
				h.getTargetTemp()
				.then((targetTemp) => {
					h.controlHeater(targetTemp + 0.25, 40.0, 40.0, 0)
					.then((heaterState) => {
						h.getHeaterState().should.be.eventually.equal(0);
					});
				});
			});
		});

		describe('Power consumption considered:', function() {

			it('Heating is OFF even when colder than needed ' +
			   'but power consumption is high', function() {
				var targetTemp = h.getTargetTemp();
				h.controlHeater(targetTemp - 0.25, 40.0, 40.0, 18000)
					.then((heaterState) => {
						h.getHeaterState().should.be.eventually.equal(0);
					});
			});
		})
	});

	describe('Sauna floor:', function() {

		describe('Off in standby', function() {

			before(function() {
				toStandbyMode();
			});

			it('Off when temperature is lower', function() {
				h.controlSaunaFloor(10, 20).should.be.eventually.equal(0);
			});
			it('Off when temperature is higher', function() {
				h.controlSaunaFloor(20, 10).should.be.eventually.equal(0);
			});
		});
		describe('Control in presence', function() {

			before(function() {
				toPresenceMode();
			});

			it('On when temperature is lower', function() {
				h.controlSaunaFloor(10, 20).should.be.eventually.equal(1);
			});
			it('Off when temperature is higher', function() {
				h.controlSaunaFloor(20, 10).should.be.eventually.equal(0);
			});
		});
	});

	describe('Pump control', function() {

		before(function() {
			h.configuration.heating.stopPumpTempDelta.should.be.equal(2.5);
		});
		it('Off on small deviations', function() {
			h.controlPump([0.0, 2.0, 1.8, 1.99, 2.1, 0.5]).should.be.equal(0);
		});
		it('On for bigger deviations', function() {
			h.controlPump([0.0, 2.0, 3.8, 2.99, 2.1, 0.5]).should.be.equal(1);
		});
	});

	describe('Power meter link:', function() {

		it('Check power meter data retrival', function() {
			return h.getPowerMeterData()
				.then(function(res) {
					res.should.have.property("U");
					res.should.have.property("I");
					res.should.have.property("CosF");
				});
		});

		it('Check power consumption can be retrieved', function() {
			return h.getCurrentPowerConsumption()
				.then(res => {
					res.should.be.a.Number();
				});
		});
	});

	describe('Posting heating data:', function() {

		it('Invalid data points rejected', function() {
			return h.postDataPoint()
				.then(
					res => {
						true.should.be.not.ok(
							'Should have been error.'
						);
					},
					err => {
						// Error expected
						true.should.be.ok();
					}
				);
		});

		it('Valid data points accepted', function() {
			return h.postDataPoint(
				{
					heater			: 44,
					fluid_in		: 20,
					fluid_out		: 30,
					external		: -10,
					am_bedroom		: 21,
					bedroom			: 22,
					cabinet			: 23,
					child_bedroom		: 24,
					kitchen			: 25,
					bathroom_1		: 26,
					bathroom_1_floor	: 27,
					control			: 22,
					heating			: 1,
					pump			: 1,
					bathroom_1_heating	: 1
				}).then(
					res => {
						// Succeess expected
						true.should.be.ok();
					},
					err => {
						console.log(err);
						true.should.be.not.ok(err);
					}
				);
		});
	});

	describe('Command line options:', function() {

		it('Valid option recognised', function() {
			var x = h.parseCommandLine(
				['', '', '--debug', '--dryRun', '--help']);
			x.debug.should.be.equal(true);
			x.dryRun.should.be.equal(true);
			x.help.should.be.equal(true);
			x.should.not.have.property('invalid');
			var y = h.parseCommandLine(
				['', '', '--debug']);
			y.debug.should.be.equal(true);
			y.dryRun.should.be.equal(false);
			y.help.should.be.equal(false);
			y.should.not.have.property('invalid');
		});

		it('Invalid options reported', function() {
			var x = h.parseCommandLine(
				['', '', '--debug', 'wrongItem']
			);
			x.debug.should.be.equal(true);
			x.dryRun.should.be.equal(false);
			x.help.should.be.equal(false);
			x.should.have.property('invalid');
		});
	});
});
