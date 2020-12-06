const should = require('should');
const http = require('http');
const HTTPStatus = require('http-status-codes');
const API = require('./api-config').config;

function getTester(url, expectedCode, resultValidator)
{
	http.get({
		host: API.host,
		port: API.port,
		path: url
	}, function(responce) {
		responce.statusCode.should.be.equal(expectedCode);
		var data = '';

		responce.on('data', function(b) {
			data += b;
		});

		responce.on('end', function() {
			resultValidator(data);
		});
	});
}

describe(`/API/${API.version}/electricity/consumption testing:`, function() {

	let getPowerMeterDataURL = `/API/${API.version}/consumption/electricity/GetPowerMeterData`;
	it(`GetPowerMeterData: GET ${getPowerMeterDataURL}`, function(done) {
		this.timeout(15000);
		getTester(getPowerMeterDataURL, HTTPStatus.OK, (responce) => {
			var powerData = JSON.parse(responce);
			powerData.should.have.property("U");
			powerData.should.have.property("I");
			powerData.should.have.property("CosF");
			powerData.should.have.property("F");
			powerData.should.have.property("A");
			powerData.should.have.property("P");
			powerData.should.have.property("S");
			powerData.should.have.property("PR");
			powerData.should.have.property("PR-day");
			powerData.should.have.property("PR-night");
			powerData.should.have.property("PY");
			powerData.should.have.property("PT");
			done();
		})
	});

	let getPowerStatisticsURL = `/API/${API.version}/consumption/electricity/GetPowerStatistics/1`;
	it(`GetPowerStatistics GET ${getPowerStatisticsURL}`, function(done) {
		getTester(getPowerStatisticsURL, HTTPStatus.OK, (r) => { done() });
	})

	let getPowerConsumptionByHoursURL = `/API/${API.version}/consumption/electricity/GetPowerConsumptionByHours/1`;
	it(`GetPowerConsumptionByHours: GET ${getPowerConsumptionByHoursURL}`, function(done) {
		getTester(getPowerConsumptionByHoursURL, HTTPStatus.OK, (r) => { done() });
	});

	let getPowerConsumptionByDaysURL = `/API/${API.version}/consumption/electricity/GetPowerConsumptionByDays/1`;
	it(`GetPowerConsumptionByDays: GET ${getPowerConsumptionByDaysURL}`, function(done) {
		getTester(getPowerConsumptionByDaysURL, HTTPStatus.OK, (r) => { done() });
	});
});
