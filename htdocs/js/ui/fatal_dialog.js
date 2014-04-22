(function() {

var fatal_dialog_;

RCloud.UI.fatal_dialog = function(message, label, href) {
    if (_.isUndefined(fatal_dialog_)) {
        var button = $("<button type='button' class='btn btn-primary' style='float:right'>" + label + "</button>"),
            body = $('<div />')
                .append('<h1>Aw, shucks</h1>',
                        '<p>' + message + '</p>',
                        button,
                       '<div style="clear: both;"></div>');
        button.button().click(function() {
            window.location = href;
        });
        fatal_dialog_ = $('<div id="fatal-dialog" class="modal fade" />')
            .append($('<div class="modal-dialog" />')
                    .append($('<div class="modal-content" />')
                            .append($('<div class="modal-body" />')
                                    .append(body))));
        $("body").append(fatal_dialog_);
    }
    fatal_dialog_.modal({keyboard: false});
};

})();
