 /*
 * RCloud contribution:
 * * added getCompletionsAsync method
 * * delegation of completions retrieval to JupyterCompletions component 
 */
 
define("ace/mode/golang", ["require","exports","module","ace/mode/jupyter_completions"], function(require, exports, module) {

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var GolangHighlightRules = require("./golang_highlight_rules").GolangHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
var CStyleFoldMode = require("./folding/cstyle").FoldMode;
var JupyterCompletions = require("./jupyter_completions").JupyterCompletions;

var Mode = function() {
    this.HighlightRules = GolangHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.foldingRules = new CStyleFoldMode();
    this.$behaviour = new CstyleBehaviour();
    this.$completer = new JupyterCompletions(language);
    this.getCompletionsAsync = function(state, session, pos, callback) {
        if(this.$completer) {
            this.$completer.getCompletions(null, session, pos, callback);
        } else {
            callback(null, []);
        }
    };
};
oop.inherits(Mode, TextMode);

(function() {
    
    this.lineCommentStart = "//";
    this.blockComment = {start: "/*", end: "*/"};

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;
        var endState = tokenizedLine.state;

        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }
        
        if (state == "start") {
            var match = line.match(/^.*[\{\(\[]\s*$/);
            if (match) {
                indent += tab;
            }
        }

        return indent;
    };//end getNextLineIndent

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

    this.$id = "ace/mode/golang";
}).call(Mode.prototype);

exports.Mode = Mode;
});
