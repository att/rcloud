(function() {

var fatal_dialog_;
var message_;
var default_button_;
var ignore_button_;
var action_;

RCloud.UI.fatal_dialog = function(message, label, href_or_function) { // no href -> just close
    $('#loading-animation').hide();
    action_ = href_or_function;
    if (_.isUndefined(fatal_dialog_)) {
        default_button_ = $("<button type='submit' class='btn btn-primary' style='float:right'>" + label + "</span>");
        ignore_button_ = $("<span class='btn' style='float:right'>Ignore</span>");
        var body = $('<div />')
                .append('<h1>Aw, shucks</h1>');
        message_ = $('<p style="white-space: pre-wrap">' + message + '</p>');
        body.append(message_, default_button_);
        body.append(ignore_button_);
        body.append('<div style="clear: both;"></div>');
        default_button_.click(function(e) {
            e.preventDefault();
            if(_.isString(action_))
                window.location = action_;
            else if(_.isFunction(action_)) {
                fatal_dialog_.modal("hide");
                action_();
            }
            else
                fatal_dialog_.modal("hide");
        });
        ignore_button_.click(function() {
            fatal_dialog_.modal("hide");
        });
        fatal_dialog_ = $('<div id="fatal-dialog" class="modal fade" />')
            .append($('<div class="modal-dialog" />')
                    .append($('<div class="modal-content" />')
                            .append($('<div class="modal-body" />')
                                    .append(body))));
        $("body").append(fatal_dialog_);
        fatal_dialog_.on("shown.bs.modal", function() {
            default_button_.focus();
        });
    }
    fatal_dialog_.modal({keyboard: false});
};

})();
