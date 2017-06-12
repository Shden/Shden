function GetAPIURL(methodURI)
{
	var APIOptions = {
		debugOrigin: 'http://192.168.1.162',
		prodOrigin: '',
		subdomain: 'API',
		version: '1.1'
	};

	var debugMode = false;

	var subSegments = '/' + APIOptions.subdomain + '/' + APIOptions.version + '/' + methodURI;
	return debugMode
		? APIOptions.debugOrigin + subSegments
		: APIOptions.prodOrigin + subSegments;
}
