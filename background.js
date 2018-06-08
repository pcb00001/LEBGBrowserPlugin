var intervalToGetXhrUrlEnToVnGGUrl;
var googleTranslateUrl = 'https://translate.google.com/?hl=vi#', vnToEnPart = 'vi/en/', enToVnPart = 'en/vi/';
var googleAudioUrl = 'https://translate.google.com/translate_tts?client=t&q=[q]&tk=[tk]&ttsspeed=[ttsspeed]&tl=', audioTlParamEn = 'en', audioTlParamVn = 'vi';
var iconUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuB5OYVYbBO5fOvt8kR032OtXPgGK3sf-SQy5-NVyPAw0L03oZ';
var englishWords = [
	'necessary',
	'although',
	'extraction',
	'extracts',
	'assume',
	'informative',
	'extensively',
	'interaction',
	'behind',
	'wrapper',
	'consult',
	'communication',
	'embedded',
	'workflow',
	'technologies',
	'enclosed',
	'appropriate',
	'relevant',
	'cousin',
	'supplied',
	];

var responseBean = {};
var indexWord = 0;
doTask ();
function doTask () {
	// step 1: open tab to get xhr url to translate EN to VN
	//var englishWord = randomEnglishWord();
	var englishWord = getIncrementEnglishWord();
	initResponseBean('ENTOVN', englishWord);
	openNewTab(responseBean.enToVnGGUrl);
	
	intervalToGetXhrUrlEnToVnGGUrl =  setInterval(function() {
		
		// step 2: do translate the EN word to VN
		if (responseBean.response.text.status == "") {
			responseBean.response.text.status = "processing";
			translate();
		}
		
		// step 3: populate en audio
		if (responseBean.response.text.status == "successful" 
			&& responseBean.response.audio.en.status == "") {
			populateEnAudio();
		}
		
		// step 4: re-translate vn word to get tkParam
		// VN audio
		if (responseBean.response.audio.en.status == "successful" 
				&& responseBean.response.audio.vn.status == "") {
			responseBean.response.audio.vn.status = "processing";
			openNewTab(responseBean.response.text.reverseUrl);
		}
		// step 4: populate vn audio
		// VN audio
		if (responseBean.response.audio.vn.status == "processed") {
			populateVNAudio();
		}
		
		// step final: show notification
		if (responseBean.response.audio.vn.status == "successful") {
			clearInterval(intervalToGetXhrUrlEnToVnGGUrl);
			doLastStep(function() {
				doTask();
			});
		}
	}, 3000);
}


function doLastStep(callback) {
	showNofication();
	playAudio(responseBean.response.audio.en.url);
	setTimeout(function(){ 
		playAudio(responseBean.response.audio.vn.url);
		callback();
	}, 2000);
}

function populateEnAudio() {
	
	// English audio
	var tkParamVal = parseQueryString(responseBean.response.text.url)['tk'];
	var enAudio = googleAudioUrl.replace('[q]', responseBean.wordNeedToTranlate).replace('[tk]', tkParamVal).replace('[ttsspeed]', 0.25) + audioTlParamEn;
	responseBean.response.audio.en.tkParam = tkParamVal;
	responseBean.response.audio.en.url = enAudio;
	responseBean.response.audio.en.status = "successful";
}

function populateVNAudio() {
	
	// VN audio
	var vnAudio = googleAudioUrl.replace('[q]', responseBean.response.text.content.translatedText).replace('[tk]', responseBean.response.audio.vn.tkParam).replace('[ttsspeed]', 1) + audioTlParamVn;
	responseBean.response.audio.vn.url = vnAudio;
	responseBean.response.audio.vn.status = "successful"
}


function playAudio(mediaUrl, playbackRate) {
	var flush = new Audio(mediaUrl);
	flush.play();
}

function initResponseBean(type, wordNeedToTranlate) {
	responseBean['type'] = type; 
	responseBean['wordNeedToTranlate'] = wordNeedToTranlate; 
	responseBean['response'] = {text: initResponseTextBean(), audio:initResponseAudioBean()};
	responseBean['enToVnGGUrl'] = getEnToVnGGUrlByWord(wordNeedToTranlate); 
	responseBean['vnToEnGGUrl'] = getVnToEnGGUrlByWord(wordNeedToTranlate);
}

function populateTranslatedTextToResponseBean(responseJson) {
	var translatedText = '';
	var kindOfWord = '';
	var examples = [];
	try {
		translatedText = responseJson[0][0][0];
	}catch (e){
		console.log("error: " + e);
	}
	try {
		kindOfWord = responseJson[1][0][0];
	}catch (e){
		console.log("error: " + e);
	}
	try {
		examples = responseJson[13][0][0][0];
	}catch (e){
		console.log("error: " + e);
	}
	responseBean.response.text.content.translatedText = translatedText;
	responseBean.response.text.content.kindOfWord = kindOfWord;
	responseBean.response.text.content.examples = examples;
	responseBean.response.text.reverseUrl = getVnToEnGGUrlByWord(translatedText);
	responseBean.response.text.status = "successful";
}

function initResponseTextBean() {
	return {
		status: '',
		url:'',
		content:{
			kindOfWord: '',
			translatedText: '',
			examples: []
		},
		reverseUrl: ''
	};
}

function initResponseAudioBean() {
	return {
		en:{
			status: '',
			tkParam:'',
			url:''
		},
		vn:{
			status: '',
			tkParam:'',
			url:''
		}
	};
}

function getEnToVnGGUrlByWord(word) {
	return googleTranslateUrl + enToVnPart + word;
}

function getVnToEnGGUrlByWord(word) {
	return googleTranslateUrl + vnToEnPart + word;
}

function randomEnglishWord() {
	return englishWords[Math.floor(Math.random() * englishWords.length)];
}

function getIncrementEnglishWord() {
	if (indexWord == (englishWords.length - 1)) {
		indexWord = 0;
	}
	return englishWords[++indexWord];
}

function parseQueryString( queryString ) {
    var params = {}, queries, temp, i, l;
    // Split into key/value pairs
    queries = queryString.split("&");
    // Convert the array of strings into an object
    for ( i = 0, l = queries.length; i < l; i++ ) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }
    return params;
};

function stripHtmlTags(str) {
	if ((str === null) || (str === ''))
		return false;
	else
		str = str.toString();
	return str.replace(/<[^>]*>/g, '');
}


function openNewTab(url) {
	chrome.tabs.create({
		url : url
	});
}

function translate() {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", responseBean.response.text.url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			try{
				populateTranslatedTextToResponseBean(JSON.parse(xhr.responseText));
			} catch(e) {
				console.log("error: " + e);
				clearInterval(intervalToGetXhrUrlEnToVnGGUrl);
				doTask();
			}
			
		}
	}
	xhr.send();
}

function showNofication() {
	var messages = 
		"VN: " + responseBean.response.text.content.translatedText + "(" + responseBean.response.text.content.kindOfWord + ")" +
	((responseBean.response.text.content.examples.length > 0) ? "\nVD: " +	responseBean.response.text.content.examples: "");
	chrome.notifications
			.create('notification',
					{
						iconUrl : iconUrl,
						type : 'basic',
						title : '====== ' + responseBean.wordNeedToTranlate + ' ======',
						message : stripHtmlTags(messages)
					}, function() {
						console.log(responseBean.wordNeedToTranlate + ' => ' + responseBean.wordNeedToTranlate);
					});
}

chrome.webRequest.onBeforeSendHeaders.addListener(function(trafficInfo) {
	if ((trafficInfo.url.indexOf("translate_a/single") != -1
			&& responseBean.response.text.status == "")) {
		responseBean.response.text.url = trafficInfo.url;
		chrome.tabs.remove(trafficInfo.tabId);
	}
	
	if(trafficInfo.url.indexOf("translate_a/single") != -1
				&& responseBean.response.audio.vn.status == "processing") {
		var tkParamVal = parseQueryString(trafficInfo.url)['tk'];
		responseBean.response.audio.vn.tkParam = tkParamVal;
		responseBean.response.audio.vn.status = "processed";
		chrome.tabs.remove(trafficInfo.tabId);
	}
}, {
	urls : [ "<all_urls>" ]
}, [ 'requestHeaders', 'blocking' ]);

