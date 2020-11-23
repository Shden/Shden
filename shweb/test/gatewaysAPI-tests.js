const should = require('should');
const http = require('http');
const API = require('./api-config').config;

describe(`/API/${API.version}/gateways testing:`, function() {

	it(`GetStatus: GET /API/${API.version}/gateways/GetStatus`, function(done) {
		http.get({
			host: API.host,
			port: API.port,
			path: `/API/${API.version}/gateways/GetStatus`
		}, function(responce) {
			responce.statusCode.should.be.equal(200);
			var data = '';

			responce.on('data', function(b) {
				data += b;
			});
			responce.on('end', function() {
				var status = JSON.parse(data);
				status.should.have.property("parking");
				status.should.have.property("territory");
				done();
			});
		});
	});

	it.skip('Move', function(done) {
		// Not implemented yet.
	});
});
