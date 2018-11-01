RCloud.UI.processing_queue = (function() {
    var running_ = false,
        stopping_ = false,
        queue_ = [],
        cancels_ = [],
        runningPromise = null;
        onStartCallbacks = [];
        finallyCallbacks = [];

  return {
        init: function() {
            var that = this;
            RCloud.session.listeners.push({
                on_reset: function() {
                    that.on_stopped();
                }
            });
        },
        is_running: function() {
          return running_;
        },
        is_stopping: function() {
          return stopping_;
        },
        start_queue: function() {
            var that = this;
            if(queue_.length === 0) {
                stopping_ = false;
                running_ = false;
                return Promise.resolve(undefined);
            } else {
                running_ = true;
                var processingChain = Promise.resolve(undefined).then(function(x) {
                  onStartCallbacks.forEach(function(callback) {
                    callback(x);
                  });
                  return x;
                });
                var first = queue_.shift();
                return processingChain.then(first).then(function() {
                    if(stopping_) {
                        stopping_ = false;
                        throw 'stop';
                    }
                    cancels_.shift();
                    return that.start_queue();
                });
            }
        },
        stop: function() {
            if(running_) {
              if(rcloud.has_compute_separation)
                  rcloud.signal_to_compute(2); // SIGINT
              else
                  stopping_ = true;
            }
        },
        stopGracefully: function() {
            if(running_) {
              stopping_ = true;
            }
        },
        on_stopped: function() {
            cancels_.forEach(function(cancel) { cancel(); });
            queue_ = [];
            cancels_ = [];
            running_ = false;
            runningPromise = null;
        },
        addFinallyCallback: function(callback) {
          finallyCallbacks.push(callback);
        },
        addOnStartCallback: function(callback) {
          onStartCallbacks.push(callback);
        },
        enqueue: function(f, cancel) {
            var that = this;
            queue_.push(f);
            cancels_.push(cancel || function() {});
            if(!running_) {
                runningPromise = that.start_queue()
                    .catch(function(xep) {
                        if(xep === 'stop') {
                            cancels_.shift(); // this one was not a cancel
                            that.on_stopped();
                        }
                        else {
                            console.log(xep);
                            that.on_stopped();
                            // if this was due to a SIGINT, we're done
                            // otherwise we'll need to report this.
                            // stop executing either way.
                            if(!/^ERROR FROM R SERVER: 127/.test(xep))
                                throw xep;
                        }
                    }).finally(function(x) {
                      finallyCallbacks.forEach(function(callback) { callback(x)});
                      return x;
                    });
            }
            return runningPromise;
        }
    };
})();
