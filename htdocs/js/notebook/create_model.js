Notebook.create_model = function()
{
    return {
        notebook: [],
        views: [], // sub list for pubsub
        append_cell: function(cell_model) {
            this.notebook.push(cell_model);
            _.each(this.views, function(view) {
                view.cell_appended(cell_model);
            });
        }
    };
};
