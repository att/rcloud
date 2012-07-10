Notebook.create_model = function()
{
    return {
        notebook: [],
        views: [], // sub list for pubsub
        append_cell: function(cell_model) {
            cell_model.parent_model = this;
            this.notebook.push(cell_model);
            _.each(this.views, function(view) {
                view.cell_appended(cell_model);
            });
        },
        insert_cell: function(cell_model, index) {
            cell_model.parent_model = this;
            this.notebook.splice(index, 0, cell_model);
            _.each(this.views, function(view) {
                view.cell_inserted(cell_model, index);
            });
        },
        json: function() {
            return _.map(this.notebook, function(cell_model) {
                return cell_model.json();
            });
        },
        remove_cell: function(cell_model) {
            var cell_index = this.notebook.indexOf(cell_model);
            if (cell_index === -1) {
                throw "cell_model not in notebook model?!";
            }
            _.each(this.views, function(view) {
                view.cell_removed(cell_model, cell_index);
            });
            this.notebook.splice(cell_index, 1);
            // delete this.notebook[cell_index];
        }
    };
};
