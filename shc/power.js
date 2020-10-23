// Obtains mains status and info and publishes power status updates.
const mp = require('./mqtt-publish');
const http = require('http');

const APIcredentialsFileName = __dirname + '/config/api-credentials.json';

// read credentials file
var APIcredentials = require(APIcredentialsFileName);

if (require.main === module)
{
        getPowerMeterData()
                .then(result => {
                        mp.publishPowerDataPoint(result);
                })
}

// Returns promise to bring current power meter data.
function getPowerMeterData()
{
	return new Promise((resolved, rejected) => {
		http.get(addAuthorizationHeader({
			host: '192.168.1.162',
			port: 81,
			path: '/API/1.1/consumption/electricity/GetPowerMeterData'
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
	if (APIcredentials.authorizationReqired)
	{
		// need authorization, add header
		var headers = { 'headers' : {
			'Authorization': 'Basic ' +
			new Buffer.from(
				APIcredentials.userName + ':' +
				APIcredentials.password).toString('base64')
		}}
		return Object.assign(request, headers);
	}
	else {
		// no authorization required, just return request as is
		return request;
	}
}
 
// -- Exports for testing
if (typeof exports !== 'undefined')
{
        // methods
        exports.getPowerMeterData = getPowerMeterData;
}