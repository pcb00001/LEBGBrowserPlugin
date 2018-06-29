$(document).ready(function () {

    var setting = {
        notifyTimeDelay: $('#notifyDelayTime').val(),
        listWords: ['hello', 'goodbye'],
        sound: [],
        image: 'false'
    }

    var wordsCollectionSelected = {},
        userCookie = null;

    initFirebase(updateUserCollection);

    function doGetSettingInfo() {
        setting.notifyTimeDelay = $('#notifyDelayTime').val();
        if ($('#soundVnCb').is(':checked')) {
            setting.sound.push('vn');
        }

        if ($('#soundEnCb').is(':checked')) {
            setting.sound.push('en');
        }
    }

    function updateUserCollection() {
        getCookieUserLogin(function (cookie) {
            if (cookie != null) {
                userCookie = cookie;
                collectionDefaultRef = firebase.database().ref('user/' + userCookie.value);
                // Make sure we remove all previous listeners.
                collectionDefaultRef.off();
                collectionDefaultRef.on('value', function (snapshot) {
                    wordsCollection.user = snapshot.val();
                    requestFireBaseForUser();
                });
            }
        })

    }

    function populateUserCollectionBox() {
        var wordsCollectionGrid = $('#words-collection-grid');
        var colt = wordsCollection.user;
        for (var key in colt) {
            if (colt.hasOwnProperty(key)) {

                wordsCollectionGrid.append(
                    '<li><div><h4>' + key + '<button>Xóa</button><button>Cập nhật</button></h4></div>' +
                    (colt[key].join(", ")) +
                    '</li>');
            }
        }
    }

    $("#type-of-words-collection-drl").change(function () {
        $('#words-collection-drl').html('');
        if ($(this).val() == "Mặc định") {
            $('#words-collection-drl').append('<option>Chọn lĩnh vực muốn học</option>');
            populateCollectionToSelect(wordsCollection.default);
            wordsCollectionSelected = wordsCollection.default;
        } else {
            requestFireBaseForUser();
        }

    })
    $("#logingBt").click(function () {
        var logingInfo = $('#user').val() + "~" +  $('#pass').val();
        setCookieUserLogin(logingInfo, function() {
            updateUserCollection();
        });
    })

    function getCookieUserLogin(callback) {
        chrome.cookies.get({
                url: "https://hoc-tu-vung-71584.firebaseio.com",
                name: "fire-base-user"
            },
            function (cookie) {
                console.log(cookie);
                callback(cookie)
            })
    }

    function setCookieUserLogin(cookieValue, callback) {
        chrome.cookies.set({
            url: "https://hoc-tu-vung-71584.firebaseio.com",
            name: "fire-base-user",
            value: cookieValue
        }, function() {
            callback();
        });
    }

    function requestFireBaseForUser() {
        if (userCookie == null) {
            $("#fire-base-user-info").show();
        } else {
            wordsCollectionSelected = wordsCollection.user;
            populateCollectionToSelect(wordsCollection.user);
            populateUserCollectionBox();
            
        }
    }

    $("#words-collection-drl").change(function () {
        setting.listWords = wordsCollectionSelected[$(this).val()];

    })

    $("#manager-user-collection-link").click(function () {
        var managerUserCollectionBox = $('#manager-user-collection-box');
        if (managerUserCollectionBox.is(":hidden")) {
            managerUserCollectionBox.show();
        } else {
            managerUserCollectionBox.hide();
        }
    })


    function populateCollectionToSelect(colt) {
        $('#words-collection-drl').append('<option>Chọn danh sách của bạn</option>');
        for (var key in colt) {
            if (colt.hasOwnProperty(key)) {
                console.log(key + " -> " + colt[key]);
                $('#words-collection-drl').append('<option>' + key + '</option>');
            }
        }
    }

    $('#finishBt').click(function () {
        doGetSettingInfo();
        window.parent.postMessage({
            type: "updateSetting",
            setting: setting
        }, "*");
    });

})