var should = require('should');
var http = require('http');

describe('/API/1.1/electricity/consumption testing:', function() {

	it('GetPowerMeterData', function(done) {
		http.get({
			host: 'localhost',
			path: '/API/1.1/consumption/electricity/GetPowerMeterData'
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
});
