var should = require('should');
var http = require('http');
var moment = require('moment');

describe('/API/1.1/status testing:', function() {

	it('GetHouseStatus', function(done) {
		http.get({
			host: 'localhost',
			path: '/API/1.1/status/GetHouseStatus'
		}, function(responce) {
			responce.statusCode.should.be.equal(200);
			var data = '';

			responce.on('data', function(b) {
				data += b;
			});
			responce.on('end', function() {
				var status = JSON.parse(data);
				// schedule.should.have.property("from");
				// schedule.should.have.property("to");
				// schedule.should.have.property("active");
				// moment(schedule.from, moment.ISO_8601).isValid().should.be.ok();
				// moment(schedule.to, moment.ISO_8601).isValid().should.be.ok();
				done();
			});
		});

	});

	describe('SetHouseMode tests:', function() {

		function SM(m, expectedStatusCode, done) {
			var req = http.request({
				host: 'localhost',
				path: `/API/1.1/status/SetHouseMode/${m}`,
				method: 'PUT'
			}, function(responce) {
				responce.statusCode.should.be.equal(expectedStatusCode);
				var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
					var status = JSON.parse(data);
					done();
				});
			});
			req.end();
		}

		it('ON', function(done) {
			SM(1, 200, done);
		});

		it('OFF', function(done) {
			SM(0, 200, done);
		});

	});
});
