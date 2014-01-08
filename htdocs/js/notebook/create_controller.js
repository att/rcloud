Notebook.create_controller = function(model)
{
    var current_gist_,
        dirty_ = false,
        save_button_ = null,
        save_timer_ = null,
        save_timeout_ = 30000, // 30s
        show_source_checkbox_ = null;

    function append_cell_helper(content, type, id) {
        var cell_model = Notebook.Cell.create_model(content, type);
        var cell_controller = Notebook.Cell.create_controller(cell_model);
        cell_model.controller = cell_controller;
        return {controller: cell_controller, changes: model.append_cell(cell_model, id)};
    }

    function insert_cell_helper(content, type, id) {
        var cell_model = Notebook.Cell.create_model(content, type);
        var cell_controller = Notebook.Cell.create_controller(cell_model);
        cell_model.controller = cell_controller;
        return {controller: cell_controller, changes: model.insert_cell(cell_model, id)};
    }

    function on_load(k, version, notebook) {
        if (!_.isUndefined(notebook.files)) {
            this.clear();
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
            // is there anything else to gist permissions?
            model.read_only(version != null || notebook.user.login != rcloud.username());
            current_gist_ = notebook;
        }
        k && k(notebook);
    }

    // calculate the changes needed to get back from the newest version in notebook
    // back to what we are presently displaying (current_gist_)
    function find_changes_from(notebook) {
        var changes = [];
        var nf = notebook.files,
            cf = _.extend({}, current_gist_.files); // to keep track of changes
        for(var f in nf) {
            if(f==='r_type' || f==='r_attributes')
                continue; // R metadata
            if(f in cf) {
                if(cf[f].language != nf[f].language || cf[f].content != nf[f].content) {
                    changes.push({id: f,
                                  language: cf[f].language,
                                  content: cf[f].content});
                }
                delete cf[f];
            }
            else changes.push({id: f, erase: true, language: nf[f].language});
        }
        for(f in cf) {
            if(f==='r_type' || f==='r_attributes')
                continue; // artifact of rserve.js
            changes.push({id: f,
                          language: cf[f].language,
                          content: cf[f].content});
        }
        return changes;
    }

    function on_dirty() {
        if(!dirty_) {
            if(save_button_)
                ui_utils.enable_bs_button(save_button_);
            dirty_ = true;
        }
        if(save_timer_)
            window.clearTimeout(save_timer_);
        save_timer_ = window.setTimeout(function() {
            result.save();
            save_timer_ = null;
        }, save_timeout_);
    }

    function setup_show_source() {
        show_source_checkbox_ = ui_utils.checkbox_menu_item($("#show-source"),
           function() {result.show_r_source();},
           function() {result.hide_r_source();});
        show_source_checkbox_.set_state(true);
    }

    setup_show_source();
    model.dishers.push({on_dirty: on_dirty});

    var result = {
        save_button: function(save_button) {
            if(arguments.length) {
                save_button_ = save_button;
            }
            return save_button_;
        },
        append_cell: function(content, type, id) {
            var cch = append_cell_helper(content, type, id);
            this.update_notebook(cch.changes);
            return cch.controller;
        },
        insert_cell: function(content, type, id) {
            var cch = insert_cell_helper(content, type, id);
            this.update_notebook(cch.changes);
            return cch.controller;
        },
        remove_cell: function(cell_model) {
            var changes = model.remove_cell(cell_model);
            shell.prompt_widget.focus(); // there must be a better way
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
                model.read_only(notebook.user.login != rcloud.username());
                current_gist_ = notebook;
                k && k(notebook);
            });
        },
        fork_or_revert_notebook: function(is_mine, gistname, version, k) {
            var that = this;
            function update_and_load(changes, gistname, k) {
                // force a full reload in all cases, as a sanity check
                // i.e. we might know what the notebook state should be,
                // but load the notebook to make sure
                var k2 = function() {
                    that.load_notebook(gistname, null, k);
                };
                if(changes.length)
                    that.update_notebook(changes, gistname, k2);
                else
                    k2();

            }
            if(is_mine) // revert: get HEAD, calculate changes from there to here, and apply
                rcloud.load_notebook(gistname, null, function(notebook) {
                    var changes = find_changes_from(notebook);
                    update_and_load(changes, gistname, k);
                });
            else // fork:
                rcloud.fork_notebook(gistname, function(notebook) {
                    if(version) {
                        // fork, then get changes from there to where we are in the past, and apply
                        // git api does not return the files on fork, so load
                        rcloud.get_notebook(notebook.id, null, function(notebook2) {
                            var changes = find_changes_from(notebook2);
                            update_and_load(changes, notebook2.id, k);
                        });
                    }
                    else
                        update_and_load([], notebook.id, k);
                });
        },
        update_notebook: function(changes, gistname, k) {
            // remove any "empty" changes.  we can keep empty cells on the
            // screen but github will refuse them.  if the user doesn't enter
            // stuff in them before saving, they will disappear on next session
            changes = changes.filter(function(change) { return !!change.content || change.erase; });
            if(!changes.length)
                return;
            if(model.read_only())
                throw "attempted to update read-only notebook";
            gistname = gistname || shell.gistname();
            function changes_to_gist(changes) {
                // we don't use the gist rename feature because it doesn't
                // allow renaming x -> y and creating a new x at the same time
                // instead, create y and if there is no longer any x, erase it
                var post_names = _.reduce(changes,
                                         function(names, change) {
                                             if(!change.erase) {
                                                 var after = change.rename || change.id;
                                                 names[Notebook.part_name(after, change.language)] = 1;
                                             }
                                             return names;
                                         }, {});
                function xlate_change(filehash, change) {
                    var c = {};
                    if(change.content !== undefined)
                        c.content = change.content;
                    var pre_name = Notebook.part_name(change.id, change.language);
                    if(change.erase || !post_names[pre_name])
                        filehash[pre_name] = null;
                    if(!change.erase) {
                        var post_name = Notebook.part_name(change.rename || change.id, change.language);
                        filehash[post_name] = c;
                    }
                    return filehash;
                }
                return {files: _.reduce(changes, xlate_change, {})};
            }
            // not awesome to callback to someone else here
            k = k || editor.load_callback(null, true, true);
            var k2 = function(notebook) {
                if('error' in notebook) {
                    k(notebook);
                    return;
                }
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
        save: function() {
            if(dirty_) {
                var changes = this.refresh_cells();
                this.update_notebook(changes);
                if(save_button_)
                    ui_utils.disable_bs_button(save_button_);
                dirty_ = false;
            }

        },
        run_all: function(k) {
            this.save();
            var n = model.notebook.length;
            var disp;
            function bump_executed() {
                --n;
                if(disp.length)
                    disp.shift()();
                if (n === 0)
                    k && k();
            }
            _.each(model.notebook, function(cell_model) {
                cell_model.controller.set_status_message("Waiting...");
            });
            // this is silly.
            disp = _.map(model.notebook, function(cell_model) {
                return function() {
                    cell_model.controller.set_status_message("Computing...");
                };
            });
            if(disp.length) {
                disp.shift()();
                _.each(model.notebook, function(cell_model) {
                    cell_model.controller.execute(bump_executed);
                });
            }
            else k && k();
        },

        //////////////////////////////////////////////////////////////////////

        _r_source_visible: true,

        hide_r_source: function() {
            this._r_source_visible = false;
            show_source_checkbox_.set_state(this._r_source_visible);
            Notebook.hide_r_source();
        },
        show_r_source: function() {
            this._r_source_visible = true;
            show_source_checkbox_.set_state(this._r_source_visible);
            Notebook.show_r_source();
        }
    };
    model.controller = result;
    return result;
};
