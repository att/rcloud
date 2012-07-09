Notebook.create_html_view = function(model, root_div)
{
    var result = {
        model: model,
        cell_appended: function(cell_model) {
            var cell = Notebook.Cell.create_html_view(cell_model);
            root_div.append(cell.div());
            return cell;
        }
    };
    model.views.push(result);
    return result;
};
