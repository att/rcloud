RCloud.UI.run_button = (function() {
    
    var do_reset_ = false;
    var is_scheduling_ = false;

    function highlight(whether) {
        RCloud.UI.navbar.control('run_notebook').highlight(whether);
    }
    
    function enable(whether) {
      if(whether) {
        RCloud.UI.navbar.control('run_notebook').enable();
      } else {
        RCloud.UI.navbar.control('run_notebook').disable();
      }
    }
    function schedule(ignored) {
        return (do_reset_ ? 
              RCloud.session.reset().then(function() {
                return rcloud.load_notebook(shell.gistname(), shell.version()); 
              }) : Promise.resolve(undefined)
            ).then(function() {
                    return shell.run_notebook();
                }); 
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
              enable(false);
              highlight(true);
            });
            RCloud.UI.processing_queue.addFinallyCallback(function(x) {
              that.on_stopped();
            });
        },
        
        run: function() {
            var runNotebook = Promise.resolve(undefined);
            if(!RCloud.UI.processing_queue.is_running() && !is_scheduling_) {
              is_scheduling_ = true;
              runNotebook = runNotebook.then(schedule).finally(function(x) {
                      is_scheduling_ = false;
                    });
            }
            return runNotebook;
        },
        on_stopped: function() {
          highlight(false);
          enable(true);
        },
        reset_on_run: function(v) {
            if(!arguments.length)
                return do_reset_;
            do_reset_ = v;
            return this;
        }
    };
})();
