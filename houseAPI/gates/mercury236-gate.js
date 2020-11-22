//const { response } = require('express');
const http = require('http');
const config = require('../config/mercury236-config.json');

// Returns promise to bring current power meter data.
function getStatus()
{
	return new Promise((resolved, rejected) => {
		http.get(addAuthorizationHeader({
			host: config.host,
			port: config.port,
                        path: config.path
		}), responce => {
			if (responce.statusCode != 200)
				rejected(responce.statusCode);

			var data = '';
			responce.on('data', b => {
                                data += b;
			});
			responce.on('end', () => {
                                var powerInfo = JSON.parse(data);
				resolved(powerInfo);
			});
			responce.on('error', err => {
				console.log(err);
				rejected(err);
			});
		});
	});
}

// Auxilary method creating adding authorization header to request if required.
function addAuthorizationHeader(request)
{
	if (config.authorizationReqired)
	{
		// need authorization, add header
		var headers = { 'headers' : {
			'Authorization': 'Basic ' +
			new Buffer.from(
				config.userName + ':' +
				config.password).toString('base64')
		}}
		return Object.assign(request, headers);
	}
	else {
		// no authorization required, just return request as is
		return request;
	}
}

// function getStatus()
// {
//         // let data = await getPowerMeterData();
//         // return data;
//         return getPowerMeterData().then(data => { console.log(data); return data });
// }
 
// -- Exports for testing
if (typeof exports !== 'undefined')
{
        // methods
        exports.getStatus = getStatus;
}