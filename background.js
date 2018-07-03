var configSetting = {
	notifyTimeDelay: 3,
	listWords: [{
            "enWord": "Hello",
            "vnWord": "Xin chào",
            "spelling": ""
        }],
	sound: ['en', 'vn'],
	encounter: 'random'
}

var intervalToGetXhrUrlEnToVnGGUrl;
var googleTranslateUrl = 'https://translate.google.com/?hl=vi#',
	vnToEnPart = 'vi/en/',
	enToVnPart = 'en/vi/';
var googleAudioUrl = 'https://translate.google.com/translate_tts?client=t&q=[q]&tk=[tk]&ttsspeed=[ttsspeed]&tl=',
	audioTlParamEn = 'en',
	audioTlParamVn = 'vi';
var imageSearchUrl = 'https://www.google.com/search?q=[q]&tbm=isch';
var iconUrl = 'icon.png';

var responseBean = {};
var indexWord = 0;
var currentTabId = -1;
var isAppRunning = 0;
var settingPageTabId = -1;

//recive message from content script
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	console.log("Performing content's event:" + JSON.stringify(msg));
	switch (msg.type) {
		case 'updateSetting':
			configSetting = msg.setting;
			resetVariable();
			break;
	}

	//sendResponse();
});

function resetVariable() {
	indexWord = 0;
}

//recive message from popup script
chrome.runtime.onConnect.addListener(function (port) {
	console.log("Background connected .....");
	port.postMessage({
		isAppRunning: isAppRunning,
		currentTabId: currentTabId,
		settingPageTabId: settingPageTabId
	});
	port.onMessage.addListener(function (msg) {

		console.log("Performing popup's event:" + msg);
		switch (msg.type) {
			case 'beginLearningEvent':
				isAppRunning = 1;
				doTask();
				break;
			case 'stopLearningEvent':
				isAppRunning = 0;
				clearInterval(intervalToGetXhrUrlEnToVnGGUrl);
				break;
		}
	});
})

function doTask() {
	// step 1: open tab to get xhr url to translate EN to VN
	//var englishWord = randomEnglishWord();
	var englishWordBean = (configSetting.encounter == 'random') ? randomEnglishWord() : getIncrementEnglishWord();
	initResponseBean(englishWordBean);
	queryNewWord(responseBean.enToVnGGUrl);
	intervalToGetXhrUrlEnToVnGGUrl = setInterval(function () {

		// step 2: do translate the EN word to VN
		if (responseBean.response.text.status == "") {
			responseBean.response.text.status = "processing";
			translate();
		}

		// step 3: do get thumb image
		if (responseBean.response.text.status == "successful" &&
			responseBean.response.thumb.status == "") {
			responseBean.response.thumb.status = "processing";
			populateThumb();
		}

		// step 4: populate en audio
		if (responseBean.response.text.status == "successful" && 
			responseBean.response.audio.en.status == "") {
			populateEnAudio();
		}

		// step 5: re-translate vn word to get tkParam
		// VN audio
		if (responseBean.response.audio.en.status == "successful" &&
			responseBean.response.thumb.status == "successful" &&
			responseBean.response.audio.vn.status == "") {
			responseBean.response.audio.vn.status = "processing";
			queryNewWord(responseBean.response.text.reverseUrl);
		}
		// step 4: populate vn audio
		// VN audio
		if (responseBean.response.audio.vn.status == "processed") {
			populateVNAudio();
		}

		// step final: show notification
		if (responseBean.response.audio.vn.status == "successful") {
			clearInterval(intervalToGetXhrUrlEnToVnGGUrl);
			doLastStep(function () {
				doTask();
			});
		}
	}, configSetting.notifyTimeDelay * 1000);
}


function doLastStep(callback) {
	showNofication();
	if (configSetting.sound.indexOf('en') != -1 && configSetting.sound.indexOf('vn') == -1) {
		playAudio(responseBean.response.audio.en.url);
		callback();
	} else if (configSetting.sound.indexOf('en') == -1 && configSetting.sound.indexOf('vn') != -1) {
		playAudio(responseBean.response.audio.vn.url);
		callback();
	} else if (configSetting.sound.indexOf('en') != -1 && configSetting.sound.indexOf('vn') != -1) {
		playAudio(responseBean.response.audio.en.url);
		setTimeout(function () {
			playAudio(responseBean.response.audio.vn.url);
			callback();
		}, 2000);
	} else {
		setTimeout(function () {
			callback();
		}, 2000);
	}
}

function populateEnAudio() {

	// English audio
	var tkParamVal = parseQueryString(responseBean.response.text.url)['tk'];
	var enAudio = googleAudioUrl.replace('[q]', responseBean.wordNeedToTranlateBean.enWord).replace('[tk]', tkParamVal).replace('[ttsspeed]', 0.5) + audioTlParamEn;
	responseBean.response.audio.en.tkParam = tkParamVal;
	responseBean.response.audio.en.url = encodeURI(enAudio);
	responseBean.response.audio.en.status = "successful";
}

function populateVNAudio() {

	// VN audio
	var vnAudio = googleAudioUrl.replace('[q]', responseBean.response.text.content.translatedText).replace('[tk]', responseBean.response.audio.vn.tkParam).replace('[ttsspeed]', 1) + audioTlParamVn;
	responseBean.response.audio.vn.url = encodeURI(vnAudio);
	responseBean.response.audio.vn.status = "successful"
}


function playAudio(mediaUrl) {
	var flush = new Audio(mediaUrl);
	flush.play();
}

function initResponseBean(wordNeedToTranlateBean) {
	responseBean['wordNeedToTranlateBean'] = wordNeedToTranlateBean;
	responseBean['response'] = {
		text: initResponseTextBean(wordNeedToTranlateBean),
		thumb: initResponseThumbBean(),
		audio: initResponseAudioBean()
	};
	responseBean['enToVnGGUrl'] = getEnToVnGGUrlByWord(wordNeedToTranlateBean);
	responseBean['vnToEnGGUrl'] = '';
	responseBean['imageSearchUrl'] = getThumbGGUrlByWord(wordNeedToTranlateBean);
}

function populateTranslatedTextToResponseBean(responseJson) {
	var translatedText = '';
	var kindOfWord = '';
	var examples = [];
	try {
		if (responseBean.response.text.content.translatedText != "") {
			translatedText = responseBean.response.text.content.translatedText;
		} else {
			translatedText = responseJson[0][0][0];
			responseBean.response.text.content.translatedText = translatedText;
		}
	} catch (e) {
		console.log("error: " + e);
	}
	try {
		kindOfWord = responseJson[1][0][0];
	} catch (e) {
		console.log("error: " + e);
	}
	try {
		examples = responseJson[13][0][0][0];
	} catch (e) {
		console.log("error: " + e);
	}

	
	responseBean.response.text.content.kindOfWord = kindOfWord;
	responseBean.response.text.content.examples = examples;
	responseBean.response.text.reverseUrl = getVnToEnGGUrlByWord(translatedText);
	
	responseBean.response.text.status = "successful";
}


function populateThumbToResponseBean(responseText) {
	var scriptTags = $(responseText).find('script');
	var imagesTag = '';
	scriptTags.each(function(index, scriptTag) {
		if (scriptTag.innerText.indexOf('(function(){var data') != -1) {
			imagesTag = scriptTag.innerText;
		}
	});
	// parse imagesTag to get images	
	imagesTag = imagesTag.substr(imagesTag.indexOf('var')).split('for(var')[0];
	console.log(imagesTag);
	eval(imagesTag);
	responseBean.response.thumb.url = data[0][0][1];
	responseBean.response.thumb.status = "successful";
}

function initResponseTextBean(wordNeedToTranlateBean) {
	return {
		status: '',
		url: '',
		content: {
			kindOfWord: '',
			translatedText: wordNeedToTranlateBean.vnWord,
			examples: []
		},
		reverseUrl: ''
	};
}

function initResponseAudioBean() {
	return {
		en: {
			status: '',
			tkParam: '',
			url: ''
		},
		vn: {
			status: '',
			tkParam: '',
			url: ''
		}
	};
}

function initResponseThumbBean() {
	return {
		status: '',
		url: ''
	};
}


function getEnToVnGGUrlByWord(wordBean) {
	return googleTranslateUrl + enToVnPart + wordBean.enWord;
}

function getVnToEnGGUrlByWord(vnWord) {
	return googleTranslateUrl + vnToEnPart + vnWord;
}

function getThumbGGUrlByWord(wordBean) {
	return imageSearchUrl.replace('[q]', wordBean.enWord);
}

function randomEnglishWord() {
	return configSetting.listWords[Math.floor(Math.random() * configSetting.listWords.length)];
}

function getIncrementEnglishWord() {
	if (indexWord == (configSetting.listWords.length - 1)) {
		indexWord = 0;
	}
	return configSetting.listWords[indexWord++];
}

function parseQueryString(queryString) {
	var params = {},
		queries, temp, i, l;
	// Split into key/value pairs
	queries = queryString.split("&");
	// Convert the array of strings into an object
	for (i = 0, l = queries.length; i < l; i++) {
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


function queryNewWord(url) {
	if (currentTabId == -1) {
		chrome.tabs.create({
			url: url
		});
	} else {
		chrome.tabs.update(currentTabId, {
			url: url
		})
	}
}

function translate() {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", responseBean.response.text.url, true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			try {
				populateTranslatedTextToResponseBean(JSON.parse(xhr.responseText));
			} catch (e) {
				console.log("error: " + e);
				clearInterval(intervalToGetXhrUrlEnToVnGGUrl);
				doTask();
			}

		}
	}
	xhr.send();
}

function populateThumb() {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", responseBean.imageSearchUrl, true);
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			try {
				populateThumbToResponseBean(xhr.responseText);
			} catch (e) {
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
		"VN: " + responseBean.response.text.content.translatedText +
		((responseBean.response.text.content.kindOfWord != "") ? " - " : "") +
		responseBean.response.text.content.kindOfWord +
		((responseBean.response.text.content.examples.length > 0) ? "\nVD: " + responseBean.response.text.content.examples : "");
	chrome.notifications
		.create('notification', {
			iconUrl: responseBean.response.thumb.url,
			type: 'basic',
			title: responseBean.wordNeedToTranlateBean.enWord,
			requireInteraction: true,
			message: stripHtmlTags(messages)
		}, function () {
			console.log(responseBean.wordNeedToTranlateBean.enWord + ' => ' + responseBean.wordNeedToTranlateBean.vnWord);
		});
}

function isGoogleTranslateUrl(url) {
	var urlRegex = /https?:\/\/([^\.]+\.)?google.com/;
	return (url && urlRegex.test(url));
}

function isSettingPageUrl(url) {
	return (url && url.indexOf("content_script_layout.html") != -1);
}

chrome.tabs.onRemoved.addListener(function (tabId) {
	if (currentTabId == tabId) { // in this case: the current tab was closed by user.
		currentTabId = -1;
	}

	if (settingPageTabId == tabId) {
		settingPageTabId = -1;
	}
});

chrome.tabs.onCreated.addListener(function (tabInfo) {

	if (isGoogleTranslateUrl(tabInfo.url) && currentTabId == -1) {
		currentTabId = tabInfo.id;
	}

	if (isSettingPageUrl(tabInfo.url) && settingPageTabId == -1) {
		settingPageTabId = tabInfo.id;
	}
})

chrome.webRequest.onBeforeSendHeaders.addListener(function (trafficInfo) {

	if ((trafficInfo.url.indexOf("translate_a/single") != -1 && responseBean.response.text.status == "")) {
		responseBean.response.text.url = trafficInfo.url;
	}

	if (trafficInfo.url.indexOf("translate_a/single") != -1 &&
		responseBean.response.audio.vn.status == "processing") {
		var tkParamVal = parseQueryString(trafficInfo.url)['tk'];
		responseBean.response.audio.vn.tkParam = tkParamVal;
		responseBean.response.audio.vn.status = "processed";
	}
}, {
	urls: ["<all_urls>"]
}, ['requestHeaders', 'blocking']);