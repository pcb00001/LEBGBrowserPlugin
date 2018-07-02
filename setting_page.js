$(document).ready(function () {

    var setting = {
        notifyTimeDelay: $('#notifyDelayTime').val(),
        listWords: ['hello', 'goodbye'],
        sound: [],
        image: 'false'
    }

    var wordsCollectionSelected = null,
        userLoginInfo = null,
        collectionDefaultRef = null;

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
        getUserLoginStored(function (user) {
            userLoginInfo = user;
            if (userLoginInfo != null) {
                collectionDefaultRef = firebase.database().ref('user/' + userLoginInfo);
                // Make sure we remove all previous listeners.
                collectionDefaultRef.off();
                collectionDefaultRef.on('value', function (snapshot) {
                    wordsCollection.user = snapshot.val();
                    $("#type-of-words-collection-drl").change();
                });
            }
        })

    }

    function populateUserCollectionToHiddenDataGrid() {
        var wordsCollectionGrid = $('#words-collection-grid');
        wordsCollectionGrid.html('');
        var colt = wordsCollection.user;
        for (var key in colt) {
            if (colt.hasOwnProperty(key)) {
                var collectionValue = (colt[key].join(", "));
                wordsCollectionItem = $("<li id='" + key + "'></li>");
                wordsCollectionItemHead = $("<div><h4></h4></div>");
                wordsCollectionItemHead.append(key);
                var delBt = $("<button  id='delBt'>Xóa</button>");
                var showFormUpdateBt = $("<button  id='showFormUpdateBt' collectionValue='" + collectionValue + "'>Cập nhật</button>");
                wordsCollectionItemHead.append(delBt);
                wordsCollectionItemHead.append(showFormUpdateBt);

                wordsCollectionItem.append(wordsCollectionItemHead);
                wordsCollectionItem.append(collectionValue);
                wordsCollectionGrid.append(wordsCollectionItem);

            }
        }
        $('#words-collection-grid #delBt').unbind('click').click(function () {
            deleteMessage(collectionDefaultRef.child($(this).closest('li').attr('id')), {});
        });
        $('#words-collection-grid #showFormUpdateBt').unbind('click').click(function () {
            var updateForm = $("#form-update-user-collection-item");
            var key = $(this).closest('li').attr('id');
            $(updateForm).find("h4").text(key);
            $(updateForm).find("textarea").val($(this).attr('collectionValue'));
            $(updateForm).find("#updateBt").unbind('click').click(function () {
                var newVal = $(updateForm).find("textarea").val().split(',');
                updateMessage(collectionDefaultRef.child(key), newVal.map((val) => val.trim()));
                updateForm.hide();
            });
            $(updateForm).find("#cancelBt").click(function () {
                updateForm.hide();
            });
            updateForm.show();
        });
    }

    $('#addNewUserCollection').click(function () {
        var addNewForm = $("#form-add-new-user-collection-item");
        $(addNewForm).find("#addNewBt").click(function () {
            var newVal = $(addNewForm).find("textarea").val().split(',');
            if (wordsCollection.user == null) {
                wordsCollection.user = {};
            }
            wordsCollection.user[$(addNewForm).find("input").val()] = newVal.map((val) => val.trim());
            saveMessage(collectionDefaultRef, wordsCollection.user);
            addNewForm.hide();
        });
        $(addNewForm).find("#cancelBt").click(function () {
            addNewForm.hide();
        });
        addNewForm.show();
    })


    $("#type-of-words-collection-drl").change(function () {
        wordsCollectionSelected = null;
        setting.listWords = [];
        $('#words-collection-drl').html('');
        $('#manager-user-collection-link').hide();
        $('#manager-user-collection-hidden-grid').hide();

        if ($(this).val() == 0) {
            $('#words-collection-drl').append('<option value="-1">Chọn lĩnh vực muốn học</option>');
            wordsCollectionSelected = wordsCollection.default;
            populateCollectionToSelect(wordsCollectionSelected);
        } else if ($(this).val() == 1) {
            if (userLoginInfo == null) {
                $("#fire-base-user-info").show();
            } else {
                $('#words-collection-drl').append('<option value="-1">Chọn danh sách của bạn</option>');
                wordsCollectionSelected = wordsCollection.user;
                populateCollectionToSelect(wordsCollectionSelected);
                populateUserCollectionToHiddenDataGrid();
                $('#manager-user-collection-link').show();
                $('#manager-user-collection-link').click();
            }
        }

    })

    $("#fire-base-user-info #loginBt").click(function () {
        var loginInfo = $('#user').val() + "~" + $('#pass').val();
        storeUserLogin(loginInfo, function () {
            updateUserCollection();
        });
    })

    $("#fire-base-user-info #cancelBt").click(function () {
        $("#fire-base-user-info").hide();
    });

    function getUserLoginStored(callback) {
        chrome.storage.sync.get(["fire-base-user"],
            function (user) {
                console.log(user);
                callback((typeof user["fire-base-user"] !== 'undefined') ? user["fire-base-user"] : null)
            })
    }

    function storeUserLogin(loginInfo, callback) {
        chrome.storage.sync.set({
            "fire-base-user": loginInfo
        }, function () {
            callback();
        });
    }

    $("#words-collection-drl").change(function () {
        setting.listWords = [];
        if ($(this).val() != -1) {
            setting.listWords = wordsCollectionSelected[$(this).val()];
        }
    })

    $("#manager-user-collection-link").click(function () {
        var managerUserCollectionBox = $('#manager-user-collection-hidden-grid');
        if (managerUserCollectionBox.is(":hidden")) {
            managerUserCollectionBox.show();
        } else {
            managerUserCollectionBox.hide();
        }
    })


    function populateCollectionToSelect(colt) {
        for (var key in colt) {
            if (colt.hasOwnProperty(key)) {
                console.log(key + " -> " + colt[key]);
                $('#words-collection-drl').append('<option>' + key + '</option>');
            }
        }
    }

    $('#finishBt').click(function () {
        if (setting.listWords.length == 0) {
            alert("Hãy chọn danh sách từ muốn học");
            return false;
        }

        doGetSettingInfo();
        window.parent.postMessage({
            type: "updateSetting",
            setting: setting
        }, "*");
    });

})