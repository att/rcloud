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

   var Mode = function(suppressHighlighting, doc, session)
   {
      this.HighlightRules = RHighlightRules;
      if (suppressHighlighting)
         this.$tokenizer = new Tokenizer(new TextHighlightRules().getRules());
      else
         this.$tokenizer = new Tokenizer(new RHighlightRules().getRules());
      this.$completer = new RCompletions();
      this.$highlightRules = new this.HighlightRules();
      this.codeModel = new RCodeModel(doc, this.$tokenizer, null);
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
      
      this.getCompletions = function(state, session, pos, prefix, callback) {
         this.$completer.getCompletions(state, session, pos, prefix, callback);
      };
  
      this.lineCommentStart = ["#"];
   }).call(Mode.prototype);
   exports.Mode = Mode;
});


define("ace/mode/r_completions", ["require","exports","module"], function(require, exports, module) {
"use strict";


var RCompletions = function() {
  
};

(function() {
    this.getCompletions = function(state, session, pos, prefix, callback) {
          var that = this;
          rcloud.get_completions('R', session.getValue(), session.getDocument().positionToIndex(pos))
                                 .then(function(ret) { 
                                   ret.forEach(function(x) { x.completer = that; }); 
                                  return ret;
                                 })
                                .then(function(ret) {
                                    callback(null, ret);
                                  });
      };
      
   this.identifierRegexps = [/[a-zA-Z_0-9:\/\$\-\.\u00A2-\uFFFF]/];
      
   this.insertMatch = function(editor, data) {
      var completions = editor.completer.completions;
      var session = editor.getSession();
      var pos = editor.getCursorPosition();
      var line = session.getLine(pos.row);
      var left = line.substr(0,pos.column);
      var right = line.substr(pos.column, line.length);
      
      var removeToLeft = function(editor, howMany) {
          var range = editor.selection.getRange();
          range.start.column -= howMany;
          editor.session.remove(range);
      };
      
      if ( completions ) {
        // Note: filterText may contain initial text and any extra characters that user typed in to filter
        // the set of available completions produced when autocomplete dialog was created.
        if(completions.filterText) {
          if( left.endsWith(completions.filterText) && data.value.startsWith(completions.filterText) ) {
            // Avoid unnecessary autocompletion
            var replacementTail = data.value.substr(completions.filterText.length, data.value.length);
            if(right.startsWith(replacementTail)) {
              var gotoRange = editor.selection.getRange();
              gotoRange.end.column += replacementTail.length;
              gotoRange.start.column += replacementTail.length;
              editor.selection.setSelectionRange(gotoRange);
              return;
            }
          }
          removeToLeft(editor, completions.filterText.length);
          left = left.substr(0, left.length - completions.filterText.length);
        }
        if( left.length > 0 ) {
          // Handle a case when the selected completion starts ahead current range/position in the editor
          var lookbackIndex = 0;
          var prefix = left.substr(lookbackIndex, left.length);
          while(lookbackIndex < left.length && !data.value.startsWith(prefix)) {
            lookbackIndex += 1;
            prefix = left.substr(left.length-lookbackIndex, left.length);
          }
          if(left.length > lookbackIndex) {
            removeToLeft(editor, left.length - lookbackIndex);
          }
        }
      }
      
      if (data.snippet)
         editor.completer.snippetManager.insertSnippet(editor, data.snippet);
      else
         editor.execCommand("insertstring", data.value || data);
   };
   
   this.rowTokenizer = function(popup) {
     return function(row) {
        var data = popup.data[row];
        var tokens = [];
        if (!data)
            return tokens;
        if (typeof data == "string")
            data = {value: data};
        if (!data.caption)
            data.caption = data.value || data.name;

        var last = -1;
        var flag, c;
        var isFirstMatch = 1;
        for (var i = 0; i < data.caption.length; i++) {
            c = data.caption[i];
            flag = isFirstMatch & (data.matchMask & (1 << i) ? 1 : 0);
            if (last !== flag) {
              if(isFirstMatch && last !== -1) {
                isFirstMatch = 0;
              }
              tokens.push({type: data.className || "" + ( flag ? "completion-highlight" : ""), value: c});
              last = flag;
            } else {
                tokens[tokens.length - 1].value += c;
            }
        }

        if (data.meta) {
            var maxW = popup.renderer.$size.scrollerWidth / popup.renderer.layerConfig.characterWidth;
            var metaData = data.meta;
            if (metaData.length + data.caption.length > maxW - 2) {
                metaData = metaData.substr(0, maxW - data.caption.length - 3) + "\u2026";
            }
            tokens.push({type: "rightAlignedText", value: metaData});
        }
        return tokens;
    };
    };
}).call(RCompletions.prototype);

exports.RCompletions = RCompletions;
});