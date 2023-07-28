function GetAPIURL(methodURI)
{
	var APIOptions = {
		debugOrigin: 'http://192.168.1.162:3001',
		prodOrigin: 'http://ec2-3-121-211-86.eu-central-1.compute.amazonaws.com:3001',
		subdomain: 'API',
		version: '1.2'
	};

	var debugMode = false;

	var subSegments = '/' + APIOptions.subdomain + '/' + APIOptions.version + '/' + methodURI;
	return debugMode
		? APIOptions.debugOrigin + subSegments
		: APIOptions.prodOrigin + subSegments;
}
