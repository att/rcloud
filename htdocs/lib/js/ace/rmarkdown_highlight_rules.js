/*
 * markdown_highlight_rules.js
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
define("ace/mode/rmarkdown_highlight_rules", function(require, exports, module) {

var oop = require("ace/lib/oop");
var RHighlightRules = require("ace/mode/r_highlight_rules").RHighlightRules;
var MarkdownHighlightRules = require("ace/mode/markdown_highlight_rules").MarkdownHighlightRules;
var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;
var JavaScriptHighlightRules = require("ace/mode/javascript_highlight_rules").JavaScriptHighlightRules;
var CssHighlightRules = require("ace/mode/css_highlight_rules").CssHighlightRules;

var RMarkdownHighlightRules = function() {


    function knitr_embed(tag, prefix) {
        return { // Github style block
            token : "support.function",
            regex : "^\\s*```\\s*\\{" + tag + "(?:.*)\\}\\s*$",
            push  : prefix + "start"
        };
    }
    // regexp must not have capturing parentheses
    // regexps are ordered -> the first match is used

    this.$rules = new MarkdownHighlightRules().getRules();
    this.$rules["start"].unshift(knitr_embed('r', 'r-'),
       knitr_embed("js", "jscode2-"),
       knitr_embed("css", "csscode2-"));
       
    var rRules = new RHighlightRules().getRules();
    
    this.embedRules(rRules, "r-", [{
        token: "support.function",
        regex: "^`{3,}\\s*$",
        next: "pop"
    }]);
    
    this.embedRules(JavaScriptHighlightRules, "jscode2-", [{
       token : "support.function",
       regex : "^\\s*```",
       next  : "pop"
    }]);

    this.embedRules(CssHighlightRules, "csscode2-", [{
       token : "support.function",
       regex : "^\\s*```",
       next  : "pop"
    }]);

    this.normalizeRules();
};
oop.inherits(RMarkdownHighlightRules, TextHighlightRules);

exports.RMarkdownHighlightRules = RMarkdownHighlightRules;
});
