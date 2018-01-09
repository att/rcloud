RCloud.UI.stop_button = (function() {

    function enable(whether) {
      if(whether) {
        RCloud.UI.navbar.control('stop_notebook').enable();
      } else {
        RCloud.UI.navbar.control('stop_notebook').disable();
      }
    }
    return {
        init: function() {
            var that = this;
            RCloud.session.listeners.push({
                on_reset: function() {
                    that.on_stopped();
                }
            });
            RCloud.UI.processing_queue.addOnStartCallback(function(x) {
              enable(true);
            });
            RCloud.UI.processing_queue.addFinallyCallback(function(x) {
              that.on_stopped();
            });
        },
        on_stopped: function() {
          enable(false);
        },
        stop: function() {
            RCloud.UI.processing_queue.stop();
        }
    };
})();
