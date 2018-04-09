RCloud.language = (function() {
    // the keys of the language map come from GitHub's language detection
    // infrastructure which we don't control. (this is likely a bad thing)
    var languages_ = {
        CSS: {
            ace_mode: "ace/mode/css"
        },
        JavaScript: {
            ace_mode: "ace/mode/javascript"
        },
        Text: {
            ace_mode: "ace/mode/text",
            extension: 'txt'
        }, 
        HTML: {
            ace_mode: "ace/mode/html"
        }
    };

    var langs_ = [];

    return {
        is_a_markdown: function(language) {
            return languages_[language] ? languages_[language].is_a_markdown : false;
        },
        ace_mode: function(language) {
            var mode = (languages_[language] && languages_[language].ace_mode) || languages_.Text.ace_mode;
            return (ace.require(mode) || ace.require(languages_.Text.ace_mode)).Mode; 
        },
        extension: function(language) {
            var ext = (languages_[language] && languages_[language].extension) || '';
            if(_.isArray(ext)) ext = ext[0];
            return ext;
        },
        hljs_class: function(language) {
            return (languages_[language] && languages_[language].hljs_class) || null;
        },
        // don't call _set_available_languages yourself; it's called
        // by the session initialization code.
        _set_available_languages: function(langs) {
            langs_ = [];
            for(var lang in langs) {
                langs_.push(lang);
                languages_[lang] = languages_[lang] || {};
                languages_[lang].is_a_markdown = langs[lang]['is.a.markdown'];
                languages_[lang].ace_mode = langs[lang]['ace.mode'];
                languages_[lang].hljs_class = langs[lang]['hljs.class'];
                languages_[lang].extension = langs[lang].extension;
            }
        },
        available_languages: function() {
            return langs_;
        }
    };

})();
