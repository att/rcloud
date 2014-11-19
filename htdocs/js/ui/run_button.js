RCloud.UI.run_button = (function() {
    var run_button_ = $("#run-notebook"),
        running_ = false,
        queue_ = [],
        cancels_ = [];

    function display(icon, title) {
        $('i', run_button_).removeClass().addClass(icon);
        run_button_.attr('title', title);
    }

    function start_queue() {
        if(queue_.length === 0) {
            running_ = false;
            display('icon-play', 'Run All');
            return Promise.resolve(undefined);
        }
        else {
            running_ = true;
            var first = queue_.shift();
            display('icon-stop', 'Stop');
            return first().then(function() {
                cancels_.shift();
                return start_queue();
            });
        }
    }
    return {
        init: function() {
            var that = this;
            run_button_.click(function() {
                if(running_)
                    rcloud.signal_to_compute(2); // SIGINT
                else
                    shell.run_notebook();
            });
            RCloud.session.listeners.push({
                on_reset: function() {
                    that.stop();
                }
            });
        },
        stop: function() {
            cancels_.forEach(function(cancel) { cancel(); });
            queue_ = [];
            cancels_ = [];
            running_ = false;
            display('icon-play', 'Stop');
        },
        enqueue: function(f, cancel) {
            var that = this;
            queue_.push(f);
            cancels_.push(cancel || function() {});
            if(!running_) {
                start_queue()
                    .catch(function(xep) {
                        console.log(xep);
                        that.stop();
                        // if this was due to a SIGINT, we're done
                        // otherwise we'll need to report this.
                        // stop executing either way.
                        if(!/^ERROR FROM R SERVER: 127/.test(xep))
                            throw xep;
                    });
            }
        }
    };
})();
