var editor = {
    widget: undefined,
    current_user: undefined,
    current_filename: undefined,
    populate_file_list: function() {
        var that = this;
        rcloud.get_user_filenames(function(data) {
            data = data.value;
            var lst = d3.select("#editor-file-list-ul");
            lst.selectAll("li").remove();
            lst.style("list-style-type", "none");
            lst.selectAll("li")
                .data(data)
                .enter().append("li")
                        .append("a")
                        .attr("href", "javascript:void(0)")
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
            lst.append("li")
                .append("a").attr("href", "javascript:void(0)")
                .text("[new file]")
                .on("click", function() {
                    function validate_filename(n) {
                        if (/\.\./.test(n))
                            return false;
                        if (/[^0-9a-zA-Z_.]/.test(n))
                            return false;
                        return true;
                    };
                    var filename = prompt("please enter the filename","[new filename]");
                    if (!validate_filename(filename))
                        alert("Invalid filename");
                    that.new_file(filename);
                });
        });
    },
    init: function() {
        var widget = ace.edit("editor");
        widget.setTheme("ace/theme/twilight");
        widget.commands.addCommand({
            name: 'sendToR',
            bindKey: {
                win: 'Ctrl-Return',
                mac: 'Command-Return',
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
        this.populate_file_list();
    },
    save_file: function(user, filename, k) {
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
    },
    new_file: function(filename) {
        var that = this;
        rcloud.create_user_file(filename, function(result) {
            that.current_filename = filename;
            that.current_user = rcloud.username();
            that.clear();
            that.populate_file_list();
        });
    },
    clear: function() {
        this.widget.getSession().setValue("");
    }
};
