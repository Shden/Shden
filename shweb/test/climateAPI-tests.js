var should = require('should');
var http = require('http');
var moment = require('moment');

describe('/API/1.1/climate testing:', function() {

	describe('Schedule testing:', function() {

		it('GetSchedule', function(done) {
			http.get({
				host: 'localhost',
				path: '/API/1.1/climate/GetSchedule'
			}, function(responce) {
				responce.statusCode.should.be.equal(200);
				var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
					var schedule = JSON.parse(data);
					schedule.should.have.property("from");
					schedule.should.have.property("to");
					schedule.should.have.property("active");
					moment(schedule.from, moment.ISO_8601).isValid().should.be.ok();
					moment(schedule.to, moment.ISO_8601).isValid().should.be.ok();
					done();
				});
			});
		});

		it('SetSchedule', function(done) {
			var req = http.request({
				host: 'localhost',
				path: '/API/1.1/climate/SetSchedule/2016/10/1/19/2016/10/2/21',
				method: 'PUT'
			}, function(responce) {
				responce.statusCode.should.be.equal(200);
				var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
					var schedule = JSON.parse(data);
					schedule.should.have.property("from");
					schedule.should.have.property("to");
					schedule.should.have.property("active");
					moment(schedule.from, moment.ISO_8601).isValid().should.be.ok();
					moment(schedule.to, moment.ISO_8601).isValid().should.be.ok();
					moment(schedule.from, moment.ISO_8601).isSame(moment("2016-10-01 19:00")).should.be.ok();
					moment(schedule.to, moment.ISO_8601).isSame(moment("2016-10-02 21:00")).should.be.ok();
					done();
				});
			});
			req.end();
		});

		it('ResetSchedule', function(done) {
			var req = http.request({
				host: 'localhost',
				path: '/API/1.1/climate/ResetSchedule',
				method: 'PUT'
			}, function(responce) {
				responce.statusCode.should.be.equal(200);
				var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
					var schedule = JSON.parse(data);
					schedule.should.have.property("from");
					schedule.should.have.property("to");
					schedule.should.have.property("active");
					moment(schedule.from, moment.ISO_8601).isValid().should.be.ok();
					moment(schedule.to, moment.ISO_8601).isValid().should.be.ok();
					moment(schedule.from, moment.ISO_8601).isSame(moment("1990-01-01 00:00")).should.be.ok();
					moment(schedule.to, moment.ISO_8601).isSame(moment("1990-01-01 00:00")).should.be.ok();
					done();
				});
			});
			req.end();
		});
	});

	describe.skip('Statistics testing:', function() {

		it('GetTempHistory', function(done) {

		});
		it('GetHumidityHistory', function(done) {

		});
		it('GetTempStatistics', function(done) {

		});
		it('GetHeatingConsumption', function(done) {

		});
	});

	describe('Heating configuration testing:', function() {

		var config;
		it('Get heating configuration', function(done) {
			http.get({
				host: 'localhost',
				path: '/API/1.1/climate/Configuration'
			}, function(responce) {
				responce.statusCode.should.be.equal(200);
				var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
					config = JSON.parse(data);
					config.should.have.property("heating");
					config.should.have.property("schedule");
					done();
				});
			});
		});

		it('Put heating configuration', function(done) {
			var req = http.request({
				host: 'localhost',
				path: '/API/1.1/climate/Configuration',
				method: 'PUT'
			}, function(responce) {
				responce.statusCode.should.be.equal(200);
				var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
					done();
				});
			});
			req.write(JSON.stringify(config, null, 4), encoding='utf8');
			req.end();
		});
	});

	describe('Heating data reporing:', function() {

		it('Post heating data point (deprecate)', function(done) {
			var request = http.request({
				host: 'localhost',
				path: '/API/1.1/climate/data/heating',
				method: 'POST'
			}, responce => {
				var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
					responce.statusCode.should.be.equal(200, data);
					done();
				});
			});
			request.write(
				JSON.stringify({
					heater			: 22,
					fluid_in		: 38.5,
					fluid_out		: 42.19,
					external		: -3.8,
					am_bedroom		: 21,
					bedroom			: 22,
					cabinet			: 20.8,
					child_bedroom		: 22.6,
					kitchen			: 23.16,
					bathroom_1		: 24.9,
					bathroom_1_floor	: 27.96,
					control			: 22,
					heating			: 1,
					pump			: 1,
					bathroom_1_heating	: 1
				}, null, 4),
				encoding='utf8');
			request.end();
		});
	});

	describe('Temperature sensors data reporting:', function() {

		it('Post valid temperature data', function(done) {
			var request = http.request({
				host: 'localhost',
				path: '/API/1.1/climate/data/temperature',
				method: 'POST'
			}, responce => {
				var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
					responce.statusCode.should.be.equal(200, data);
					done();
				});
			});
			request.write(
				JSON.stringify([{
					temperature	: 22,
					sensorId	: '28FF72BF47160342'
				}], null, 4),
				encoding='utf8');
			request.end();
		});

		it('Post invalid temperature data', function(done) {
			var request = http.request({
				host: 'localhost',
				path: '/API/1.1/climate/data/temperature',
				method: 'POST'
			}, responce => {
				var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
					responce.statusCode.should.be.equal(400, data);
					done();
				});
			});
			request.write(
				JSON.stringify({
					temperature	: 999,
					sensor		: 'DS1820_ID'
				}, null, 4),
				encoding='utf8');
			request.end();
		});
	});
});
