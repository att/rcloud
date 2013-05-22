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
        load_notebook: function(user, filename, k) {
            var that = this;
            rcloud.load_notebook(filename, function(contents) {
                that.clear();
                var gist = JSON.parse(contents);
                var parts = []; // could probably rely on alphabetic order too
                _.each(gist.files, function (file) {
                    var filename = file.filename;
                    if(/^part/.test(filename)) {
                        var number = parseInt(filename.slice(4).split('.')[0]);
                        if(number !== NaN)
                            parts[number] = [file.content, file.language];
                    }
                    // style..
                });
                for(var i in parts)
                    that.append_cell(parts[i][0], parts[i][1]);
                k();
            });
        },
        save_file: function(user, filename, k) {
            var that = this;
            var json_rep = JSON.stringify(model.json());
            rcloud.load_user_file(user, filename, function(old_contents) {
                old_contents = old_contents.join("\n");
                if (json_rep !== old_contents) {
                    //rcloud.save_to_user_file(user, filename, json_rep, function() {
                    //    k && k();
                    //});
                } else {
                    k && k();
                }
            });
        },
        run_all: function() {
            _.each(model.notebook, function(cell_model) {
                cell_model.controller.execute();
            });
        }
    };
    model.controller = result;
    return result;
};
