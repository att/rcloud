RCloud.UI.find_replace = (function() {
    var find_dialog_ = null,
        find_input_, replace_input_, replace_stuff_,
        shown_ = false, replace_mode_ = false;
    function toggle_find_replace(replace) {
        if(!find_dialog_) {
            find_dialog_ = $('<div id="find-dialog"></div>');
            find_input_ = $('<input class="find-input"></input>');
            replace_input_ = $('<input class="replace-input"></input>');
            replace_stuff_ = $('<span class="replace"></span>')
                .append('&nbsp;Replace with: ', replace_input_);
            find_dialog_.append('Find: ', find_input_, replace_stuff_);
            $('#middle-column').prepend(find_dialog_);
        }
        if(shown_ && replace_mode_ === replace) {
            find_dialog_.hide();
            shown_ = false;
        }
        else {
            find_dialog_.show();
            if(replace)
                replace_stuff_.show();
            else
                replace_stuff_.hide();
            shown_ = true;
            replace_mode_ = replace;
        }
    }
    var result = {
        init: function() {
            document.addEventListener("keydown", function(e) {
                if (e.keyCode == 70 && (e.ctrlKey || e.metaKey)) { // ctrl/cmd-F
                    if(e.shiftKey)
                        return; // don't capture Full Screen
                    e.preventDefault();
                    toggle_find_replace(e.altKey);
                }
            });
        }
    };
    return result;
})();
