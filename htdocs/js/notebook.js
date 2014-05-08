Notebook.part_name = function(id, language) {
    // yuk
    if(_.isString(id))
        return id;
    var ext;
    switch(language) {
    case 'R':
        ext = 'R';
        break;
    case 'Markdown':
        ext = 'md';
        break;
    default:
        throw "Unknown language " + language;
    }
    return 'part' + id + '.' + ext;
};

Notebook.empty_for_github = function(text) {
    return /^\s*$/.test(text);
};

Notebook.is_part_name = function(filename) {
    return filename.match(/^part\d+\./);
};
