const should = require('should');
const http = require('http');
const API = require('./api-config').config;

describe(`/API/${API.version}/status testing:`, function() {

	it(`GetHouseStatus: GET /API/${API.version}/status/GetHouseStatus`, function(done) {
		http.get({
			host: API.host,
			path: `/API/${API.version}/status/GetHouseStatus`,
			port: API.port
		}, function(responce) {
			responce.statusCode.should.be.equal(200);
			var data = '';

			responce.on('data', function(b) {
				data += b;
			});
			responce.on('end', function() {
				var status = JSON.parse(data);
				// console.log(status)

				status.should.be.an.Object();
				status.should.have.property('climate');
				status.should.have.property('mode');
				status.should.have.property('power');

				done();
			});
		});

	});

	describe(`SetHouseMode tests:`, function() {

		function SM(m, expectedStatusCode, done) {
			var req = http.request({
				host: API.host,
				path: `/API/${API.version}/status/SetHouseMode/${m}`,
				port: API.port,
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

		it(`ON: PUT /API/${API.version}/status/SetHouseMode/1`, function(done) {
			SM(1, 200, done);
		});

		it(`OFF: PUT /API/${API.version}/status/SetHouseMode/0`, function(done) {
			SM(0, 200, done);
		});

	});
});
