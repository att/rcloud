Notebook.create_controller = function(model)
{
    var result = {
        append_cell: function(content, type) {
            var cell_model = Notebook.Cell.create_model(content, type);
            var cell_controller = Notebook.Cell.create_controller(cell_model);
            cell_model.controller = cell_controller;
            model.append_cell(cell_model);
            return cell_controller;
        }, insert_cell: function(content, type, index) {
            var cell_model = Notebook.Cell.create_model(content, type);
            var cell_controller = Notebook.Cell.create_controller(cell_model);
            cell_model.controller = cell_controller;
            model.insert_cell(cell_model, index);
            return cell_controller;
        }, remove_cell: function(cell_model) {
            model.remove_cell(cell_model);
        }
    };
    model.controller = result;
    return result;
};
