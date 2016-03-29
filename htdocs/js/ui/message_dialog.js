(function() {

var message_dialog_;
var message_;

RCloud.UI.message_dialog = function(title, message, k) {
    $('#loading-animation').hide();
    if (_.isUndefined(message_dialog_)) {
        var default_button = $("<button type='submit' class='btn btn-primary' style='float:right'>OK</span>"),
            body = $('<div />')
                .append($('<h1 />').append(title));
        message_ = $('<p style="white-space: pre-wrap">' + message + '</p>');
        body.append(message_, default_button);
        body.append('<div style="clear: both;"></div>');
        default_button.click(function(e) {
            e.preventDefault();
            message_dialog_.modal("hide");
        });
        message_dialog_ = $('<div id="message-dialog" class="modal fade" />')
            .append($('<div class="modal-dialog" />')
                    .append($('<div class="modal-content" />')
                            .append($('<div class="modal-body" />')
                                    .append(body))));
        $("body").append(message_dialog_);
        message_dialog_.on("shown.bs.modal", function() {
            default_button.focus();
        });
    }
    else message_.text(message);
    message_dialog_.off("hidden.bs.modal").on("hidden.bs.modal", function() {
        k();
    });
    message_dialog_.modal({keyboard: true});
};

})();
