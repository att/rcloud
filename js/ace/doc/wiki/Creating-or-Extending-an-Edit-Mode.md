# Creating a new Edit Mode

The best way to create a new edit mode, is to extend an existing one.

## Minimal new mode

```javascript
define('ace/mode/example', function(require, exports, module) {

var oop = require("ace/lib/oop");
var TextMode = require("ace/mode/text").Mode;
var Tokenizer = require("ace/tokenizer").Tokenizer;
var ExampleHighlightRules = require("ace/mode/example_highlight_rules").ExampleHighlightRules;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new ExampleHighlightRules().getRules());
};
oop.inherits(Mode, TextMode);

(function() {
    // Extra logic goes here. (see below)
}).call(Mode.prototype);

exports.Mode = Mode;
});

define('ace/mode/example_highlight_rules', function(require, exports, module) {

var oop = require("ace/lib/oop");
var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

var ExampleHighlightRules = function() {

    this.$rules = new TextHighlightRules().getRules();
    
}

oop.inherits(ExampleHighlightRules, TextHighlightRules);

exports.ExampleHighlightRules = ExampleHighlightRules;
});
```
    
## Extending the Mode

```javascript
getNextLineIndent(state, line, tab) { }
```
    
Called with each new line, state is the name of the current highlighter state, line the complete text of the current line, and tab is the tab filler currently on the editor (e.g. 4 spaces, or a tab character). Returns a string which is appended to the new line.

```javascript
createWorker(session) { }
```
    
This is called on session creation to start a worker which can perform analysis in the background, commonly annotations for highlighting errors in syntax. It should create and return a worker using the WorkerClient function. A full example can be seen in [ace/mode/javascript](https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/javascript.js).

```javascript
checkOutdent(state, line, input)
```
    
`input` here is the character sequence entered. Should return true or false on whether to call `autoOutdent()`.

```javascript
autoOutdent(state, doc, row)
```
    
This function when called should perform any replacement needed to outdent the current line. A full example can be seen in [ace/mode/matching\_brace\_outdent](https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/matching_brace_outdent.js).

```javascript
toggleCommentLines(state, doc, startRow, endRow)
```

## Extending the Highlighter

The highlighter functions as a state machine, with regex matches used to determine tokens and transitions between states.  These notes assume use of the latest Ace.

### Highlighter Rules

A highlighters rules have the layout:

```javascript
this.$rules = {
    stateName: [ {
        token: <token>, // String, Array, or Function
        regex: <regex>, // String
        next:  <next>   // Optional, String
    } ]
};
```

The highlighter starts off in the "start" state. Tokens are strings, and tag the text with classes of the form `ace_token`. Multiple tokens can be applied to the same text by adding dots in the token, eg `support.function` will add the classes `ace_support ace_function`.

A regex can either be a flat regex (`abc`) or have matching groups (`(a+)(b+)`). There is a strict requirement that if matching groups are used, then they must cover the entire matched string (`(hel)lo` is invalid.)

For flat regex matches, token should be a String, or a Function that takes a single argument (the match) and returns a string token.

For grouped regex, token can be a String, in which case all matched groups are given that same token. It can be an Array (of the same length as the number of groups), whereby matches are given the token of the same alignment as in the match. For a function, the Function should take the same number of arguments as there are groups, and return an array of tokens as per before.

```javascript
// Example rules:

{
  token : "constant",
  regex : "INT_MAX|INT_MIN"
} // INT_MAX -> constant(INT_MAX)

{
  token : ["constant", "keyword"],
  regex : "^(#{1,6})(.+)$"
} // ### Header -> constant(###), keyword( Header)

{
  token : "constant",
  regex : "(a+)(b)(\\1)"
} // aabaa -> constant(aabaa) :: abaa -> constant(aba) + a

{
  token : function (first, second) {
    if (first == "a") return ["constant", "keyword"];
    return ["keyword", "constant"];
  },
  regex: "(.)(world)"
} // aworld -> constant(a), keyword(world) :: bworld -> keyword(a), constant(world)
```
    
If a rule is matched which has a next state set, then the tokeniser will move into that new state. Rules are prioritised based on their position within the ruleset, and the usual matching rules for regex apply. (eg of the rules `(a)(b)` and `.+` applied to the string `cab`, `.+` will match  even if `(a)(b)` is higher priority).

### Highlighter Helper Functions

```javascript
getRules()
```
    
Returns the rules for a highlighter.

```javascript
addRules(rules, prefix)
```
    
Adds a set of rules, prefixing all state names with the given prefix.

```javascript
this.$rules = {
    start: [ /* ... */ ]
};

var newRules = {
    start: [ /* ... */ ]
}

this.addRules(newRules, "new-");

/*
    this.$rules == {
        start: [ ... ],
        "new-start": [ ... ]
    };
*/
```
    
### Embedding a different highlighter

Using `embedRules` it is easy to embed one highlighter within another. For instance, to embed css highlighting between `^style` and `^endstyle`:

```javascript
var CssHighlightRules = require("ace/mode/css_highlight_rules").CssHighlightRules;

this.$rules = {
    start: [ {
        token: "keyword",
        regex: "^style\\s*$",
        next: "css-start"
    } ]
};

this.embedRules(CssHighlightRules, "css-", [{
   token : "keyword",
   regex: "^endstyle\\s*$",
   next  : "start"
}]);
```

## Mode delegation

Once a highlighter is embedded, it is also easy to delegate mode behaviour to the embedded mode while we are editing inside it. This is done by modifying the Mode constructor to use the `getEmbeds` and `createModeDelegates` functions as follows:

```javascript
var CssMode = require("ace/mode/css").Mode;

var Mode = function() {
    var highlighter = new ExampleHighlightRules();
    
    this.$tokenizer = new Tokenizer(highlighter.getRules());
    this.$embeds = highlighter.getEmbeds();
    this.createModeDelegates({
      "css-": CssMode
    });
};
```

With this, any mode specific behaviour (such as indenting, outdenting, or keyboard reactions) will be delegated to the CssMode when we are inside a css block. The prefix in createModeDelegates should match the one used in the highlighter. Multiple modes may be embedded in this manner, and the delegation is nestable, so that a JavaScriptMode inside an HTMLMode inside a MarkdownMode would still retain proper expected behaviour.

## Common Tokens

The following are the common tokens to themes. Note that not all of these may have styling associated with them, depending on the theme used.

    invisible
    keyword
    keyword.operator
    constant
    constant.language
    constant.library
    constant.numeric
    invalid
    invalid.illegal
    invalid.deprecated
    support
    support.function
    support.buildin
    string
    string.regexp
    comment
    comment.doc
    comment.doc.tag
    variable
    variable.language
    xml_pe