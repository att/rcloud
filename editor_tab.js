var editor = {
    widget: undefined,
    current_file_owner: undefined,
    current_filename: undefined,
    populate_file_list: function() {
        var that = this;
        rcloud.get_all_user_filenames(function(data) {
            data = data.value;
            var this_user = rcloud.username();
            var result = [];
            for (var i=0; i<data.length; ++i) {
                var dirname = data[i].value[0].value[0];
                var filenames = data[i].value[1].value;
                
                var file_nodes = _.map(filenames, function(name) {
                    return { 
                        label: name,
                        file_name: name,
                        user_name: dirname,
                        file_type: (this_user === dirname) ? "w" : "r",
                        id: '/' + dirname + '/' + name 
                    };
                });
                if (dirname === this_user) {
                    file_nodes.push({
                        label: "[New File]",
                        id: "newfile"
                    });
                };
                var node = { 
                    label: dirname,
                    id: '/' + dirname,
                    children: file_nodes 
                };
                result.push(node);
            }
            var tree_data = [ { 
                label: '/',
                children: result 
            } ];
            var $tree = $("#editor-file-tree");
            $tree.tree({
                data: tree_data,
                autoOpen: 0
            });
            $tree.bind(
                'tree.click', function(event) {
                    if (event.node.id === "newfile") {
                        function validate_filename(n) {
                            if (/\.\./.test(n))
                                return false;
                            if (/[^0-9a-zA-Z_.]/.test(n))
                                return false;
                            return true;
                        }
                        var filename = prompt("please enter a filename", "[new filename]");
                        if (!validate_filename(filename)) {
                            alert("Invalid filename");
                            return;
                        }
                        that.new_file(filename);
                    } else if (!_.isUndefined(event.node.file_type)) {
                        if (that.current_filename && 
                            (that.current_file_owner === rcloud.username())) {
                            that.save_file(rcloud.username(), that.current_filename, function() {
                                that.load_file(event.node.user_name, event.node.file_name);
                            });
                        } else {
                            that.load_file(event.node.user_name, event.node.file_name);
                        }
                    }
                }
            );
            var folder = $tree.tree('getNodeById', "/" + rcloud.username());
            $(folder.element).parent().prepend(folder.element);
            $tree.tree('openNode', folder);
        });
    },
    init: function() {
        var widget = ace.edit("editor");
        widget.setTheme("ace/theme/chrome");
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
        var RMode = require("mode/r").Mode;
        var session = this.widget.getSession();
        var doc = session.doc;
        this.widget.getSession().setMode(new RMode(false, doc, session));
        this.populate_file_list();
        $("#editor-title-header").text(rcloud.username() + " | [untitled]");
    },
    save_file: function(user, filename, k) {
        rcloud.save_to_user_file(user, filename, this.widget.getSession().getValue(), k);
    },
    load_file: function(user, filename) {
        var that = this;
        rcloud.load_user_file(user, filename, function(file_lines) {
            file_lines = file_lines.value;
            that.widget.getSession().setValue(file_lines.join("\n"));
            that.current_file_owner = user;
            that.current_filename = filename;
            var ro = user !== rcloud.username();
            that.widget.setReadOnly(ro);
            if (!ro) {
                that.widget.focus();
                $("#editor-title-header").text(user + " | " + filename);
            } else {
                $("#editor-title-header").text(user + " | " + filename + " | Read Only");
            }
        });
    },
    new_file: function(filename) {
        var that = this;
        rcloud.create_user_file(filename, function(result) {
            that.current_filename = filename;
            that.current_file_owner = rcloud.username();
            that.clear();
            that.populate_file_list();
            that.widget.setReadOnly(false);
            that.widget.focus();
        });
    },
    clear: function() {
        this.widget.getSession().setValue("");
    }
};
