var title = $('.container h1').text();
var collectoion = {};
var vals = [];
$('.single-post-content-text table tr').each(function (index, data) {
    var dataParts = $(data).find('td');
    var enWord = $(dataParts[1]).text();
    var spelling = $(dataParts[2]).text();
    var vnWord = $(dataParts[3]).text();
    vals.push({
        enWord: enWord,
        vnWord: vnWord,
        spelling: spelling
    });
})
collectoion[title] = vals;
console.log(JSON.stringify(collectoion));