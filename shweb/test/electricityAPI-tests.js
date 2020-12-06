const should = require('should');
const testers = require('./API-testers');
const HTTPStatus = require('http-status-codes');
const API = require('./api-config').config;


describe(`/API/${API.version}/electricity/consumption testing:`, function() {

	let getPowerMeterDataURL = `/API/${API.version}/consumption/electricity/GetPowerMeterData`;
	it(`GetPowerMeterData: GET ${getPowerMeterDataURL}`, function(done) {
		this.timeout(15000);

		testers.getTester(getPowerMeterDataURL, HTTPStatus.OK, (responce) => {
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
		testers.getTester(getPowerStatisticsURL, HTTPStatus.OK, (r) => { done() });
	})

	let getPowerConsumptionByHoursURL = `/API/${API.version}/consumption/electricity/GetPowerConsumptionByHours/1`;
	it(`GetPowerConsumptionByHours: GET ${getPowerConsumptionByHoursURL}`, function(done) {
		testers.getTester(getPowerConsumptionByHoursURL, HTTPStatus.OK, (r) => { done() });
	});

	let getPowerConsumptionByDaysURL = `/API/${API.version}/consumption/electricity/GetPowerConsumptionByDays/1`;
	it(`GetPowerConsumptionByDays: GET ${getPowerConsumptionByDaysURL}`, function(done) {
		testers.getTester(getPowerConsumptionByDaysURL, HTTPStatus.OK, (r) => { done() });
	});
});
