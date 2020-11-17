
define("ace/mode/jupyter_completions", ["require","exports","module"], function(require, exports, module) {
"use strict";

var util = require("ace/autocomplete/util");
var language = null;
var JupyterCompletions = function(language) {
  this.language = language;
};

(function() {
    this.getCompletions = function(editor, session, pos, callback) {
          var that = this;
          var line = session.getLine(pos.row);
          var prefix = util.retrievePrecedingIdentifier(line, pos.column);
          if(!prefix) {
            callback(null, []);
            return;
          }
          rcloud.get_completions(this.language, session.getValue(),
                                 session.getDocument().positionToIndex(pos))
                                .then(function(ret) {
                                    callback(null, ret);
                                });
      };
      
}).call(JupyterCompletions.prototype);

exports.JupyterCompletions = JupyterCompletions;
});