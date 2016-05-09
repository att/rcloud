// these functions in loops are okay
/*jshint -W083 */
Notebook.create_model = function()
{
    var readonly_ = false,
        user_ = "";
        last_selected_ = undefined;

    function last_id(cells) {
        if(cells.length)
            return cells[cells.length-1].id();
        else
            return 0;
    }

    // anything here that returns a set of changes must only be called from the
    // controller.  the controller makes sure those changes are sent to github.

    /* note, the code below is a little more sophisticated than it needs to be:
       allows multiple inserts or removes but currently n is hardcoded as 1.  */
    return {
        cells: [],
        assets: [],
        views: [], // sub list for cell content pubsub
        dishers: [], // for dirty bit pubsub
        execution_watchers: [],
        clear: function() {
            var cells_removed = this.remove_cell(null,last_id(this.cells));
            var assets_removed = this.remove_asset(null,this.assets.length);
            RCloud.UI.selection_bar.update(this.cells);
            return cells_removed.concat(assets_removed);
        },
        get_asset: function(filename) {
            return _.find(this.assets, function(asset) {
                return asset.filename() == filename;
            });
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
        cell_count: function() {
            return this.cells.length;
        },
        selected_count: function() {
            return _.filter(this.cells, function(cell) { return cell.is_selected(); }).length;
        },
        append_cell: function(cell_model, id, skip_event) {
            cell_model.parent_model = this;
            cell_model.renew_content();
            var changes = [];
            var n = 1;
            id = id || 1;
            id = Math.max(id, last_id(this.cells)+1);
            while(n) {
                cell_model.id(id);
                changes.push(cell_model.change_object());
                this.cells.push(cell_model);
                if(!skip_event)
                    _.each(this.views, function(view) {
                        view.cell_appended(cell_model);
                    });
                ++id;
                --n;
            }
            RCloud.UI.selection_bar.update(this.cells);
            return changes;
        },
        insert_cell: function(cell_model, id, skip_event) {
            var that = this;
            cell_model.parent_model = this;
            cell_model.renew_content();
            var changes = [];
            var n = 1, x = 0;
            while(x<this.cells.length && this.cells[x].id() < id) ++x;
            // if id is before some cell and id+n knocks into that cell...
            if(x<this.cells.length && id+n > this.cells[x].id()) {
                // see how many ids we can squeeze between this and prior cell
                var prev = x>0 ? this.cells[x-1].id() : 0;
                id = Math.max(this.cells[x].id()-n, prev+1);
            }
            for(var j=0; j<n; ++j) {
                changes.push(cell_model.change_object({id: id+j})); // most likely blank
                cell_model.id(id+j);
                this.cells.splice(x, 0, cell_model);
                if(!skip_event)
                    _.each(this.views, function(view) {
                        view.cell_inserted(that.cells[x], x);
                    });
                ++x;
            }
            while(x<this.cells.length && n) {
                if(this.cells[x].id() > id) {
                    var gap = this.cells[x].id() - id;
                    n -= gap;
                    id += gap;
                }
                if(n<=0)
                    break;
                changes.push(this.cells[x].change_object({
                    rename: this.cells[x].id()+n
                }));
                this.cells[x].id(this.cells[x].id() + n);
                ++x;
                ++id;
            }

            RCloud.UI.selection_bar.update(this.cells);

            // apply the changes backward so that we're moving each cell
            // out of the way just before putting the next one in its place
            return changes.reverse();
        },
        remove_asset: function(asset_model, n, skip_event) {
            if (this.assets.length === 0)
                return [];
            var that = this;
            var asset_index, filename;
            if(asset_model!==null) {
                asset_index = this.assets.indexOf(asset_model);
                filename = asset_model.filename();
                if (asset_index === -1) {
                    throw new Error("asset_model not in notebook model?!");
                }
            }
            else {
                asset_index = 0;
                filename = this.assets[asset_index].filename();
            }
            // the n > 1 case is stupid: it's only for clearing the
            // whole notebook (and no changes need to be recorded for that)
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
            if(cell_model!==null) {
                cell_index = this.cells.indexOf(cell_model);
                id = cell_model.id();
                if (cell_index === -1) {
                    throw new Error("cell_model not in notebook model?!");
                }
            }
            else {
                cell_index = 0;
                id = 1;
            }
            n = n || 1;
            var x = cell_index;
            var changes = [];
            while(x<this.cells.length && n) {
                if(this.cells[x].id() == id) {
                    var cell = this.cells[x];
                    this.cells.splice(x, 1);
                    if(!skip_event)
                        _.each(this.views, function(view) {
                            view.cell_removed(cell, x);
                        });
                    changes.push(cell.change_object({ erase: 1 }));
                }
                ++id;
                --n;
            }

            RCloud.UI.selection_bar.update(this.cells);
            
            return changes;
        },
        remove_selected_cells: function() {
            var that = this, changes = [];

            _.chain(this.cells)
            .filter(function(cell) {
                return cell.is_selected();
            })
            .each(function(cell) {
                changes = changes.concat(that.remove_cell(cell));
            });

            RCloud.UI.selection_bar.update(this.cells);

            return changes;
        },
        invert_selected_cells: function() {
            _.each(this.cells, function(cell) {
                cell.toggle_cell();
            });
            RCloud.UI.selection_bar.update(this.cells);
        },
        clear_all_selected_cells: function() {
            _.each(this.cells, function(cell) {
                cell.deselect_cell();
            });
            RCloud.UI.selection_bar.update(this.cells);
        },
        crop_cells: function() {
            var that = this, changes = [];
            _.chain(this.cells)
            .filter(function(cell) {
                return !cell.is_selected();
            })
            .each(function(cell) {
                changes = changes.concat(that.remove_cell(cell));
            });
            RCloud.UI.selection_bar.update(this.cells);

            return changes;
        },
        can_crop_cells: function() {
            return this.selected_count() && this.selected_count() !== this.cell_count();
        },
        select_all_cells: function() {
            _.each(this.cells, function(cell) {
                cell.select_cell();
            });
            RCloud.UI.selection_bar.update(this.cells);
        },
        move_cell: function(cell_model, before) {
            // remove doesn't change any ids, so we can just remove then add
            var pre_index = this.cells.indexOf(cell_model),
                changes = this.remove_cell(cell_model, 1, true)
                    .concat(before >= 0 ?
                            this.insert_cell(cell_model, before, true) :
                            this.append_cell(cell_model, null, true)),
                post_index = this.cells.indexOf(cell_model);
                last_selected_ = post_index;
            _.each(this.views, function(view) {
                view.cell_moved(cell_model, pre_index, post_index);
            });
            return changes;
        },
        prior_cell: function(cell_model) {
            var index = this.cells.indexOf(cell_model);
            if(index>0)
                return this.cells[index-1];
            else
                return null;
        },
        change_cell_language: function(cell_model, language) {
            // for this one case we have to use filenames instead of ids
            var pre_name = cell_model.filename();
            cell_model.language(language);
            return [cell_model.change_object({filename: pre_name,
                                              rename: cell_model.filename()})];
        },
        select_cell: function(cell_model, modifiers) {

            var that = this;

            var clear_all = function() {
                _.chain(that.cells)
                .filter(function(cell) {
                    return cell.is_selected();
                })
                .each(function(cell) {
                    cell.deselect_cell();
                }); 
            };

            var select_range = function(lower, upper) {
                clear_all();
                var items = [];
                for(var loop = lower; loop <= upper; loop++) {
                    that.cells[loop].select_cell();
                }
            };

            if(modifiers.is_toggle) {
                cell_model.toggle_cell();
                last_selected_ = this.cells.indexOf(cell_model);
            } else if(modifiers.is_exclusive) {
                clear_all();
                cell_model.toggle_cell();
                last_selected_ = this.cells.indexOf(cell_model);
            } else /* is_range */ {

                var start = this.cells.indexOf(cell_model),
                    end = last_selected_;

                select_range(Math.min(start, end), Math.max(start, end));
            }

            RCloud.UI.selection_bar.update(this.cells);
        },
        update_cell: function(cell_model) {
            return [cell_model.change_object()];
        },
        update_asset: function(asset_model) {
            return [asset_model.change_object()];
        },
        reread_buffers: function() {
            // force views to update models
            var changed_cells_per_view = _.map(this.views, function(view) {
                return view.update_model();
            });
            if(changed_cells_per_view.length != 1)
                throw new Error("not expecting more than one notebook view");
            var contents = changed_cells_per_view[0];
            var changes = [];
            for (var i=0; i<contents.length; ++i)
                if (contents[i] !== null)
                    changes.push(this.cells[i].change_object());
            var asset_change = RCloud.UI.scratchpad.update_model();
            // too subtle here: update_model distinguishes between no change (null)
            // and change-to-empty.  we care about change-to-empty and let github
            // delete the asset but leave it on the screen until reload (as with cells)
            if (asset_change !== null) {
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
        update_files: function(files) {
            for(var i = 0; i<this.assets.length; ++i) {
                var ghfile = files[this.assets[i].filename()];
                // note this is where to get the asset raw_url if we need it again
                if (ghfile) this.assets[i].language(ghfile.language);
            }
            _.each(this.views, function(view) {
                view.update_urls();
            });
        },
        on_dirty: function() {
            _.each(this.dishers, function(disher) {
                disher.on_dirty();
            });
        },
        json: function() {
            return _.map(this.cells, function(cell_model) {
                return cell_model.json();
            });
        }
    };
};
