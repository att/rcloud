RCloud.UI.scratchpad = {
    init: function() {
        function setup_scratchpad(div) {
            div.css({'background-color': "#f1f1f1"});
            ace.require("ace/ext/language_tools");
            var widget = ace.edit(div[0]);
            var RMode = require("ace/mode/r").Mode;
            var session = widget.getSession();
            var doc = session.doc;
            widget.setOptions({
                enableBasicAutocompletion: true
            });
            session.setMode(new RMode(false, doc, session));
            session.setUseWrapMode(true);
            widget.resize();
        }
        var scratchpad_editor = $("#scratchpad-editor");
        if (scratchpad_editor.length) {
            setup_scratchpad(scratchpad_editor);
        }
    }
};
