const should = require('should');
const http = require('http');
const API = require('./api-config').config;

describe(`/API/${API.version}/lighting testing:`, function() {

	this.timeout(15000);

	describe(`GetStatus`, function() {

		it(`GET /API/${API.version}/lighting/GetStatus returns valid lighting status`, function(done) {
			http.get({
				host: API.host,
				path: `/API/${API.version}/lighting/GetStatus`,
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
					status.should.have.property('streetLight250').which.is.a.Number();
					status.should.have.property('streetLight150').which.is.a.Number();
					status.should.have.property('balkonLight').which.is.a.Number();
					status.should.have.property('fenceLight').which.is.a.Number();

					done();
				});
			});

		});
	});

	describe(`ChangeStatus`, function() {

		function CS(a, m, expectedStatusCode, done) {
			var req = http.request({
				host: API.host,
				path: `/API/${API.version}/lighting/ChangeStatus/${a},${m}`,
				port: API.port,
				method: 'PUT'
			}, function(responce) {
				responce.statusCode.should.be.equal(expectedStatusCode);
				var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
					if (responce.statusCode == 200)
						var status = JSON.parse(data);
					done();
				});
			});
			req.end();
		}

                const testAppliance = 'fenceLight';

		it(`PUT /API/${API.version}/lighting/ChangeStatus/${testAppliance}/1 sets to ON`, function(done) {
			CS(testAppliance, 1, 200, done);
		});

		it(`PUT /API/${API.version}/lighting/ChangeStatus/${testAppliance}/0 sets to standby mode`, function(done) {
			CS(testAppliance, 0, 200, done);
		});

		it(`PUT /API/${API.version}/lighting/ChangeStatus/${testAppliance}/222 raises exception 400`, function(done) {
			CS(testAppliance, 222, 400, done);
		});

	});
});
