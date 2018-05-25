

var tabIds = [];
chrome.webRequest.onBeforeSendHeaders.addListener(function(trafficInfo) {
	if (trafficInfo.url.indexOf("translate_a") != -1) {
		chrome.tabs.get(trafficInfo.tabId, function(tabInfo) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", trafficInfo.url, true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					// WARNING! Might be injecting a malicious script!
					console.log(xhr.responseText);
				}
			}
			xhr.send();
		});
	}
	
}, {
	urls : [ "<all_urls>" ]
}, [ 'requestHeaders', 'blocking' ]);

var mediaPattern = [ 'videoplayback', 'streaming.phimmoi', '.ts', 'openload',
		'oload', 'drive.google' ];
var ingorePattern = [ 'localhost', 'chrome-extension', 'ssl.p.jwpcdn.com' ];

function isUrlContentMatched(url, matches) {

	for (i = 0; i < matches.length; i++) {
		if (url.indexOf(matches[i]) != -1) {
			return true;
		}
	}
	return false;
}

function getDomain(url) {
	return url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
}

function getValueRequestHeaderByKey(requestHeaders, keyRequest) {
	for ( var key in requestHeaders) {
		if (requestHeaders.hasOwnProperty(key)
				&& requestHeaders[key].name == keyRequest) {
			console.log(key + " -> " + requestHeaders[key].value);
			return requestHeaders[key].value;
		}
	}
}

Array.prototype.remove = function() {
	var what, a = arguments, L = a.length, ax;
	while (L && this.length) {
		what = a[--L];
		while ((ax = this.indexOf(what)) !== -1) {
			this.splice(ax, 1);
		}
	}
	return this;
};
