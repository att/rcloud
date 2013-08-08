Notebook.create_controller = function(model)
{
    var current_gist_;

    function append_cell_helper(content, type, id) {
        var cell_model = Notebook.Cell.create_model(content, type);
        var cell_controller = Notebook.Cell.create_controller(cell_model);
        cell_model.controller = cell_controller;
        return [cell_controller, model.append_cell(cell_model, id)];
    }

    function insert_cell_helper(content, type, id) {
        var cell_model = Notebook.Cell.create_model(content, type);
        var cell_controller = Notebook.Cell.create_controller(cell_model);
        cell_model.controller = cell_controller;
        return [cell_controller, model.insert_cell(cell_model, id)];
    }

    function show_or_hide_cursor() {
        if(model.read_only)
            $('.ace_cursor-layer').hide();
        else
            $('.ace_cursor-layer').show();
    }

    function on_load(k, version, notebook) {
        this.clear();
        // is there anything else to gist permissions?
        // certainly versioning figures in here too
        model.read_only = version != null || notebook.user.login != rcloud.username();
        var parts = {}; // could rely on alphabetic input instead of gathering
        _.each(notebook.files, function (file) {
            var filename = file.filename;
            if(/^part/.test(filename)) {
                var number = parseInt(filename.slice(4).split('.')[0]);
                if(number !== NaN)
                    parts[number] = [file.content, file.language, number];
            }
            // style..
        });
        for(var i in parts)
            append_cell_helper(parts[i][0], parts[i][1], parts[i][2]);
        show_or_hide_cursor();
        current_gist_ = notebook;
        k && k(notebook);
    }

    function find_changes_from(notebook) {
        var changes = [];
        var nf = notebook.files,
            cf = _.extend({}, current_gist_.files); // to keep track of changes
        for(var f in nf) {
            if(f==='r_type')
                continue; // artifact of rserve.js
            if(f in cf) {
                if(cf[f].language != nf[f].language || cf[f].content != nf[f].content) {
                    changes.push([f, cf[f]]);
                }
                delete cf[f];
            }
            else changes.push([f, {erase: true, language: nf[f].language}]);
        }
        for(f in cf) {
            if(f==='r_type')
                continue; // artifact of rserve.js
            changes.push([f, cf[f]]);
        }
        return changes;
    }

    var result = {
        append_cell: function(content, type, id) {
            var cch = append_cell_helper(content, type, id);
            this.update_notebook(cch[1]);
            return cch[0];
        },
        insert_cell: function(content, type, id) {
            var cch = insert_cell_helper(content, type, id);
            this.update_notebook(cch[1]);
            return cch[0];
        },
        remove_cell: function(cell_model) {
            var changes = model.remove_cell(cell_model);
            shell.input_widget.focus(); // there must be a better way
            this.update_notebook(changes);
        },
        clear: function() {
            model.clear();
        },
        load_notebook: function(gistname, version, k) {
            var that = this;
            rcloud.load_notebook(gistname, version || null, _.bind(on_load, this, k, version));
        },
        create_notebook: function(content, k) {
            var that = this;
            rcloud.create_notebook(content, function(notebook) {
                that.clear();
                model.read_only = notebook.user.login != rcloud.username();
                current_gist_ = notebook;
                k && k(notebook);
            });
        },
        fork_or_revert_notebook: function(is_mine, gistname, version, k) {
            var that = this;
            function update_if(changes, gistname, k) {
                // if there are no changes, just load the gist so that we are sending along
                // the latest history, timestamp, etc.
                if(changes.length)
                    that.update_notebook(changes, gistname, k);
                else
                    rcloud.load_notebook(gistname, null, k2);
            }
            if(is_mine) // get HEAD, calculate changes from there to here, and apply
                rcloud.load_notebook(gistname, null, function(notebook) {
                    var changes = find_changes_from(notebook);
                    update_if(changes, gistname, k);
                });
            else rcloud.fork_notebook(gistname, function(notebook) {
                if(version) {
                    // fork, then get changes from there to here, and apply
                    var changes = find_changes_from(notebook);
                    update_if(changes, notebook.id, k);
                }
                else
                    that.load_notebook(notebook.id, null, k);
            });
        },
        update_notebook: function(changes, gistname, k) {
            if(!changes.length)
                return;
            if(model.read_only)
                throw "attempted to update read-only notebook";
            gistname = gistname || shell.gistname();
            function partname(id, language) {
                // yuk
                if(_.isString(id))
                    return id;
                var ext;
                switch(language) {
                case 'R':
                    ext = 'R';
                    break;
                case 'Markdown':
                    ext = 'md';
                    break;
                default:
                    throw "Unknown language " + language;
                }
                return 'part' + id + '.' + ext;
            }
            function changes_to_gist(changes) {
                // we don't use the gist rename feature because it doesn't
                // allow renaming x -> y and creating a new x at the same time
                // instead, create y and if there is no longer any x, erase it
                var post_names = _.reduce(changes,
                                         function(names, change) {
                                             if(!change[1].erase) {
                                                 var after = change[1].rename || change[0];
                                                 names[partname(after, change[1].language)] = 1;
                                             }
                                             return names;
                                         }, {});
                function xlate_change(filehash, change) {
                    var c = {};
                    if(change[1].content !== undefined)
                        c.content = change[1].content;
                    var pre_name = partname(change[0], change[1].language);
                    if(change[1].erase || !post_names[pre_name])
                        filehash[pre_name] = null;
                    var post_name = partname(change[1].rename || change[0], change[1].language);
                    if(!change[1].erase)
                        filehash[post_name] = c;
                    return filehash;
                }
                return {files: _.reduce(changes, xlate_change, {})};
            }
            // not awesome to callback to someone else here
            k = k || _.bind(editor.notebook_loaded, editor, null);
            // also less than awesome separation of concerns here, wtf?
            show_or_hide_cursor();
            var k2 = function(notebook) {
                current_gist_ = notebook;
                k(notebook);
            };
            if(changes.length)
                rcloud.update_notebook(gistname, changes_to_gist(changes), k2);
        },
        refresh_cells: function() {
            return model.reread_cells();
        },
        update_cell: function(cell_model) {
            this.update_notebook(model.update_cell(cell_model));
        },
        run_all: function() {
            var changes = this.refresh_cells();
            this.update_notebook(changes);
            _.each(model.notebook, function(cell_model) {
                cell_model.controller.execute();
            });
        }
    };
    model.controller = result;
    return result;
};
