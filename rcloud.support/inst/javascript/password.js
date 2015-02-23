({
    prompt: function(v, k) {
        var result, password;

        function done() {
            result = password.val();
            dialog.modal('hide');
            RCloud.UI.allow_progress_modal();
        }
        var prompt;
        function create_password_dialog() {
            var password = $('<input id="password-input" type="password"></input>').
                    keypress(function(e) {
                        if (e.which === $.ui.keyCode.ENTER) {
                            done();
                            return false;
                        }
                        return true;
                    });
            var prompt = $('<p id="password-prompt"></p>');
            var body = $('<div class="modal-body"></div>').append(prompt).append(password);

            var cancel = $('<span class="btn">Cancel</span>')
                    .on('click', function() { $(dialog).modal('hide'); });
            var ok = $('<span class="btn btn-primary">OK</span>')
                    .on('click', done);
            var footer = $('<div class="modal-footer"></div>')
                    .append(cancel).append(ok);

            var header = $('  <div class="modal-header">\
                           <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\
                           <h3>Password</h3>\
                           </div>');
            var dialog = $('<div id="password-dialog" class="modal fade"></div>')
                    .append($('<div class="modal-dialog"></div>')
                            .append($('<div class="modal-content"></div>')
                                    .append(header).append(body).append(footer)));
            $("body").append(dialog);
            dialog
                .on('shown.bs.modal', function() {
                    password.focus().select();
                })
                .on('hide.bs.modal', function() {
                    k(result);
                });

            return dialog;
        }
        var dialog = $("#password-dialog");
        if(!dialog.length)
            dialog = create_password_dialog();
        $("#password-prompt").text(v);
        password = dialog.find("#password-input");
        RCloud.UI.prevent_progress_modal();
        dialog.modal({keyboard: true});
    }
})
