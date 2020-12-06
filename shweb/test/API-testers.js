const http = require('http');
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

exports.getTester = getTester;