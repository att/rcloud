/*
 * r.js
 *
 * Copyright (C) 2009-12 by RStudio, Inc.
 *
 * The Initial Developer of the Original Code is
 * Ajax.org B.V.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Unless you have received this program directly from RStudio pursuant
 * to the terms of a commercial license agreement with RStudio, then
 * this program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */
define("ace/mode/r", function(require, exports, module)
{
   var Editor = require("ace/editor").Editor;
   var EditSession = require("ace/edit_session").EditSession;
   var Range = require("ace/range").Range;
   var oop = require("ace/lib/oop");
   var TextMode = require("ace/mode/text").Mode;
   var Tokenizer = require("ace/tokenizer").Tokenizer;
   var TextHighlightRules = require("ace/mode/text_highlight_rules")
         .TextHighlightRules;
   var RHighlightRules = require("ace/mode/r_highlight_rules").RHighlightRules;
   var RCodeModel = require("ace/mode/r_code_model").RCodeModel;
   var FoldMode = require("./folding/cstyle").FoldMode;
   var RMatchingBraceOutdent = require("ace/mode/r_matching_brace_outdent").RMatchingBraceOutdent;
   var AutoBraceInsert = require("ace/mode/auto_brace_insert").AutoBraceInsert;
   var RCompletions = require("ace/mode/r_completions").RCompletions;
   var unicode = require("ace/unicode");

   var Mode = function(options)
   {
      this.HighlightRules = RHighlightRules;
      if (options.suppressHighlighting)
         this.$tokenizer = new Tokenizer(new TextHighlightRules().getRules());
      else
         this.$tokenizer = new Tokenizer(new RHighlightRules().getRules());
      this.$completer = new RCompletions();
      this.$highlightRules = new this.HighlightRules();
      this.codeModel = new RCodeModel(options.doc, this.$tokenizer, null);
      this.foldingRules = new FoldMode();
   };
   oop.inherits(Mode, TextMode);

   (function()
   {
      oop.implement(this, RMatchingBraceOutdent);

      this.tokenRe = new RegExp("^["
          + unicode.packages.L
          + unicode.packages.Mn + unicode.packages.Mc
          + unicode.packages.Nd
          + unicode.packages.Pc + "._]+", "g"
      );

      this.nonTokenRe = new RegExp("^(?:[^"
          + unicode.packages.L
          + unicode.packages.Mn + unicode.packages.Mc
          + unicode.packages.Nd
          + unicode.packages.Pc + "._]|\s])+", "g"
      );

      this.$complements = {
               "(": ")",
               "[": "]",
               '"': '"',
               "'": "'",
               "{": "}"
            };
      this.$reOpen = /^[(["'{]$/;
      this.$reClose = /^[)\]"'}]$/;

      this.getNextLineIndent = function(state, line, tab, tabSize, row)
      {
         return this.codeModel.getNextLineIndent(row, line, state, tab, tabSize);
      };

      this.allowAutoInsert = this.smartAllowAutoInsert;

      this.getIndentForOpenBrace = function(openBracePos)
      {
         return this.codeModel.getIndentForOpenBrace(openBracePos);
      };

      this.$getIndent = function(line) {
         var match = line.match(/^(\s+)/);
         if (match) {
            return match[1];
         }

         return "";
      };

      this.transformAction = function(state, action, editor, session, text) {
         if (action === 'insertion' && text === "\n") {

            // If newline in a doxygen comment, continue the comment
            var pos = editor.getSelectionRange().start;
            var match = /^((\s*#+')\s*)/.exec(session.doc.getLine(pos.row));
            if (match && editor.getSelectionRange().start.column >= match[2].length) {
               return {text: "\n" + match[1]};
            }
         }
         return false;
      };
      
      this.lineCommentStart = ["#"];
      
      this.getCompletionsAsync = function(state, session, pos, callback) {
        if(this.$completer) {
          this.$completer.getCompletions(null, session, pos, callback);
        } else {
          callback(null, []);
        }
      };
      
      this.$id = "ace/mode/r";
   }).call(Mode.prototype);
   exports.Mode = Mode;
});


define("ace/mode/r_completions", ["require","exports","module"], function(require, exports, module) {
"use strict";


var RCompletions = function() {
  
};

(function() {
    this.getCompletions = function(editor, session, pos, callback) {
          var that = this;
          var line = session.getLine(pos.row);
          rcloud.get_completions('R', line, pos.column)
                                 .then(function(ret) { 
                                   ret.forEach(function(x) { x.completer = that; }); 
                                  return ret;
                                 })
                                .then(function(ret) {
                                    callback(null, ret);
                                  });
      };
      
   this.insertMatch = function(editor, completion) {
      var completions = editor.completer.completions;
      var session = editor.getSession();
      var pos = editor.getCursorPosition();
      var startPosition = completion.position;
      var line = session.getLine(pos.row);
      var left = line.substr(startPosition, pos.column);
      var right = line.substr(pos.column, line.length);
      
      var removeToLeft = function(editor) {
          var range = editor.selection.getRange();
          range.start.column = startPosition;
          editor.session.remove(range);
      };
      
      if ( completions ) {
        // Note: filterText may contain initial text and any extra characters that user typed in to filter
        // the set of available completions produced when autocomplete dialog was created.
        if(completions.filterText) {
          if( left.endsWith(completions.filterText) && completion.value.startsWith(completions.filterText) ) {
            // Avoid unnecessary autocompletion
            var replacementTail = completion.value.substr(completions.filterText.length, completion.value.length);
            if(right.startsWith(replacementTail)) {
              var gotoRange = editor.selection.getRange();
              gotoRange.end.column += replacementTail.length;
              gotoRange.start.column += replacementTail.length;
              editor.selection.setSelectionRange(gotoRange);
              return;
            }
          }
          removeToLeft(editor);
        }
      }
      
      if (completion.snippet)
         editor.completer.snippetManager.insertSnippet(editor, completion.snippet);
      else
         editor.execCommand("insertstring", completion.value || completion);
   };
}).call(RCompletions.prototype);

exports.RCompletions = RCompletions;
});