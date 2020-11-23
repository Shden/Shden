const should = require('should');
const http = require('http');
const API = require('./api-config').config;

describe(`/API/${API.version}/repellers testing:`, function() {

	it(`GetStatus: GET /API/${API.version}/repellers/GetStatus`, function(done) {
		http.get({
			host: API.host,
			port: API.port,
			path: `/API/${API.version}/repellers/GetStatus`
		}, function(responce) {
			responce.statusCode.should.be.equal(200);
			var data = '';

			responce.on('data', function(b) {
				data += b;
			});
			responce.on('end', function() {
				var status = JSON.parse(data);
				status.should.have.property("kitchen");
				done();
			});
		});
	});

	describe('SetStatus tests:', function() {

		it(`ON: PUT /API/${API.version}/repellers/SetStatus/1`, function(done) {
			var req = http.request({
				host: API.host,
				port: API.port,
				path: `/API/${API.version}/repellers/SetStatus/1`,
				method: 'PUT'
			}, function(responce) {
				responce.statusCode.should.be.equal(200);
				var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
					var status = JSON.parse(data);
					status.should.have.property("kitchen");
					status.kitchen.should.be.equal(1);
					done();
				});
			});
			req.end();
		});

		it(`OFF: PUT /API/${API.version}/repellers/SetStatus/0`, function(done) {
			var req = http.request({
				host: API.host,
				port: API.port,
				path: `/API/${API.version}/repellers/SetStatus/0`,
				method: 'PUT'
			}, function(responce) {
				responce.statusCode.should.be.equal(200);
				var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
					var status = JSON.parse(data);
					status.should.have.property("kitchen");
					status.kitchen.should.be.equal(0);
					done();
				});
			});
			req.end();
		});
	});

	it(`RefreshPulse: GET /API/${API.version}/repellers/RefreshPulse`, function(done) {
		http.get({
			host: API.host,
			port: API.port,
			path: `/API/${API.version}/repellers/RefreshPulse`
		}, function(responce) {
			responce.statusCode.should.be.equal(200);
			done();
		});
	});
});
