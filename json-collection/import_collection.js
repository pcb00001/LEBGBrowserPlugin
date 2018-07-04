$(document).ready(function () {
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }

    if (location.href.indexOf('admin=1') != -1) {
        $('#import-collection-block-div').show();
        var collection = null;
        $('#global-file').on('change', function (event) {
            var input = event.target;
            var reader = new FileReader();
            reader.onload = function () {
                eval(reader.result);
                collection = colt;
            };
            reader.readAsText(input.files[0]);
        });
        $('#global-file').click(function() {
             $('#global-file').val('');
        });
        $('#uploadGlobalBt').click(function () {
            if (collection == null) {
                alert("Chọn file cần nhập");
            } else {
                for (var key in collection) {
                    if (collection.hasOwnProperty(key)) {
                        wordsCollection.default[key] = collection[key];
                    }
                }
                updateMessage(collectionDefaultRef, wordsCollection.default)
               
            }
        });
    } else {
        $('#import-collection-block-div').remove();
    }


})