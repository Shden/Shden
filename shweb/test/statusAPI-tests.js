var should = require('should');
var http = require('http');

// -- figure out what API version to test
process.argv.length.should.be.above(3);
process.argv[2].should.be.String();
let API_version = process.argv[2].split('=')[1];
let APIconfig = require('./api-origin-config.json')['API_' + API_version];
console.log(`API configuration:`);
console.log(APIconfig);

describe(`/API/${APIconfig.version}/status testing:`, function() {

	it(`GetHouseStatus: GET /API/${APIconfig.version}/status/GetHouseStatus`, function(done) {
		http.get({
			host: APIconfig.host,
			path: `/API/${APIconfig.version}/status/GetHouseStatus`,
			port: APIconfig.port
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
				status.should.have.property('climate');
				status.should.have.property('mode');
				status.should.have.property('power');

				done();
			});
		});

	});

	describe(`SetHouseMode tests:`, function() {

		function SM(m, expectedStatusCode, done) {
			var req = http.request({
				host: APIconfig.host,
				path: `/API/${APIconfig.version}/status/SetHouseMode/${m}`,
				port: APIconfig.port,
				method: 'PUT'
			}, function(responce) {
				responce.statusCode.should.be.equal(expectedStatusCode);
				var data = '';

				responce.on('data', function(b) {
					data += b;
				});
				responce.on('end', function() {
					var status = JSON.parse(data);
					done();
				});
			});
			req.end();
		}

		it(`ON: PUT /API/${APIconfig.version}/status/SetHouseMode/1`, function(done) {
			SM(1, 200, done);
		});

		it(`OFF: PUT /API/${APIconfig.version}/status/SetHouseMode/0`, function(done) {
			SM(0, 200, done);
		});

	});
});
