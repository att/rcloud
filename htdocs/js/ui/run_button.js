RCloud.UI.run_button = (function() {
    var running_ = false,
        stopping_ = false,
        queue_ = [],
        cancels_ = [];

    function display(title, icon) {
        RCloud.UI.navbar.control('run_notebook').display(title, icon);
    }
    function highlight(whether) {
        RCloud.UI.navbar.control('run_notebook').highlight(whether);
    }

    function start_queue() {
        if(queue_.length === 0) {
            stopping_ = false;
            running_ = false;
            display('Run All', 'icon-play');
            highlight(false);
            return Promise.resolve(undefined);
        }
        else {
            running_ = true;
            var first = queue_.shift();
            display('Stop', 'icon-stop');
            highlight(true);
            return first().then(function() {
                if(stopping_) {
                    stopping_ = false;
                    throw 'stop';
                }
                cancels_.shift();
                return start_queue();
            });
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
        },
        run: function() {
            if(running_)
                that.stop();
            else
                shell.run_notebook();
        },
        stop: function() {
            if(rcloud.has_compute_separation)
                rcloud.signal_to_compute(2); // SIGINT
            else
                stopping_ = true;
        },
        on_stopped: function() {
            cancels_.forEach(function(cancel) { cancel(); });
            queue_ = [];
            cancels_ = [];
            running_ = false;
            display('Run All', 'icon-play');
            highlight(false);
        },
        enqueue: function(f, cancel) {
            var that = this;
            queue_.push(f);
            cancels_.push(cancel || function() {});
            if(!running_) {
                start_queue()
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
                    });
            }
        }
    };
})();
