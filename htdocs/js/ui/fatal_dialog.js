(function() {

var fatal_dialog_;
var message_;

RCloud.UI.fatal_dialog = function(message, label, href_or_function) { // no href -> just close
    $('#loading-animation').hide();
    if (_.isUndefined(fatal_dialog_)) {
        var default_button = $("<button type='submit' class='btn btn-primary' style='float:right'>" + label + "</span>"),
            ignore_button = $("<span class='btn' style='float:right'>Ignore</span>"),
            body = $('<div />')
                .append('<h1>Aw, shucks</h1>');
        message_ = $('<p style="white-space: pre-wrap">' + message + '</p>');
        body.append(message_, default_button);
        if(href_or_function)
            body.append(ignore_button);
        body.append('<div style="clear: both;"></div>');
        default_button.click(function(e) {
            e.preventDefault();
            if(_.isString(href_or_function))
                window.location = href_or_function;
            else if(_.isFunction(href_or_function)) {
                fatal_dialog_.modal("hide");
                href_or_function();
            }
            else
                fatal_dialog_.modal("hide");
        });
        ignore_button.click(function() {
            fatal_dialog_.modal("hide");
        });
        fatal_dialog_ = $('<div id="fatal-dialog" class="modal fade" />')
            .append($('<div class="modal-dialog" />')
                    .append($('<div class="modal-content" />')
                            .append($('<div class="modal-body" />')
                                    .append(body))));
        $("body").append(fatal_dialog_);
        fatal_dialog_.on("shown.bs.modal", function() {
            default_button.focus();
        });
    }
    else message_.text(message);
    fatal_dialog_.modal({keyboard: false});
};

})();
