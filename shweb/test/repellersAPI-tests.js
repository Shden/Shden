var should = require('should');
var http = require('http');

describe('/API/1.1/repellers testing:', function() {

	this.timeout(5000);

	it('GetStatus', function(done) {
		http.get({
			host: 'localhost',
			path: '/API/1.1/repellers/GetStatus'
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

	describe('SetStatus', function() {

		it('ON', function(done) {
			var req = http.request({
				host: 'localhost',
				path: '/API/1.1/repellers/SetStatus/1',
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

		it('OFF', function(done) {
			var req = http.request({
				host: 'localhost',
				path: '/API/1.1/repellers/SetStatus/0',
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

	it('RefreshPulse', function(done) {
		http.get({
			host: 'localhost',
			path: '/API/1.1/repellers/RefreshPulse'
		}, function(responce) {
			responce.statusCode.should.be.equal(200);

			responce.on('end', function() {
				done();
			});
		});
	});
});
