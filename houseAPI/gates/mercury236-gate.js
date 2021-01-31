const http = require('http');
const config = require('../config/mercury236-config.json');
const HTTPStatus = require('http-status-codes').StatusCodes;

// Returns promise to bring current power meter data.
function getStatus()
{
	if (config.powerMeterCommunicationMode.API == 1)
		return getPowerMeterDataByAPI();

	if (config.powerMeterCommunicationMode.localProcessExec == 1)
		return getPowerMeterDataByLocalProcessExec();
}

function getPowerMeterDataByLocalProcessExec()
{
	return new Promise((resolved, rejected) => {
		var child = require('child_process').execFile(config.mercury236cmd.exec, [ 
			config.mercury236cmd.RS485dongle, 
			// '--testRun',
			'--json'
		], function(err, stdout, stderr) { 
			if (err) {
				rejected(stderr);
			}
			// console.log(stdout); 
			resolved(JSON.parse(stdout));
		});
	}); 
}

function getPowerMeterDataByAPI()
{
	return new Promise((resolved, rejected) => {
		http.get(addAuthorizationHeader({
			host: config.host,
			port: config.port,
                        path: config.path
		}), responce => {
			if (responce.statusCode != HTTPStatus.OK)
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

if (typeof exports !== 'undefined')
{
        // methods
        exports.getStatus = getStatus;
}