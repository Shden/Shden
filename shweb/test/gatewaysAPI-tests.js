var should = require('should');
var http = require('http');

describe('/API/1.1/gateways testing:', function() {

	it('GetStatus', function(done) {
		http.get({
			host: 'localhost',
			path: '/API/1.1/gateways/GetStatus'
		}, function(responce) {
			responce.statusCode.should.be.equal(200);
			var data = '';

			responce.on('data', function(b) {
				data += b;
			});
			responce.on('end', function() {
				var status = JSON.parse(data);
				info.should.have.property("parking");
				info.should.have.property("territory");
				done();
			});
		});
	});

	it.skip('Move', function(done) {
		// Not implemented yet.
	});
});
