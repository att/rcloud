RCloud.UI.shortcut_dialog = (function() {

    var content_ = '', registered_shortcuts_ = [], shortcut_dialog_;

    var result = {

        show: function() {
           
           /* 
            if(!content || RCloud.UI.shortcut_manager.shortcuts_changed()) {
                registered_shortcuts = RCloud.UI.shortcut_manager.get_registered_shortcuts();
            }
            */

            var message = 'a list of shortcuts will appear here.';

            $('#loading-animation').hide();
            if (_.isUndefined(shortcut_dialog_)) {
                var default_button = $("<button type='submit' class='btn btn-primary' style='float:right'>OK</span>"),
                    body = $('<div />')
                        .append('<h1>Shortcuts</h1>');

                message_ = $('<p style="white-space: pre-wrap">' + message + '</p>');
                body.append(message_, default_button);

                body.append('<div style="clear: both;"></div>');

                default_button.click(function(e) {
                    e.preventDefault();
                    shortcut_dialog_.modal("hide");
                });

                shortcut_dialog_ = $('<div id="shortcut-dialog" class="modal fade" />')
                    .append($('<div class="modal-dialog" />')
                            .append($('<div class="modal-content" style="background-color: rgba(255, 255, 255, 0.9)" />')
                                    .append($('<div class="modal-body" />')
                                            .append(body))));

                $("body").append(shortcut_dialog_);

                shortcut_dialog_.on("shown.bs.modal", function() {
                    default_button.focus();
                });
            }
            else {
                message_.text(message);
            }

            shortcut_dialog_.modal({keyboard: false});

        }
    };

    return result;

})();