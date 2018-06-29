$(document).ready(function () {
    renderSettingPage();
});

function renderSettingPage() {
    $("#settingPageIframe").attr('src', chrome.extension.getURL('setting_page.html'));
    // recive message from child content
    window.addEventListener("message", function (event) {
        if (event.data.type == "updateSetting") {
            // send message to background
            chrome.runtime.sendMessage(event.data);
        }

    });
}