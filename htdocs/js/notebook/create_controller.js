Notebook.create_controller = function(model)
{
    return {
        append_cell: function(content, type) {
            var cell_model = Notebook.Cell.create_model(content, type);
            return model.append_cell(cell_model);
        }
    };
};
