((function () {
  
    // Schedules execution of a function within cell result processing loop to ensure that any UI element referenes used in the function
    // were added to the result pane.
    function executeInCellResultProcessingQueue(context_id, fun) {
      RCloud.session.invoke_context_callback('function_call', context_id, fun);
    }
    
    function handleError(err, k) {
      if(err.name) {
        k({type: err.name, message: err.message}, null);
      } else {
        k({type: 'error', message: err}, null);
      }
    }
    
    return {
        appendDiv: function (context_id, div, content, syncWithResultProcessingQueue, k) {
          try {
            if (syncWithResultProcessingQueue) {
              executeInCellResultProcessingQueue(context_id, function(result_div) {
                try {
                  if (_.isFunction(content)) content = content();
                  if (div) {
                    $(div).append(content);
                  } else {
                    result_div.append(content);
                  }
                  k(null, true);
                } catch (err) {
                  handleError(err, k);
                }
              });
            } else {
              if (_.isFunction(content)) content = content();
              $(div).append(content);
              k(null, true);
            }
          } catch (err) {
            handleError(err, k);
          }
        },
        prependDiv: function (context_id, div, content, syncWithResultProcessingQueue, k) {
          try {
            if (syncWithResultProcessingQueue) {
              executeInCellResultProcessingQueue(context_id, function(result_div) {
                try {
                  if (_.isFunction(content)) content = content();
                  if (div) {
                    $(div).prepend(content);
                  } else {
                    result_div.prepend(content);
                  }
                  k(null, true);
                } catch (err) {
                  handleError(err, k);
                }
              });
            } else {
              if (_.isFunction(content)) content = content();
              $(div).prepend(content);
              k(null, true);
            }
          } catch (err) {
            handleError(err, k);
          }
        },
        setDiv: function (context_id, div, content, syncWithResultProcessingQueue, k) {
          try {
            if (syncWithResultProcessingQueue) {
              executeInCellResultProcessingQueue(context_id, function(result_div) {
                try {
                  if (_.isFunction(content)) content = content();
                  if (div) {
                    $(div).empty();
                    $(div).append(content);
                  } else {
                    result_div.empty();
                    result_div.append(content);
                  }
                  k(null, true);
                } catch (err) {
                  handleError(err, k);
                }
              });
            } else {
              if (_.isFunction(content)) content = content();
              $(div).empty(content);
              $(div).append(content);
              k(null, true);
            }
          } catch (err) {
            handleError(err, k);
          }
        },
        registerRCWResult: function(content, k) {
          window.notebook_result = content;
          k(null, true);
        },
        attr: function(div, attr, val, k) {
          if (_.isFunction(val)) val($(div).attr(attr)); else k(null, $(div).attr(attr,val).attr(attr));
        },
        value: function(div, val, k) {
          if (_.isFunction(val)) val($(div).val()); else k(null, $(div).val(val).val());
        },
        css: function(div, prop, val, k) {
          if (_.isFunction(val)) val($(div).css(prop)); else k(null, $(div).css(prop, val).css(prop));
        },
        on: function(div, handler, fn, data, k) {
          $(div).on(handler, function() { fn(data, {id:this.id, name:this.name, node:this.nodeName}, function() {}) });
          k(null, true);
        },
        off: function(div, handler, k) {
         if (_.isFunction(handler)) { k = handler; $(div).off(); } else $(div).off(handler);
         k(null, true);
        },
        cookies: function(k) { k(document.cookie); },
        url: function(k) { k(null, { url:document.location.href, query:document.location.search, path:document.location.pathname, origin:document.location.origin, hash:document.location.hash }); },
        setLocation: function(loc,k) { document.location.href=loc; k(null, loc); }
};

})()) /*jshint -W033 */ // this is an expression not a statement