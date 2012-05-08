var shell = (function() {
    var terminal = $('#term_demo').terminal(function(command, term) {
        if (command !== '') {
            term.clear();
            // $("#output").append($("<div></div>").text(command));
            rclient.post_sent_command(command);
            interpret_command(command);
        }
    }, {
        exit: false,
        greetings: false
    });
    
    // hacky workaround, but whatever.
    $('#output').click(function(x) {
        terminal.disable();
    });

    return {
        terminal: terminal,
        detachable_div: function(div) {
            var on_remove;
            var on_detach;
            // console.log("DEEETACH");
            var result = $("<div class='detachable' style='position: relative; z-index: 0;'></div>");
            var inner_div = $("<div style='float: right'></div>");
            result.append(inner_div);
            result.append(div);
            var sign_out = $("<i class='icon-signout figure-icon' style='position: absolute; right: 5px; top: 25px'>");
            sign_out.click(function(){
                $(result).detach().draggable();
                $("#output").append(result);
                make_fixed_menu(result[0], true);
                $(sign_out).remove();
                on_detach();
            });
            var trash = $("<i class='icon-trash figure-icon' style='position: absolute; right: 5px; top: 5px'>");
            trash.click(function() {
                $(result).remove();
                on_remove();
            });
            inner_div.append(sign_out);
            inner_div.append(trash);

            result[0].on_remove = function(callback) { on_remove = callback; };
            result[0].on_detach = function(callback) { on_detach = callback; };
            
            return result[0];
        }
    };
})();
