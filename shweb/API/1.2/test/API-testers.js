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

function putTester(url, payload, expectedCode, resultValidator) 
{
	var req = http.request({
		host: API.host,
		port: API.port,
		path: url,
		method: 'PUT'
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
	req.setHeader('Content-Type', 'application/json');
	req.write(JSON.stringify(payload, null, 4), encoding='utf8');
	req.end();
};

if (exports !== undefined)
{
	exports.getTester = getTester;
	exports.putTester = putTester;
}