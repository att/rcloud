 /*
 * RCloud contribution:
 * * added getCompletionsAsync method
 * * delegation of completions retrieval to JupyterCompletions component 
 */
 
define("ace/mode/java", ["require","exports","module","ace/mode/jupyter_completions"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var JavaScriptMode = require("./javascript").Mode;
var JavaHighlightRules = require("./java_highlight_rules").JavaHighlightRules;
var JupyterCompletions = require("./jupyter_completions").JupyterCompletions;

var Mode = function(options) {
    JavaScriptMode.call(this);
    this.HighlightRules = JavaHighlightRules;
    this.$completer = new JupyterCompletions(options.language);
    this.getCompletionsAsync = function(state, session, pos, callback) {
        if(this.$completer) {
            this.$completer.getCompletions(null, session, pos, callback);
        } else {
            callback(null, []);
        }
    };
};
oop.inherits(Mode, JavaScriptMode);

(function() {
    
    this.createWorker = function(session) {
        return null;
    };

    this.$id = "ace/mode/java";
}).call(Mode.prototype);

exports.Mode = Mode;
});
