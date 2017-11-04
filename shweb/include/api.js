function GetAPIURL(methodURI)
{
	var APIOptions = {
		debugOrigin: 'http://shden.info:8080',
		prodOrigin: '',
		subdomain: 'API',
		version: '1.1'
	};

	var debugMode = true;

	var subSegments = '/' + APIOptions.subdomain + '/' + APIOptions.version + '/' + methodURI;
	return debugMode
		? APIOptions.debugOrigin + subSegments
		: APIOptions.prodOrigin + subSegments;
}
