const h = require('../heating');
const p = require('../power');
const ow = require('../onewire');
const should = require('should');

global.OWDebugMode = true;

describe('Heating Module Tests:', function() {

	describe('Check preset:', function() {
		it(`44.2 на ТЭН (${ow.sensors.heaterSensor})`, function() {
			ow.getT(ow.sensors.heaterSensor).should.be.eventually.equal(44.2);
		});
		it(`12.44 в спальне (${ow.sensors.bedroomSensor})`, function() {
			ow.getT(ow.sensors.bedroomSensor).should.be.eventually.equal(12.44);
		});
		it(`23.7 в кухне (${ow.sensors.kitchenSensor})`, function() {
			ow.getT(ow.sensors.kitchenSensor).should.be.eventually.equal(23.7);
		});
		it('presenceTemperature is configured at 22.5', function() {
			h.configuration.heating.presenceTemperature.should.be.equal(22.5);
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
		h.configuration.schedule.arrival = _1hourBefore.toISOString();
		h.configuration.schedule.departure = _1dayAfter.toISOString();
	}

	// now is after departure i.e. standby mode
	function toStandbyMode()
	{
		h.configuration.schedule.arrival = _2daysBefore.toISOString();
		h.configuration.schedule.departure = _1dayBefore.toISOString();
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

	describe('Power meter link:', function() {

		it('Check power meter data retrival', function() {
			return p.getPowerMeterData()
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
