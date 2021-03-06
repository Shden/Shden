const should = require('should');
const http = require('http');
const HTTPStatus = require('http-status-codes').StatusCodes;
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
				responce.statusCode.should.be.equal(HTTPStatus.OK);
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
					status.should.have.property('balconyLight').which.is.a.Number();
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
				path: `/API/${API.version}/lighting/ChangeStatus/${a}/${m}`,
				port: API.port,
				method: 'PUT'
			}, function(responce) {
				responce.statusCode.should.be.equal(expectedStatusCode);
				var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
					if (responce.statusCode == HTTPStatus.OK)
						JSON.parse(data);
					done();
				});
			});
			req.end();
		}

                const testAppliance = 'fenceLight';

		it(`PUT /API/${API.version}/lighting/ChangeStatus/${testAppliance}/1 sets to ON`, function(done) {
			CS(testAppliance, 1, HTTPStatus.OK, done);
		});

		it(`PUT /API/${API.version}/lighting/ChangeStatus/${testAppliance}/0 sets to OFF`, function(done) {
			CS(testAppliance, 0, HTTPStatus.OK, done);
		});

		it(`PUT /API/${API.version}/lighting/ChangeStatus/${testAppliance}/222 raises exception`, function(done) {
			CS(testAppliance, 222, HTTPStatus.BAD_REQUEST, done);
		});

	});
});
