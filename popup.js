var port = chrome.runtime.connect({
	name: "Sample Communication"
});




document.addEventListener("DOMContentLoaded", function () {
	var beginLearningBt = document.getElementById('beginLearningBt');
	beginLearningBt.onclick = function () {
		switchLearningEvent(beginLearningBt);
	}

	port.onMessage.addListener(function (msg) {
		console.log("Popup recieved the message: " + msg);
		if (msg == 1) {
			beginLearningBt.setAttribute("status", 1);
			beginLearningBt.innerText = "Dừng học";
		} else {
			beginLearningBt.setAttribute("status", 0);
			beginLearningBt.innerText = "Bắt đầu học";
		}
	});
}, false);


function switchLearningEvent($this) {
	var status = $this.getAttribute("status");
	if (status == 0) {
		$this.setAttribute("status", 1);
		$this.innerText = "Dừng học";
		port.postMessage("beginLearningEvent");
	} else {
		$this.setAttribute("status", 0);
		$this.innerText = "Bắt đầu học";
		port.postMessage("stopLearningEvent");
	}

}