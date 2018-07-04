$(document).ready(function () {
    renderSettingPage();
});

function renderSettingPage() {
    var params = location.href.split('?');
    $("#settingPageIframe").attr('src', chrome.extension.getURL('setting_page.html' + 
    (typeof params[1] !== 'undefined' ? `?${params[1]}` : '')));
    // recive message from child content
    window.addEventListener("message", function (event) {
        if (event.data.type == "updateSetting") {
            // send message to background
            chrome.runtime.sendMessage(event.data);
        }

    });
}   