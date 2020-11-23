const should = require('should');
const http = require('http');
const API = require('./api-config').config;

describe(`/API/${API.version}/electricity/consumption testing:`, function() {

	it(`GetPowerMeterData: GET /API/${API.version}/consumption/electricity/GetPowerMeterData`, function(done) {
		http.get({
			host: API.host,
			port: API.port,
			path: `/API/${API.version}/consumption/electricity/GetPowerMeterData`
		}, function(responce) {
			responce.statusCode.should.be.equal(200);
			var data = '';

			responce.on('data', function(b) {
				data += b;
			});
			responce.on('end', function() {
				var info = JSON.parse(data);
				info.should.have.property("U");
				info.should.have.property("I");
				info.should.have.property("CosF");
				info.should.have.property("F");
				info.should.have.property("A");
				info.should.have.property("P");
				info.should.have.property("S");
				info.should.have.property("PR");
				info.should.have.property("PR-day");
				info.should.have.property("PR-night");
				info.should.have.property("PY");
				info.should.have.property("PT");
				done();
			});
		});
	});

	it(`GetPowerConsumptionByHours: GET /API/${API.version}/consumption/electricity/GetPowerConsumptionByHours/1`, function(done) {
		http.get({
			host: API.host,
			port: API.port,
			path: `/API/${API.version}/consumption/electricity/GetPowerConsumptionByHours/1`
		}, function(responce) {
			responce.statusCode.should.be.equal(200);
			var data = '';

			responce.on('data', function(b) {
				data += b;
			});

			responce.on('end', function() {
				// TODO: add resulting data validation.
				done();
			});
		});
	});

	it(`GetPowerConsumptionByDays: GET /API/${API.version}/consumption/electricity/GetPowerConsumptionByDays/1`, function(done) {
		http.get({
			host: API.host,
			port: API.port,
			path: `/API/${API.version}/consumption/electricity/GetPowerConsumptionByDays/1`
		}, function(responce) {
			responce.statusCode.should.be.equal(200);
			var data = '';

			responce.on('data', function(b) {
				data += b;
			});

			responce.on('end', function() {
				// TODO: add resulting data validation.
				done();
			});
		});
	});
});
