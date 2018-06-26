alert("tui day");
var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://translate.google.com/?hl=vi#en/vi/hang%20out%2C%20realize%2C%20up%20to%2C%20ever%20seen%2Cstill", true);
	xhr.onreadystatechange = function () {
        alert(JSON.parse(xhr.readyState));
		if (xhr.readyState == 4) {
			try {
				alert(xhr.responseText);
			} catch (e) {
				console.log("error: " + e);
			}

		}
	}
	xhr.send();