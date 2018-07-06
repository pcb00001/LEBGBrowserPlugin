$(document).ready(function () {

    var setting = {
        collectionKey: '',
        notifyTimeDelay: $('#notifyDelayTime').val(),
        listWords: [{
            "enWord": "frying pan",
            "vnWord": "chảo rán",
            "spelling": "/fraɪ.ɪŋpæn/"
        }],
        sound: [],
        encounter: 'random'
    }

    var typeCollectionSelected = null,
        wordsCollectionSelected = null,
        userLoginInfo = null;

    initFirebase(updateUserCollection);

    var intervalCheckData = setInterval(function() {
        if (collectionDefaultRef != null || collectionUserRef != null) {
            $('#mask').hide();
            clearInterval(intervalCheckData);
        }
    }, 1000)

    function doGetSettingInfo() {
        setting.notifyTimeDelay = $('#notifyDelayTime').val();
        if ($('#soundVnCb').is(':checked')) {
            setting.sound.push('vn');
        }

        if ($('#soundEnCb').is(':checked')) {
            setting.sound.push('en');
        }

        if ($('#randomEncounterRbt').is(':checked')) {
            setting.encounter = 'random';
        } else {
            setting.encounter = 'increment';
        }
    }

    function updateUserCollection() {
        getDefaultCollection();
        getUserLoginStored(function (user) {
            userLoginInfo = user;

            if (userLoginInfo != null) {
                getUserCollection();
            }
        })

    }

    function getUserCollection() {
        collectionUserRef = firebase.database().ref('user/' + userLoginInfo);
        // Make sure we remove all previous listeners.
        collectionUserRef.off();
        collectionUserRef.on('value', function (snapshot) {
            wordsCollection.user = snapshot.val();
             wordsCollectionSelected = wordsCollection.user;
            $("#words-collection-drl").change();
        });
    }

    function getDefaultCollection() {
        // Make sure we remove all previous listeners.
        collectionDefaultRef = firebase.database().ref('default');
        collectionDefaultRef.off();
        collectionDefaultRef.on('value', function (snapshot) {
            wordsCollection.default = snapshot.val();
            wordsCollectionSelected = wordsCollection.default;
            $("#type-of-words-collection-drl").change();
        });
    }

    function populateUserCollectionToHiddenDataGrid() {
        var wordsCollectionGrid = $('#manager-user-collection-hidden-grid #words-collection-grid');
        wordsCollectionGrid.html('');
        var colt = wordsCollection.user;
        for (var key in colt) {
            if (colt.hasOwnProperty(key)) {
                var collectionValue = convertObjectToVals(colt[key]);
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
            deleteMessage(collectionUserRef.child($(this).closest('li').attr('id')), {});
        });
        $('#words-collection-grid #showFormUpdateBt').unbind('click').click(function () {
            var updateForm = $("#form-update-user-collection-item");
            var key = $(this).closest('li').attr('id');
            $(updateForm).find("h4").text(key);
            $(updateForm).find("textarea").val($(this).attr('collectionValue'));
            $(updateForm).find("#updateBt").unbind('click').click(function () {
                var newVal = $(updateForm).find("textarea").val().split(',');
                updateMessage(collectionUserRef.child(key), convertValsToObject(newVal));
                updateForm.hide();
            });
            $(updateForm).find("#cancelBt").click(function () {
                updateForm.hide();
            });
            updateForm.show();
        });
        $('#manager-user-collection-hidden-grid').show();
    }

    function populateGlobalCollectionToHiddenDataGrid() {
        var wordsCollectionGrid = $('#manager-user-global-collection-hidden-grid #words-collection-grid');
        wordsCollectionGrid.html('');
        var collectionValue = populateGridChildValsForGlobal(setting.listWords);
        wordsCollectionItem = $(`<li id='${setting.collectionKey}'></li>`);
        wordsCollectionItemHead = $(`<div><h4>${setting.collectionKey}</h4></div>`);
        wordsCollectionItem.append(wordsCollectionItemHead);
        wordsCollectionItem.append(collectionValue);
        wordsCollectionGrid.append(wordsCollectionItem);
         $('#manager-user-global-collection-hidden-grid').show();

    }

    function populateGridChildValsForGlobal(vals) {
        var grid = $('<table></table>');
        vals.forEach(function (val) {
            var itemRow = $('<tr></tr>');
            itemRow.append(`<td>${val.enWord}</td><td>${val.vnWord}</td><td>${val.spelling}</td>`);
            grid.append(itemRow);
        });
        return grid;
    }

    function convertValsToObject(vals) {
        var mapObjs = [];
        vals.forEach(function (val) {
            mapObjs.push({
                "enWord": val,
                "vnWord": "",
                "spelling": ""
            });
        });
        return mapObjs;
    }

    function convertObjectToVals(Object) {
        var vals = [];
        Object.forEach(function (o) {
            vals.push(o.enWord);
        });
        return vals.join(',');
    }

    $('#addNewUserCollection').click(function () {
        var addNewForm = $("#form-add-new-user-collection-item");
        $(addNewForm).find("#addNewBt").click(function () {
            var newVal = $(addNewForm).find("textarea").val().split(',');
            if (wordsCollection.user == null) {
                wordsCollection.user = {};
            }
            wordsCollection.user[$(addNewForm).find("input").val()] = convertValsToObject(newVal);
            saveMessage(collectionUserRef, wordsCollection.user);
            addNewForm.hide();
        });
        $(addNewForm).find("#cancelBt").click(function () {
            addNewForm.hide();
        });
        addNewForm.show();
    })

    function resetVariable($this) {
        typeCollectionSelected = null;
        wordsCollectionSelected = null;
        setting.listWords = [];
        setting.collectionKey = null;
        $('#words-collection-drl').html('');
        $('#manager-user-global-collection-hidden-grid').hide();
        $('#manager-user-collection-hidden-grid').hide();
    }

    $("#type-of-words-collection-drl").change(function () {
        $this = $(this);
        resetVariable($this);
        if ($this.val() == 0) {
            defaultCollectionItemSelectedEvent();
        } else if ($this.val() == 1) {
            userCollectionItemSelectedEvent();
        }
        if ($this.val() != -1) {
            $("#words-collection-drl").change();
        }
    })

    $("#words-collection-drl").change(function () {
        setting.collectionKey = $(this).val();
        setting.listWords = [];
        if (setting.collectionKey != -1 && setting.collectionKey != null) {
            setting.listWords = wordsCollectionSelected[setting.collectionKey];
            if (typeCollectionSelected == 'default') {
                populateGlobalCollectionToHiddenDataGrid();
            } else if (typeCollectionSelected == 'user') {
                populateUserCollectionToHiddenDataGrid();
            }
        } 
    })

    function defaultCollectionItemSelectedEvent() {
        typeCollectionSelected = 'default';
        wordsCollectionSelected = wordsCollection.default;
        $('#words-collection-drl').append('<option value="-1">Chọn lĩnh vực muốn học</option>');
        populateCollectionToSelect();
    }

    function userCollectionItemSelectedEvent() {
        typeCollectionSelected = 'user';
        if (userLoginInfo == null) {
            $("#fire-base-user-info").show();
        } else {
            wordsCollectionSelected = wordsCollection.user;
            $('#words-collection-drl').append('<option value="-1">Chọn danh sách của bạn</option>');
            populateCollectionToSelect();
            $('#manager-user-collection-hidden-grid').show();
             
        }
    }

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

    function populateCollectionToSelect() {
        for (var key in wordsCollectionSelected) {
            if (wordsCollectionSelected.hasOwnProperty(key)) {
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