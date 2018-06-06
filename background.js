
var googleTranslateUrl = 'https://translate.google.com/?hl=vi#', vnToEnPart = 'vi/en/', enToVnPart = 'en/vi/';
var googleAudioUrl = 'https://translate.google.com/translate_tts?client=t&q=[q]&tk=[tk]&tl=', audioTlParamEn = 'en', audioTlParamVn = 'vi';
var iconUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuB5OYVYbBO5fOvt8kR032OtXPgGK3sf-SQy5-NVyPAw0L03oZ';
var englishWords = [
	'wherever',
	'whether',
	'which',
	'while',
	'whisper',
	'whistle',
	'white',
	'who',
	'whoever',
	'whole',
	'whom',
	'whose',
	'why',
	'wide',
	'widely',
	'width',
	'wife',
	'wild',
	'wildly',
	'will',
	'willing',
	'win',
	'wind',
	'window',
	'wine',
	'wing',
	'winner',
	'winning',
	'winter',
	'wire',
	'wise',
	'wish',
	'with',
	'withdraw',
	'within',
	'without',
	'witness',
	'woman',
	'wonder',
	'wonderful',
	'wood',
	'wooden',
	'wool',
	'word',
	'work',
	'worker',
	'working',
	'world',
	'worried',
	'worry',
	'worrying',
	'worse',
	'worship',
	'worst',
	'worth',
	'would',
	'wound',
	'wounded',
	'wrap',
	'wrapping',
	'wrist',
	'write',
	'writer',
	'writing',
	'written',
	'wrong',
	'wrongly',
	'yard',
	'yawn',
	'yeah',
	'year',
	'yellow',
	'yes',
	'yesterday',
	'yet',
	'you',
	'young',
	'your',
	'yours',
	'yourself',
	'youth',
	'zero',
	'zone' 
	];

var responseBean = {};
doTask ();
function doTask () {
	// step 1: open tab to get xhr url to translate EN to VN
	var englishWord = randomEnglishWord();
	initResponseBean('ENTOVN', englishWord);
	openNewTab(responseBean.enToVnGGUrl);
	
	var intervalToGetXhrUrlEnToVnGGUrl =  setInterval(function() {
		
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
			showNofication();
			playAudio(responseBean.response.audio.en.url);
			setTimeout(function(){ 
				playAudio(responseBean.response.audio.vn.url);
				doTask();
			}, 1000);
			
		}
	}, 2000);
}

function populateEnAudio() {
	
	// English audio
	var tkParamVal = parseQueryString(responseBean.response.text.url)['tk'];
	var enAudio = googleAudioUrl.replace('[q]', responseBean.wordNeedToTranlate).replace('[tk]', tkParamVal) + audioTlParamEn;
	responseBean.response.audio.en.tkParam = tkParamVal;
	responseBean.response.audio.en.url = enAudio;
	responseBean.response.audio.en.status = "successful";
}

function populateVNAudio() {
	
	// VN audio
	var vnAudio = googleAudioUrl.replace('[q]', responseBean.response.text.content.translatedText).replace('[tk]', responseBean.response.audio.vn.tkParam) + audioTlParamVn;
	responseBean.response.audio.vn.url = vnAudio;
	responseBean.response.audio.vn.status = "successful"
}


function playAudio(mediaUrl) {
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
	var translatedText = responseJson[0][0][0]
	responseBean.response.text.content.translatedText = translatedText;
	responseBean.response.text.reverseUrl = getVnToEnGGUrlByWord(translatedText);
	responseBean.response.text.status = "successful";
}

function initResponseTextBean() {
	return {
		status: '',
		url:'',
		content:{
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
			populateTranslatedTextToResponseBean(JSON.parse(xhr.responseText));
		}
	}
	xhr.send();
}

function showNofication() {
	chrome.notifications
			.create('notification',
					{
						iconUrl : iconUrl,
						type : 'basic',
						title : responseBean.wordNeedToTranlate,
						message : responseBean.response.text.content.translatedText
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

