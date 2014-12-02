RCloud.language = (function() {
    var ace_modes_ = {
        R: "ace/mode/r",
        Python: "ace/mode/python",
        Markdown: "ace/mode/rmarkdown",
        CSS: "ace/mode/css",
        JavaScript: "ace/mode/javascript",
        Text: "ace/mode/text"
    };
    var langs_ = [];

    return {
        ace_mode: function(language) {
            return ace_modes_[language] || ace_modes_.Text;
        },
        // don't call _set_available_languages yourself; it's called
        // by the session initialization code.
        _set_available_languages: function(list) {
            if (_.isArray(list))
                langs_ = list;
            else
                langs_ = [list];
        },
        available_languages: function() {
            return langs_;
        }
    };

})();
