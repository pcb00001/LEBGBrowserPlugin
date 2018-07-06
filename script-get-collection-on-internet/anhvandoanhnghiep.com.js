var title = $('.container h1').text();
var collectoion = {};
var vals = [];
var indexVals = Array();
while(indexVals.length < 1000) {
    indexVals.push(('' + (indexVals.length + 1)));
}

$('.single-post-content-text table tr').each(function (index, data) {
    var dataParts = $(data).find('td');
    var enWord = '';
    var spelling = '';
    var vnWord = '';

    var firstCol = $(dataParts[0]).text().trim();
    if (isIndex(firstCol)) { 
        enWord = $(dataParts[1]).text();
    } else {
        var firstColParts =  firstCol.split('.');
        enWord = (firstColParts.length > 1) ? firstColParts[1].trim() : firstColParts[0].trim();
    }
    vnWord = $(dataParts[dataParts.length - 1]).text();
   
    switch(dataParts.length){
        case 4: 
            spelling = $(dataParts[dataParts.length - 2]).text();
        break;
    }
    
    vals.push({
        enWord: enWord.trim(),
        vnWord: vnWord.trim(),
        spelling: spelling.trim()
    });
})
collectoion[title] = vals;
console.log(
    `var colt = ${JSON.stringify(collectoion)}`
);

function isIndex(str) {
    return indexVals.indexOf(str.trim()) != -1
}