(function() {

var fatal_dialog_;

RCloud.UI.fatal_dialog = function(message, label, href) {
    $('#loading-animation').hide();
    if (_.isUndefined(fatal_dialog_)) {
        var default_button = $("<button type='submit' class='btn btn-primary' style='float:right'>" + label + "</span>"),
            ignore_button = $("<span class='btn' style='float:right'>Ignore</span>"),
            body = $('<div />')
                .append('<h1>Aw, shucks</h1>',
                        '<p style="white-space: pre-wrap">' + message + '</p>',
                        default_button, ignore_button,
                        '<div style="clear: both;"></div>');
        default_button.click(function(e) {
            e.preventDefault();
            window.location = href;
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
    fatal_dialog_.modal({keyboard: false});
};

})();
