function GetAPIURL(methodURI) 
{
	var APIOptions = {
		debugOrigin: 'https://shden.info:8081',
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