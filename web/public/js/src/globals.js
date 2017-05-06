(function(SSLIMS, undefined) {
	
	SSLIMS.API_VERSION = '1.0';

	SSLIMS.API_HOST = 'api.' + ((window.location.hostname == 'ci-sslims-0.icbr.local') ? window.location.hostname : 'sslims.biotech.ufl.edu');
	SSLIMS.API_URL_BASE = window.location.protocol + '//' + SSLIMS.API_HOST;
	SSLIMS.API_URL = SSLIMS.API_URL_BASE + '/v' + SSLIMS.API_VERSION;

	SSLIMS.WEB_HOST = window.location.hostname;
	SSLIMS.WEB_URL = window.location.protocol + '//' + SSLIMS.WEB_HOST;

	SSLIMS.ls = window.localStorage;

}(window.SSLIMS = window.SSLIMS || {}));

