Notebook.create_controller = function(model)
{
    return {
        append_cell: function(content, type) {
            var cell_model = Notebook.Cell.create_model(content, type);
            var cell_controller = Notebook.Cell.create_controller(cell_model);
            cell_model.controller = cell_controller;
            model.append_cell(cell_model);
            return cell_controller;
        }
    };
};
