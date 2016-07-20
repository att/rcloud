(function(filename, content, mimetype, k) {
    require(["FileSaver"], function(_) {
        var file = new Blob([content], {type: mimetype});
        saveAs(file, filename);
        k();
    });
})
