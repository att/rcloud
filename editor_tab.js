var editor = {
    widget: undefined,
    current_user: undefined,
    current_filename: undefined,
    init: function() {
        var widget = ace.edit("editor");
        widget.setTheme("ace/theme/twilight");
        widget.commands.addCommand({
            name: 'sendToR',
            bindKey: {
                win: 'Shift-Return',
                mac: 'Shift-Return',
                sender: 'editor'
            },
            exec: function(widget, args, request) {
                var text = widget.getSession().doc.getTextRange(widget.getSelectionRange());
                rclient.post_sent_command(text);
                interpret_command(text);
            }
        });
        this.widget = widget;
        var that = this;
        this.current_user = rcloud.username();

        rcloud.get_user_filenames(function(data) {
            data = data.value;
            var lst = d3.select("#editor-file-list-ul")
                .selectAll("li")
                .data(data)
                .enter().append("li").append("a")
                                     .text(_.identity)
                                     .on("click", function(d) {
                                         var user = rcloud.username();
                                         if (that.current_filename) {
                                             that.save_file(user, that.current_filename, function() {
                                                 that.load_file(user, d);
                                             });
                                         } else {
                                             that.load_file(user, d);
                                         }
                                     });
        });
    },
    save_file: function(user, filename, k) {
        var that = this;
        rcloud.save_to_user_file(user, filename, this.widget.getSession().getValue(), k);
    },
    load_file: function(user, filename) {
        var that = this;
        rcloud.load_user_file(user, filename, function(file_lines) {
            file_lines = file_lines.value;
            that.widget.getSession().setValue(file_lines.join("\n"));
            that.current_user = user;
            that.current_filename = filename;
        });
    }
};
