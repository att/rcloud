Notebook.create_controller = function(model)
{
    var current_gist_,
        dirty_ = false,
        save_timer_ = null;
    // only create the callbacks once, but delay creating them until the editor
    // is initialized
    var default_callback = function() {
        var cb_ = null;
        return function() {
            if(!cb_) {
                var editor_callback = editor.load_callback({is_change: true, selroot: true});
                cb_ = function(notebook) {
                    var saveb = RCloud.UI.navbar.control('save_notebook');
                    saveb && saveb.disable();
                    dirty_ = false;
                    if(save_timer_) {
                        window.clearTimeout(save_timer_);
                        save_timer_ = null;
                    }
                    rcloud.refresh_compute_notebook(notebook.id);
                    return editor_callback(notebook);
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
                changes: model.append_asset(asset_model, filename),
                model: asset_model};
    }

    function insert_cell_helper(content, type, id) {
        var cell_model = Notebook.Cell.create_model(content, type);
        var cell_controller = Notebook.Cell.create_controller(cell_model);
        cell_model.controller = cell_controller;
        return {controller: cell_controller, changes: model.insert_cell(cell_model, id)};
    }

    function on_load(version, notebook) {
        // the git backend should determine readonly but that's another huge refactor
        // and it would require multiple usernames, which would be a rather huge change
        var ninf = editor.get_notebook_info(notebook.id);
        var is_read_only = ninf && ninf.source ||
                version !== null ||
                notebook.user.login !== rcloud.username() ||
                shell.is_view_mode();
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
        return (changes.length ?
            update_notebook(changes, gistname) :
            Promise.resolve(undefined))
            .then(function() {
                return result.load_notebook(gistname, null); // do a load - we need to refresh
            });
    }

    function refresh_buffers() {
        return model.reread_buffers();
    }

    function on_dirty() {
        if(!dirty_) {
            var saveb = RCloud.UI.navbar.control('save_notebook');
            saveb && saveb.enable();
            dirty_ = true;
        }
        if(save_timer_)
            window.clearTimeout(save_timer_);
        var save_timeout = shell.autosave_timeout();
        if(save_timeout > 0)
            save_timer_ = window.setTimeout(function() {
                result.save();
                save_timer_ = null;
            }, save_timeout);
    }

    model.dishers.push({on_dirty: on_dirty});

    var result = {
        current_gist: function() {
            // are there reasons we shouldn't be exposing this?
            return current_gist_;
        },
        append_asset: function(content, filename) {
            var cch = append_asset_helper(content, filename);
            return update_notebook(refresh_buffers().concat(cch.changes))
                .then(default_callback())
                .then(function(notebook) {
                    // set content again because server may have determined it's text
                    cch.model.content(notebook.files[filename].content);
                    return [notebook, cch.controller];
                });
        },
        append_cell: function(content, type, id) {
            var cch = append_cell_helper(content, type, id);
            return update_notebook(refresh_buffers().concat(cch.changes))
                .then(default_callback())
                .then(function(notebook) {
                    return [notebook, cch.controller];
                });
        },
        insert_cell: function(content, type, id) {
            var cch = insert_cell_helper(content, type, id);
            return update_notebook(refresh_buffers().concat(cch.changes))
                .then(default_callback())
                .then(function(notebook) {
                    return [notebook, cch.controller];
                });
        },
        remove_cell: function(cell_model) {
            var changes = refresh_buffers().concat(model.remove_cell(cell_model));
            RCloud.UI.command_prompt.focus();
            return update_notebook(changes)
                .then(default_callback());
        },
        remove_selected_cells: function() {
            model.remove_selected_cells();
        },
        invert_selected_cells: function() {
            model.invert_selected_cells();
        },
        clear_all_selected_cells: function() {
            model.clear_all_selected_cells();
        },
        select_all_cells: function() {
            model.select_all_cells();
        },
        remove_asset: function(asset_model) {
            var changes = refresh_buffers().concat(model.remove_asset(asset_model));
            return update_notebook(changes)
                .then(default_callback());
        },
        move_cell: function(cell_model, before) {
            var changes = refresh_buffers().concat(model.move_cell(cell_model, before ? before.id() : -1));
            return update_notebook(changes)
                .then(default_callback());
        },
        join_prior_cell: function(cell_model) {
            var prior = model.prior_cell(cell_model);
            if(!prior)
                return Promise.resolve(undefined);

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
            return update_notebook(changes.concat(model.remove_cell(cell_model)))
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
                return Promise.resolve(undefined);
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
            return update_notebook(changes)
                .then(default_callback());
        },
        change_cell_language: function(cell_model, language) {
            var changes = refresh_buffers().concat(model.change_cell_language(cell_model, language));
            return update_notebook(changes)
                .then(default_callback());
        },
        select_cell: function(cell_model, modifiers) {
            var changes = refresh_buffers().concat(model.select_cell(cell_model, modifiers));
        },
        clear: function() {
            model.clear();
            // FIXME when scratchpad becomes a view, clearing the model
            // should make this happen automatically.
            RCloud.UI.scratchpad.clear();
        },
        load_notebook: function(gistname, version) {
            return rcloud.load_notebook(gistname, version || null)
                .catch(function(xep) {
                    xep.from_load = true;
                    throw xep;
                })
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
                .then(function(notebook) {
                    // set content again because server may have determined it's text
                    asset_model.content(notebook.files[asset_model.filename()].content);
                    return notebook;
                })
                .then(default_callback());
        },
        rename_notebook: function(desc) {
            return update_notebook(refresh_buffers(), null, {description: desc})
                .then(default_callback());
        },
        apply_changes: function(changes) {
            return update_notebook(changes).then(default_callback());
        },
        save: function() {
            if(!dirty_)
                return Promise.resolve(undefined);
            return update_notebook(refresh_buffers())
                .then(default_callback());
        },
        execute_cell_version: function(context_id, info) {
            function execute_cell_callback(r) {
                if (r && r.r_attributes) {
                    if (r.r_attributes['class'] === 'parse-error') {
                        // available: error=message
                        RCloud.end_cell_output(context_id, "Parse error: " + r.error);
                        throw 'stop';
                    } else if (r.r_attributes['class'] === 'cell-eval-error') {
                        // available: error=message, traceback=vector of calls, expression=index of the expression that failed
                        var tb = r.traceback || '';
                        if (tb.join) tb = tb.join("\n");
                        var trace = tb ? 'trace:\n'+tb : true;
                        RCloud.end_cell_output(context_id, trace);
                        throw 'stop';
                    }
                    else RCloud.end_cell_output(context_id, null);
                }
                else RCloud.end_cell_output(context_id, null);
                _.each(model.execution_watchers, function(ew) {
                    ew.run_cell(info.json_rep);
                });
            }
            rcloud.record_cell_execution(info.json_rep);
            var cell_eval = rcloud.authenticated ? rcloud.authenticated_cell_eval : rcloud.session_cell_eval;
            return cell_eval(context_id, info.partname, info.language, info.version, false).then(execute_cell_callback);
        },
        run_all: function() {
            var that = this;
            return this.save().then(function() {
                _.each(model.cells, function(cell_model) {
                    cell_model.controller.enqueue_execution_snapshot();
                });
            });
        },
        show_cell_numbers: function(whether) {
            _.each(model.views, function(view) {
                view.set_show_cell_numbers(whether);
            });
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        is_mine: function() {
            return rcloud.username() === model.user();
        },

        //////////////////////////////////////////////////////////////////////

        _r_source_visible: true,

        hide_r_source: function() {
            this._r_source_visible = false;
            RCloud.UI.advanced_menu.check('show_source', false);
            Notebook.hide_r_source();
        },
        show_r_source: function() {
            this._r_source_visible = true;
            RCloud.UI.advanced_menu.check('show_source', true);
            Notebook.show_r_source();
        }
    };
    model.controller = result;
    return result;
};
