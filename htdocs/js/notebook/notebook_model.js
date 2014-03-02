Notebook.create_model = function()
{
    var readonly_ = false;
    var user_ = "";

    function last_id(notebook) {
        if(notebook.length)
            return notebook[notebook.length-1].id();
        else
            return 0;
    }

    /* note, the code below is a little more sophisticated than it needs to be:
       allows multiple inserts or removes but currently n is hardcoded as 1.  */
    return {
        notebook: [], // FIXME this should be called "cells"
        assets: [],
        views: [], // sub list for cell content pubsub
        dishers: [], // for dirty bit pubsub
        clear: function() {
            var cells_removed = this.remove_cell(null,last_id(this.notebook));
            var assets_removed = this.remove_asset(null,this.assets.length);
            return cells_removed.concat(assets_removed);
        },
        append_asset: function(asset_model, filename, skip_event) {
            asset_model.parent_model = this;
            var changes = [];
            changes.push(asset_model.change_object());
            this.assets.push(asset_model);
            if(!skip_event)
                _.each(this.views, function(view) {
                    view.asset_appended(asset_model);
                });
            return changes;
        },
        append_cell: function(cell_model, id, skip_event) {
            cell_model.parent_model = this;
            var changes = [];
            var n = 1;
            id = id || 1;
            id = Math.max(id, last_id(this.notebook)+1);
            while(n) {
                cell_model.id(id);
                changes.push(cell_model.change_object());
                this.notebook.push(cell_model);
                if(!skip_event)
                    _.each(this.views, function(view) {
                        view.cell_appended(cell_model);
                    });
                ++id;
                --n;
            }
            return changes;
        },
        insert_cell: function(cell_model, id, skip_event) {
            var that = this;
            cell_model.parent_model = this;
            var changes = [];
            var n = 1, x = 0;
            while(x<this.notebook.length && this.notebook[x].id() < id) ++x;
            // check if ids can go above rather than shifting everything else down
            if(x<this.notebook.length && id+n > this.notebook[x].id()) {
                var prev = x>0 ? this.notebook[x-1].id() : 0;
                id = Math.max(this.notebook[x].id()-n, prev+1);
            }
            for(var j=0; j<n; ++j) {
                changes.push(cell_model.change_object({id: id+j}));
                cell_model.id(id+j);
                this.notebook.splice(x, 0, cell_model);
                if(!skip_event)
                    _.each(this.views, function(view) {
                        view.cell_inserted(that.notebook[x], x);
                    });
                ++x;
            }
            while(x<this.notebook.length && n) {
                if(this.notebook[x].id() > id) {
                    var gap = this.notebook[x].id() - id;
                    n -= gap;
                    id += gap;
                }
                if(n<=0)
                    break;
                changes.push(this.notebook[x].change_object({
                    rename: this.notebook[x].id()+n
                }));
                this.notebook[x].id(this.notebook[x].id() + n);
                ++x;
                ++id;
            }
            return changes;
        },
        remove_asset: function(asset_model, n, skip_event) {
            if (this.assets.length === 0)
                return [];
            var that = this;
            var asset_index, filename;
            if(asset_model!=null) {
                asset_index = this.assets.indexOf(asset_model);
                filename = asset_model.filename();
                if (asset_index === -1) {
                    throw "asset_model not in notebook model?!";
                }
            }
            else {
                asset_index = 0;
                filename = this.assets[asset_index].filename();
            }
            n = n || 1;
            var x = asset_index;
            var changes = [];
            while(x<this.assets.length && n) {
                if(this.assets[x].filename() == filename) {
                    if(!skip_event)
                        _.each(this.views, function(view) {
                            view.asset_removed(that.assets[x], x);
                        });
                    changes.push(that.assets[x].change_object({ erase: 1 }));
                    this.assets.splice(x, 1);
                }
                if (x<this.assets.length)
                    filename = this.assets[x].filename();
                --n;
            }
            return changes;
        },
        remove_cell: function(cell_model, n, skip_event) {
            var that = this;
            var cell_index, id;
            if(cell_model!=null) {
                cell_index = this.notebook.indexOf(cell_model);
                id = cell_model.id();
                if (cell_index === -1) {
                    throw "cell_model not in notebook model?!";
                }
            }
            else {
                cell_index = 0;
                id = 1;
            }
            n = n || 1;
            var x = cell_index;
            var changes = [];
            while(x<this.notebook.length && n) {
                if(this.notebook[x].id() == id) {
                    if(!skip_event)
                        _.each(this.views, function(view) {
                            view.cell_removed(that.notebook[x], x);
                        });
                    changes.push(that.notebook[x].change_object({ erase: 1 }));
                    this.notebook.splice(x, 1);
                }
                ++id;
                --n;
            }
            return changes;
        },
        move_cell: function(cell_model, before) {
            var pre_index = this.notebook.indexOf(cell_model),
                changes = this.remove_cell(cell_model, 1, true)
                    .concat(before >= 0
                            ? this.insert_cell(cell_model, before, true)
                            : this.append_cell(cell_model, null, true)),
                post_index = this.notebook.indexOf(cell_model);
            _.each(this.views, function(view) {
                view.cell_moved(cell_model, pre_index, post_index);
            });
            return changes;
        },
        change_cell_language: function(cell_model, language) {
            // ugh. we can't use the change_object with "language" because
            // this changes name() (the way the object is written kind
            // of assumes that id is the only thing that can change)
            // at the same time, we can use the "rename" field because, in
            // that case, the object just returns the name itself.
            // FIXME this is really ugly.
            cell_model.language(language);
            var c = cell_model.change_object({language: language});
            return [cell_model.change_object({
                rename: c.name()
            })];
        },
        update_cell: function(cell_model) {
            return [cell_model.change_object()];
        },
        update_asset: function(asset_model) {
            return [asset_model.change_object()];
        },
        reread_cells: function() {
            var that = this;
            // Forces views to update models
            var changed_cells_per_view = _.map(this.views, function(view) {
                return view.update_model();
            });
            if(changed_cells_per_view.length != 1)
                throw "not expecting more than one notebook view";
            var contents = changed_cells_per_view[0];
            var changes = [];
            for (var i=0; i<contents.length; ++i) {
                var content = contents[i];
                if (content !== null) {
                    changes.push(that.notebook[i].change_object());
                    // build_cell_change(that.notebook[i].id(),
                    //                   content,
                    //                   that.notebook[i].language()));
                }
            }
            var asset_change = RCloud.UI.scratchpad.update_model();
            if (asset_change) {
                var active_asset_model = RCloud.UI.scratchpad.current_model;
                changes.push(active_asset_model.change_object());
            }
            return changes;
        },
        read_only: function(readonly) {
            if(!_.isUndefined(readonly)) {
                readonly_ = readonly;
                _.each(this.views, function(view) {
                    view.set_readonly(readonly_);
                });
            }
            return readonly_;
        },
        user: function(user) {
            if (!_.isUndefined(user)) {
                user_ = user;
            }
            return user_;
        },
        on_dirty: function() {
            _.each(this.dishers, function(disher) {
                disher.on_dirty();
            });
        },
        json: function() {
            return _.map(this.notebook, function(cell_model) {
                return cell_model.json();
            });
        }
    };
};
