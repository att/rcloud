RCloud.UI.run_button = (function() {
    var run_button_ = $("#run-notebook"),
        running_ = false,
        queue_ = [];

    function set_icon(icon) {
        $('i', run_button_).removeClass().addClass(icon);
    }

    function start_queue() {
        if(queue_.length === 0) {
            running_ = false;
            set_icon('icon-play');
            return Promise.resolve(undefined);
        }
        else {
            running_ = true;
            var first = queue_.shift();
            set_icon('icon-stop');
            return first().then(start_queue);
        }
    }
    return {
        init: function() {
            run_button_.click(function() {
                shell.run_notebook();
            });
        },
        enqueue: function(f) {
            queue_.push(f);
            if(!running_)
                start_queue();
        }
    };
})();
