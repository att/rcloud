/*
 * markdown.js
 *
 * Copyright (C) 2009-11 by RStudio, Inc.
 *
 * The Initial Developer of the Original Code is
 * Ajax.org B.V.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * This program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */

define("ace/mode/rmarkdown", ["require","exports","module"], function(require, exports, module) {

var oop = require("ace/lib/oop");
var MarkdownMode = require("ace/mode/markdown").Mode;
var CssMode = require("ace/mode/css").Mode;
var JavaScriptMode = require("ace/mode/javascript").Mode;
var Tokenizer = require("ace/tokenizer").Tokenizer;
var RMarkdownHighlightRules = require("ace/mode/rmarkdown_highlight_rules").RMarkdownHighlightRules;
var SweaveBackgroundHighlighter = require("ace/mode/sweave_background_highlighter").SweaveBackgroundHighlighter;
var RCodeModel = require("ace/mode/r_code_model").RCodeModel;
var RMode = require("ace/mode/r").Mode;

var Mode = function(suppressHighlighting, doc, session) {
   this.HighlightRules = RMarkdownHighlightRules;
   this.$tokenizer = new Tokenizer(new RMarkdownHighlightRules().getRules());

   this.codeModel = new RCodeModel(doc, this.$tokenizer, /^r-/,
                                   /^`{3,}\s*\{r(.*)\}\s*$/);
   this.foldingRules = this.codeModel;
   this.$highlightRules = new this.HighlightRules();
   this.$sweaveBackgroundHighlighter = new SweaveBackgroundHighlighter(
         session,
         /^`{3,}\s*\{r(?:.*)\}\s*$/,
         /^`{3,}\s*$/,
         true);

    this.createModeDelegates({
        "jscode-": JavaScriptMode,
        "csscode-": CssMode,
        "r-": RMode
    }, [suppressHighlighting, doc, session]);
         
};

oop.inherits(Mode, MarkdownMode);

(function() {
   this.insertChunkInfo = {
      value: "```{r}\n\n```\n",
      position: {row: 0, column: 5}
   };

   this.getNextLineIndent = function(state, line, tab, tabSize, row)
   {
      return this.codeModel.getNextLineIndent(row, line, state, tab, tabSize);
   };
   
   // Pass extra arguments to sub-Mode constructors and expose getCompletionsAsync method
    this.createModeDelegates = function (mapping, params) {
        this.$embeds = [];
        this.$modes = {};
        function applyToConstructor(constructor, argArray) {
            var args = [null].concat(argArray);
            var factoryFunction = constructor.bind.apply(constructor, args);
            return new factoryFunction();
        }

        for (var i in mapping) {
            if (mapping[i]) {
                this.$embeds.push(i);
                this.$modes[i] = applyToConstructor(mapping[i], params);
            }
        }

        var delegations = ["toggleBlockComment", "toggleCommentLines", "getNextLineIndent", 
            "checkOutdent", "autoOutdent", "transformAction", "getCompletions", "getCompletionsAsync"];

        for (var i = 0; i < delegations.length; i++) {
            (function(scope) {
              var functionName = delegations[i];
              var defaultHandler = scope[functionName];
              scope[delegations[i]] = function() {
                  return this.$delegator(functionName, arguments, defaultHandler);
              };
            }(this));
        }
    };
    
    this.getCompletionsAsync = function(state, session, pos, callback) {
        var keywords = this.$keywordList || this.$createKeywordList();
        return callback(null, keywords.map(function(word) {
            return {
                name: word,
                value: word,
                score: 0,
                meta: "keyword"
            };
        }));
    };
    this.$id = "ace/mode/rmarkdown";
}).call(Mode.prototype);

exports.Mode = Mode;
});
