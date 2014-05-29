(function() {

var langs = [];

RCloud.language = {
    ace_mode: function(language) {
        var modes = {
            R: "ace/mode/r",
            Python: "ace/mode/python",
            Markdown: "ace/mode/rmarkdown",
            CSS: "ace/mode/css",
            Text: "ace/mode/text"
        };
        return modes[language] || modes.Text;
    },
    // don't call _set_available_languages yourself; it's called
    // by the session initialization code.
    _set_available_languages: function(list) {
        if (_.isArray(list))
            langs = list;
        else
            langs = [list];
    },
    available_languages: function() {
        return langs;
    }
};

})();
