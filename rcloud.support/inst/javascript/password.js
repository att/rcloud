({
    prompt: function(v, k) {
        var result;

        function done() {
            result = $(password).val();
            $(dialog).modal('hide');
        }

        var password = $('<input type="password"></input>').
            keypress(function(e) {
                if (e.which === 13) {
                    done();
                    return false;
                }
                return true;
            });
        var prompt = $('<p></p>').text(v);
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
        var dialog = $('<div class="modal hide fade"></div>')
            .append(header).append(body).append(footer);
        $("body").append(dialog);
        $(dialog).modal()
            .on('hidden', function() {
                $(dialog).remove();
                k(result);
            });
        // });
        // var x = prompt(v);
        // k(x);
    }
})
