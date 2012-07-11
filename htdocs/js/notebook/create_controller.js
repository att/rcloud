Notebook.create_controller = function(model)
{
    var result = {
        append_cell: function(content, type) {
            var cell_model = Notebook.Cell.create_model(content, type);
            var cell_controller = Notebook.Cell.create_controller(cell_model);
            cell_model.controller = cell_controller;
            model.append_cell(cell_model);
            return cell_controller;
        },
        insert_cell: function(content, type, index) {
            var cell_model = Notebook.Cell.create_model(content, type);
            var cell_controller = Notebook.Cell.create_controller(cell_model);
            cell_model.controller = cell_controller;
            model.insert_cell(cell_model, index);
            return cell_controller;
        },
        remove_cell: function(cell_model) {
            model.remove_cell(cell_model);
        },
        clear: function() {
            model.clear();
        },
        load_from_file: function(user, filename, k) {
            var that = this;
            rcloud.load_user_file(user, filename, function(contents) {
                var json_contents = JSON.parse(contents.value.join("\n"));
                that.clear();
                _.each(json_contents, function (json_cell) {
                    var cell_model = that.append_cell(
                        json_cell.content, json_cell.type);
                });
                k();
            });
        },
        save_file: function(user, filename, k) {
            var that = this;
            var json_rep = JSON.stringify(model.json());
            rcloud.save_to_user_file(user, filename, json_rep, function() {
                k();
            });
        },
        run_all: function() {
            _.each(model.notebook, function(cell_model) {
                console.log(cell_model);
                cell_model.controller.execute();
            });
        }
    };
    model.controller = result;
    return result;
};
