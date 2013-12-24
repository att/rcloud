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

define("ace/mode/rmarkdown", function(require, exports, module) {

var oop = require("ace/lib/oop");
var MarkdownMode = require("ace/mode/markdown").Mode;
var Tokenizer = require("ace/tokenizer").Tokenizer;
var RMarkdownHighlightRules = require("ace/mode/rmarkdown_highlight_rules").RMarkdownHighlightRules;
var SweaveBackgroundHighlighter = require("ace/mode/sweave_background_highlighter").SweaveBackgroundHighlighter;
var RCodeModel = require("ace/mode/r_code_model").RCodeModel;

var Mode = function(suppressHighlighting, doc, session) {
   this.$tokenizer = new Tokenizer(new RMarkdownHighlightRules().getRules());

   this.codeModel = new RCodeModel(doc, this.$tokenizer, /^r-/,
                                   /^`{3,}\s*\{r(.*)\}\s*$/);
   this.foldingRules = this.codeModel;
   this.$sweaveBackgroundHighlighter = new SweaveBackgroundHighlighter(
         session,
         /^`{3,}\s*\{r(?:.*)\}\s*$/,
         /^`{3,}\s*$/,
         true);
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

}).call(Mode.prototype);

exports.Mode = Mode;
});
