Notebook.create_model = function()
{
    var read_only = false;

    function last_id(notebook) {
        if(notebook.length)
            return notebook[notebook.length-1].id;
        else
            return 0;
    }

    function build_cell_change(id, content, language) {
        // unfortunately, yet another workaround because github
        // won't take blank files.  would prefer to make changes
        // a high-level description but i don't see it yet.
        var change = {id: id,
                      language: language};
        if(content === "")
            change.erase = true;
        else
            change.content = content;
        return change;
    }

    /* note, the code below is a little more sophisticated than it needs to be:
       allows multiple inserts or removes but currently n is hardcoded as 1.  */
    return {
        notebook: [],
        views: [], // sub list for pubsub
        clear: function() {
            return this.remove_cell(null,last_id(this.notebook));
        },
        append_cell: function(cell_model, id) {
            cell_model.parent_model = this;
            var changes = [];
            var n = 1;
            id = id || 1;
            id = Math.max(id, last_id(this.notebook)+1);
            while(n) {
                changes.push({id: id, content: cell_model.content(), language: cell_model.language()});
                cell_model.id = id;
                this.notebook.push(cell_model);
                _.each(this.views, function(view) {
                    view.cell_appended(cell_model);
                });
                ++id;
                --n;
            }
            return changes;
        },
        insert_cell: function(cell_model, id) {
            var that = this;
            cell_model.parent_model = this;
            var changes = [];
            var n = 1, x = 0;
            while(x<this.notebook.length && this.notebook[x].id < id) ++x;
            // check if ids can go above rather than shifting everything else down
            if(x<this.notebook.length && id+n > this.notebook[x].id) {
                var prev = x>0 ? this.notebook[x-1].id : 0;
                id = Math.max(this.notebook[x].id-n, prev+1);
            }
            for(var j=0; j<n; ++j) {
                changes.push({id: id+j, content: cell_model.content(), language: cell_model.language()});
                cell_model.id = id+j;
                this.notebook.splice(x, 0, cell_model);
                _.each(this.views, function(view) {
                    view.cell_inserted(that.notebook[x], x);
                });
                ++x;
            }
            while(x<this.notebook.length && n) {
                if(this.notebook[x].id > id) {
                    var gap = this.notebook[x].id - id;
                    n -= gap;
                    id += gap;
                }
                if(n<=0)
                    break;
                changes.push({id: this.notebook[x].id,
                              content: this.notebook[x].content(),
                              rename: this.notebook[x].id+n,
                              language: this.notebook[x].language()});
                this.notebook[x].id += n;
                ++x;
                ++id;
            }
            return changes;
        },
        remove_cell: function(cell_model, n) {
            var that = this;
            var cell_index, id;
            if(cell_model!=null) {
                cell_index = this.notebook.indexOf(cell_model);
                id = cell_model.id;
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
                if(this.notebook[x].id == id) {
                    _.each(this.views, function(view) {
                        view.cell_removed(that.notebook[x], x);
                    });
                    changes.push({id: id, erase: 1, language: that.notebook[x].language()});
                    this.notebook.splice(x, 1);
                }
                ++id;
                --n;
            }
            return changes;
        },
        update_cell: function(cell_model) {
            return [build_cell_change(cell_model.id, cell_model.content(), cell_model.language())];
        },
        reread_cells: function() {
            var that = this;
            var changed_cells_per_view = _.map(this.views, function(view) {
                return view.update_model();
            });
            if(changed_cells_per_view.length != 1)
                throw "not expecting more than one notebook view";
            return _.reduce(changed_cells_per_view[0],
                            function(changes, content, index) {
                                if(content !== null)
                                    changes.push(build_cell_change(that.notebook[index].id,
                                                                   content,
                                                                   that.notebook[index].language()));
                                return changes;
                            },
                            []);
        },
        read_only: function(readonly) {
            if(!_.isUndefined(readonly)) {
                read_only = readonly;
                _.each(this.views, function(view) {
                    view.set_readonly(read_only);
                });
            }
            return read_only;
        },
        json: function() {
            return _.map(this.notebook, function(cell_model) {
                return cell_model.json();
            });
        }
    };
};
