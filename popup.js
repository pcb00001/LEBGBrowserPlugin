var port = chrome.runtime.connect({
	name: "Sample Communication"
});

document.addEventListener("DOMContentLoaded", function () {
	var beginLearningBt = document.getElementById('beginLearningBt');
	beginLearningBt.onclick = function () {
		switchLearningEvent(beginLearningBt);
	}

	port.onMessage.addListener(function (msg) {
		console.log("Popup recieved the message: " + JSON.stringify(msg));
		if (msg.isAppRunning == 1) {
			beginLearningBt.setAttribute("status", 1);
			beginLearningBt.innerText = "Dừng học";
		} else {
			beginLearningBt.setAttribute("status", 0);
			beginLearningBt.innerText = "Bắt đầu học";
		}

		var settingBt = document.getElementById('settingBt');
		settingBt.onclick = function () {
			if (msg.settingPageTabId == -1) {
				chrome.tabs.create({url: chrome.extension.getURL('./content_script_layout.html')});
			} else {
				chrome.tabs.update(msg.settingPageTabId, {active: true});
			}
		}
	});
}, false);


function switchLearningEvent($this) {
	var status = $this.getAttribute("status");
	if (status == 0) {
		$this.setAttribute("status", 1);
		$this.innerText = "Dừng học";
		port.postMessage({ type: "beginLearningEvent" });
	} else {
		$this.setAttribute("status", 0);
		$this.innerText = "Bắt đầu học";
		port.postMessage({ type: "stopLearningEvent" });
	}
}