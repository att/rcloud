Notebook.create_controller = function(model)
{
    var current_gist_,
        dirty_ = false,
        save_button_ = null,
        save_timer_ = null,
        save_timeout_ = 30000, // 30s
        show_source_checkbox_ = null;

    // only create the callbacks once, but delay creating them until the editor
    // is initialized
    var default_callback = function() {
        var cb_ = null,
            editor_callback_ = null;
        return function() {
            if(!cb_) {
                editor_callback_ = editor.load_callback({is_change: true, selroot: true});
                cb_ = function(notebook) {
                    if(save_button_)
                        ui_utils.disable_bs_button(save_button_);
                    dirty_ = false;
                    if(save_timer_) {
                        window.clearTimeout(save_timer_);
                        save_timer_ = null;
                    }
                    return editor_callback_(notebook);
                };
            }
            return cb_;
        };
    }();

    function append_cell_helper(content, type, id) {
        var cell_model = Notebook.Cell.create_model(content, type);
        var cell_controller = Notebook.Cell.create_controller(cell_model);
        cell_model.controller = cell_controller;
        return {controller: cell_controller, changes: model.append_cell(cell_model, id)};
    }

    function append_asset_helper(content, filename) {
        var asset_model = Notebook.Asset.create_model(content, filename);
        var asset_controller = Notebook.Asset.create_controller(asset_model);
        asset_model.controller = asset_controller;
        return {controller: asset_controller,
                changes: model.append_asset(asset_model, filename)};
    }

    function insert_cell_helper(content, type, id) {
        var cell_model = Notebook.Cell.create_model(content, type);
        var cell_controller = Notebook.Cell.create_controller(cell_model);
        cell_model.controller = cell_controller;
        return {controller: cell_controller, changes: model.insert_cell(cell_model, id)};
    }

    function on_load(version, notebook) {
        var is_read_only = version !== null || notebook.user.login !== rcloud.username();
        current_gist_ = notebook;
        model.read_only(is_read_only);
        if (!_.isUndefined(notebook.files)) {
            var i;
            // we can't do much with a notebook with no name, so give it one
            if(!notebook.description)
                notebook.description = "(untitled)";
            this.clear();
            var cells = {}; // could rely on alphabetic input instead of gathering
            var assets = {};
            _.each(notebook.files, function (file, k) {
                // ugh, we really need to have a better javascript mapping of R objects..
                if (k === "r_attributes" || k === "r_type")
                    return;
                var filename = file.filename;
                if(Notebook.is_part_name(filename)) {
                    // cells
                    var number = parseInt(filename.slice(4).split('.')[0]);
                    if(!isNaN(number))
                        cells[number] = [file.content, file.language, number];
                } else {
                    // assets
                    assets[filename] = [file.content, file.filename];
                }
            });
            // we intentionally drop change objects on the floor, here and only here.
            // that way the cells/assets are checkpointed where they were loaded
            var asset_controller;
            for(i in cells)
                append_cell_helper(cells[i][0], cells[i][1], cells[i][2]);
            for(i in assets) {
                var result = append_asset_helper(assets[i][0], assets[i][1]).controller;
                asset_controller = asset_controller || result;
            }
            model.user(notebook.user.login);
            model.update_files(notebook.files);
            if(asset_controller)
                asset_controller.select();
            else
                RCloud.UI.scratchpad.set_model(null);
            // set read-only again to trickle MVC events through to the display :-(
            model.read_only(is_read_only);
        }
        return notebook;
    }

    // calculate the changes needed to get back from the newest version in notebook
    // back to what we are presently displaying (current_gist_)
    function find_changes_from(notebook) {
        function change_object(obj) {
            obj.name = function(n) { return n; };
            return obj;
        }
        var changes = [];

        // notebook files, current files
        var nf = notebook.files,
            cf = _.extend({}, current_gist_.files); // dupe to keep track of changes

        // find files which must be changed or removed to get from nf to cf
        for(var f in nf) {
            if(f==='r_type' || f==='r_attributes')
                continue; // R metadata
            if(f in cf) {
                if(cf[f].language != nf[f].language || cf[f].content != nf[f].content) {
                    changes.push(change_object({filename: f,
                                                language: cf[f].language,
                                                content: cf[f].content}));
                }
                delete cf[f];
            }
            else changes.push(change_object({filename: f, erase: true, language: nf[f].language}));
        }

        // find files which must be added to get from nf to cf
        for(f in cf) {
            if(f==='r_type' || f==='r_attributes')
                continue; // artifact of rserve.js
            changes.push(change_object({filename: f,
                                        language: cf[f].language,
                                        content: cf[f].content}));
        }
        return changes;
    }

    function update_notebook(changes, gistname, more) {
        function add_more_changes(gist) {
            if (_.isUndefined(more))
                return gist;
            return _.extend(_.clone(gist), more);
        }
        // remove any "empty" changes.  we can keep empty cells on the
        // screen but github will refuse them.  if the user doesn't enter
        // stuff in them before saving, they will disappear on next session
        changes = changes.filter(function(change) {
            return change.content || change.erase || change.rename;
        });
        if (model.read_only())
            return Promise.reject(new Error("attempted to update read-only notebook"));
        if (!changes.length && _.isUndefined(more)) {
            return Promise.cast(current_gist_);
        }
        gistname = gistname || shell.gistname();
        function changes_to_gist(changes) {
            var files = {}, creates = {};
            // play the changes in order - they must be sequenced so this makes sense
            _.each(changes, function(change) {
                if(change.erase || change.rename) {
                    if(creates[change.filename])
                        delete files[change.filename];
                    else
                        files[change.filename] = null;
                    if(change.rename)
                        files[change.rename] = {content: change.content};
                }
                else {
                    // if the first time we see a filename in the changeset is a create,
                    // we need to remember that so that if the last change is a delete,
                    // we just send "no change"
                    if(change.create && !(change.filename in files))
                        creates[change.filename] = true;
                    files[change.filename] = {content: change.content};
                }
            });
            return {files: files};
        }
        var gist = add_more_changes(changes_to_gist(changes));
        return rcloud.update_notebook(gistname, gist)
            .then(function(notebook) {
                if('error' in notebook)
                    throw notebook;
                current_gist_ = notebook;
                model.update_files(notebook.files);
                return notebook;
            })
            .catch(function(e) {
                // this should not ever happen but there is no choice but to reload if it does
                if(/non-existent/.test(e.message))
                    editor.fatal_reload(e.message);
                throw e;
            });
    }

    function apply_changes_and_load(changes, gistname) {
        return changes.length ?
            update_notebook(changes, gistname).then(result.load_notebook(gistname, null)) :
            result.load_notebook(gistname, null); // do a load - we need to refresh
    }

    function refresh_buffers() {
        return model.reread_buffers();
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
        current_gist: function() {
            // are there reasons we shouldn't be exposing this?
            return current_gist_;
        },
        save_button: function(save_button) {
            if(arguments.length) {
                save_button_ = save_button;
            }
            return save_button_;
        },
        append_asset: function(content, filename) {
            var cch = append_asset_helper(content, filename);
            return update_notebook(refresh_buffers().concat(cch.changes))
                .then(default_callback())
                .return(cch.controller);
        },
        append_cell: function(content, type, id) {
            var cch = append_cell_helper(content, type, id);
            update_notebook(refresh_buffers().concat(cch.changes))
                .then(default_callback());
            return cch.controller;
        },
        insert_cell: function(content, type, id) {
            var cch = insert_cell_helper(content, type, id);
            update_notebook(refresh_buffers().concat(cch.changes))
                .then(default_callback());
            return cch.controller;
        },
        remove_cell: function(cell_model) {
            var changes = refresh_buffers().concat(model.remove_cell(cell_model));
            RCloud.UI.command_prompt.prompt.widget.focus(); // there must be a better way
            update_notebook(changes)
                .then(default_callback());
        },
        remove_asset: function(asset_model) {
            var changes = refresh_buffers().concat(model.remove_asset(asset_model));
            update_notebook(changes)
                .then(default_callback());
        },
        move_cell: function(cell_model, before) {
            var changes = refresh_buffers().concat(model.move_cell(cell_model, before ? before.id() : -1));
            update_notebook(changes)
                .then(default_callback());
        },
        join_prior_cell: function(cell_model) {
            var prior = model.prior_cell(cell_model);
            if(!prior)
                return;

            function opt_cr(text) {
                if(text.length && text[text.length-1] != '\n')
                    return text + '\n';
                return text;
            }
            function crunch_quotes(left, right) {
                var end = /```\n$/, begin = /^```{r}/;
                if(end.test(left) && begin.test(right))
                    return left.replace(end, '') + right.replace(begin, '');
                else return left + right;
            }

            // note we have to refresh everything and then concat these changes onto
            // that.  which won't work in general but looks like it is okay to
            // concatenate a bunch of change content objects with a move or change
            // to one of the same objects, and an erase of one
            var new_content, changes = refresh_buffers();

            // this may have to be multiple dispatch when there are more than two languages
            if(prior.language()==cell_model.language()) {
                new_content = crunch_quotes(opt_cr(prior.content()),
                                            cell_model.content());
                prior.content(new_content);
                changes = changes.concat(model.update_cell(prior));
            }
            else {
                if(prior.language()==="R") {
                    new_content = crunch_quotes('```{r}\n' + opt_cr(prior.content()) + '```\n',
                                                cell_model.content());
                    prior.content(new_content);
                    changes = changes.concat(model.change_cell_language(prior, "Markdown"));
                    changes[changes.length-1].content = new_content; //  NOOOOOO!!!!
                }
                else {
                    new_content = crunch_quotes(opt_cr(prior.content()) + '```{r}\n',
                                                opt_cr(cell_model.content()) + '```\n');
                    new_content = new_content.replace(/```\n```{r}\n/, '');
                    prior.content(new_content);
                    changes = changes.concat(model.update_cell(prior));
                }
            }
            _.each(prior.views, function(v) { v.clear_result(); });
            update_notebook(changes.concat(model.remove_cell(cell_model)))
                .then(default_callback());
        },
        split_cell: function(cell_model, point1, point2) {
            function resplit(a) {
                for(var i=0; i<a.length-1; ++i)
                    if(!/\n$/.test(a[i]) && /^\n/.test(a[i+1])) {
                        a[i] = a[i].concat('\n');
                        a[i+1] = a[i+1].replace(/^\n/, '');
                    }
            }
            var changes = refresh_buffers();
            var content = cell_model.content();
            // make sure point1 is before point2
            if(point1>=point2)
                point2 = undefined;
            // remove split points at the beginning or end
            if(point2 !== undefined && /^\s*$/.test(content.substring(point2)))
                point2 = undefined;
            if(point1 !== undefined) {
                if(/^\s*$/.test(content.substring(point1)))
                    point1 = undefined;
                else if(/^\s*$/.test(content.substring(0, point1)))
                    point1 = point2;
            }
            // don't do anything if there is no real split point
            if(point1 === undefined)
                return;
            var parts = [content.substring(0, point1)],
                id = cell_model.id(), language = cell_model.language();
            if(point2 === undefined)
                parts.push(content.substring(point1));
            else
                parts.push(content.substring(point1, point2),
                           content.substring(point2));
            resplit(parts);
            cell_model.content(parts[0]);
            _.each(cell_model.views, function(v) { v.clear_result(); });
            changes = changes.concat(model.update_cell(cell_model));
            // not great to do multiple inserts here - but not quite important enough to enable insert-n
            for(var i=1; i<parts.length; ++i)
                changes = changes.concat(insert_cell_helper(parts[i], language, id+i).changes);
            update_notebook(changes)
                .then(default_callback());
        },
        change_cell_language: function(cell_model, language) {
            var changes = refresh_buffers().concat(model.change_cell_language(cell_model, language));
            update_notebook(changes)
                .then(default_callback());
        },
        clear: function() {
            model.clear();
            // FIXME when scratchpad becomes a view, clearing the model
            // should make this happen automatically.
            RCloud.UI.scratchpad.clear();
        },
        load_notebook: function(gistname, version) {
            return rcloud.load_notebook(gistname, version || null)
                .then(_.bind(on_load, this, version));
        },
        create_notebook: function(content) {
            var that = this;
            return rcloud.create_notebook(content)
                .then(_.bind(on_load,this,null));
        },
        revert_notebook: function(gistname, version) {
            model.read_only(false); // so that update_notebook doesn't throw
            // get HEAD, calculate changes from there to here, and apply
            return rcloud.load_notebook(gistname, null).then(function(notebook) {
                return [find_changes_from(notebook), gistname];
            }).spread(apply_changes_and_load);
        },
        fork_notebook: function(gistname, version) {
            model.read_only(false); // so that update_notebook doesn't throw
            return rcloud.fork_notebook(gistname)
                .then(function(notebook) {
                    if(version)
                        // fork, then get changes from there to where we are in the past, and apply
                        // git api does not return the files on fork, so load
                        return rcloud.get_notebook(notebook.id, null)
                        .then(function(notebook2) {
                            return [find_changes_from(notebook2), notebook2.id];
                        });
                    else return [[], notebook.id];
            }).spread(apply_changes_and_load);
        },
        update_cell: function(cell_model) {
            return update_notebook(refresh_buffers().concat(model.update_cell(cell_model)))
                .then(default_callback());
        },
        update_asset: function(asset_model) {
            return update_notebook(refresh_buffers().concat(model.update_asset(asset_model)))
                .then(default_callback());
        },
        rename_notebook: function(desc) {
            return update_notebook(refresh_buffers(), null, {description: desc})
                .then(default_callback());
        },
        save: function() {
            if(!dirty_)
                return Promise.resolve(undefined);
            return update_notebook(refresh_buffers())
                .then(default_callback());
        },
        run_all: function() {
            this.save();
            _.each(model.cells, function(cell_model) {
                cell_model.controller.set_status_message("Waiting...");
            });

            // will ordering bite us in the leg here?
            var promises = _.map(model.cells, function(cell_model) {
                return Promise.resolve().then(function() {
                    cell_model.controller.set_status_message("Computing...");
                    return cell_model.controller.execute();
                });
            });
            return RCloud.UI.with_progress(function() {
                return Promise.all(promises);
            });
        },

        //////////////////////////////////////////////////////////////////////

        is_mine: function() {
            return rcloud.username() === model.user();
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
