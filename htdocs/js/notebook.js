Notebook.part_name = function(id, language) {
    // yuk
    if(_.isString(id))
        return id;
    // the keys of the language map come from GitHub's language detection 
    // infrastructure which we don't control. (this is likely a bad thing)
    // The values are the extensions we use for the gists.
    var language_map = {
        R: 'R',
        Markdown: 'md',
        Python: 'py',
		Text: 'txt'
    };
    var ext = language_map[language];
    if (_.isUndefined(ext))
        throw new Error("Unknown language " + language);
    return 'part' + id + '.' + ext;
};

Notebook.empty_for_github = function(text) {
    return /^\s*$/.test(text);
};

Notebook.is_part_name = function(filename) {
    return filename.match(/^part\d+\./);
};
