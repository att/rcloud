RCloud.UI.run_button = (function() {
    var run_button_ = $("#run-notebook"),
        running_ = false,
        stopping_ = false,
        queue_ = [],
        cancels_ = [];

    function display(icon, title) {
        $('i', run_button_).removeClass().addClass(icon);
        run_button_.attr('title', title);
    }
    function highlight(whether) {
        run_button_.parent().find('.button-highlight').animate({opacity: whether ? 1 : 0}, 250);
    }

    function start_queue() {
        if(queue_.length === 0) {
            stopping_ = false;
            running_ = false;
            display('icon-play', 'Run All');
            highlight(false);
            return Promise.resolve(undefined);
        }
        else {
            running_ = true;
            var first = queue_.shift();
            display('icon-stop', 'Stop');
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

            run_button_.click(function() {
                if(running_) {
                    that.stop();
                }
                else if ($('#iframe').css('display')!=='none') {
                    shell.save_notebook();
                    var target_url = window.location.origin+'/notebook.R/'+shell.gistname()+'/index.html';
                    $('#iframe').attr('src',target_url);
                }
                else
                    shell.run_notebook();
            });

            RCloud.session.listeners.push({
                on_reset: function() {
                    that.on_stopped();
                }
            });
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
            display('icon-play', 'Run All');
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
