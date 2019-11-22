Notebook.create_html_view = function(model, root_div)
{
    var show_cell_numbers_;
    var autoscroll_notebook_output_;
    var cellarea_ = $('#rcloud-cellarea'), last_top_, STOP_DY = 10;
    function on_rearrange() {
        _.each(result.sub_views, function(view) {
            view.check_buttons();
        });
    }

    function init_cell_view(cell_view) {
        cell_view.set_readonly(model.read_only() || shell.is_view_mode());
        cell_view.set_show_cell_numbers(show_cell_numbers_);
        cell_view.set_autoscroll_notebook_output(autoscroll_notebook_output_);
    }

    var result = {
        model: model,
        sub_views: [],
        asset_sub_views: [],
        cell_appended: function(cell_model) {
            var cell_view = Notebook.Cell.create_html_view(cell_model);
            cell_model.views.push(cell_view);
            root_div.append(cell_view.div());
            this.sub_views.push(cell_view);
            init_cell_view(cell_view);
            on_rearrange();
            return cell_view;
        },
        asset_appended: function(asset_model, new_asset_index) {
            var asset_view = Notebook.Asset.create_html_view(asset_model);
            asset_model.views.push(asset_view);
            if(new_asset_index === undefined){
              $("#asset-list").append(asset_view.div());
              this.asset_sub_views.push(asset_view);
            } else {
              this.asset_sub_views.splice(new_asset_index, 0, asset_view);
              $('#asset-list').find('li:eq(' + new_asset_index + ')').after(asset_view.div());
            }
            on_rearrange();
            return asset_view;
        },
        cell_inserted: function(cell_model, cell_index) {
            var cell_view = Notebook.Cell.create_html_view(cell_model);
            cell_model.views.push(cell_view);
            root_div.append(cell_view.div());
            $(cell_view.div()).insertBefore(root_div.children('.notebook-cell')[cell_index]);
            this.sub_views.splice(cell_index, 0, cell_view);
            init_cell_view(cell_view);
            on_rearrange();
            return cell_view;
        },
        cell_removed: function(cell_model, cell_index) {
            _.each(cell_model.views, function(view) {
                view.self_removed();
            });
            this.sub_views.splice(cell_index, 1);
            on_rearrange();
        },
        asset_removed: function(asset_model, asset_index) {
            _.each(asset_model.views, function(view) {
                view.self_removed();
            });
            this.asset_sub_views.splice(asset_index, 1);
        },
        cell_moved: function(cell_model, pre_index, post_index) {
            this.sub_views.splice(pre_index, 1);
            this.sub_views.splice(post_index, 0, cell_model.views[0]);
            on_rearrange();
        },
        set_readonly: function(readonly) {
            _.each(this.sub_views, function(view) {
                view.set_readonly(readonly);
            });
            _.each(this.asset_sub_views, function(view) {
                view.set_readonly(readonly);
            });
        },
        set_show_cell_numbers: function(whether) {
            show_cell_numbers_ = whether;
            _.each(this.sub_views, function(view) {
                view.set_show_cell_numbers(whether);
            });
        },
        set_autoscroll_notebook_output: function(whether) {
            autoscroll_notebook_output_ = whether;
            _.each(this.sub_views, function(view) {
                view.set_autoscroll_notebook_output(whether);
            });
            
        },
        update_urls: function() {
            RCloud.UI.scratchpad.update_asset_url();
        },
        update_model: function() {
            return _.map(this.sub_views, function(cell_view) {
                return cell_view.update_model();
            });
        },
        reformat: function() {
            _.each(this.sub_views, function(view) {
                view.reformat();
            });
        },
        on_scroll: function(event) {
          if(autoscroll_notebook_output_) {
              _.each(this.sub_views, function(view) {
                view.on_scroll(event);
              });
          }
        },
        auto_activate: function(event) {
            const top = cellarea_.scrollTop();
            if(last_top_ !== undefined && Math.abs(top - last_top_) < STOP_DY) {
                model.cells.map(cm => cm.views[0])
                    .filter(cv => cv.is_in_view())
                    .forEach(cv => cv.edit_source(true, null, false));
            }
            last_top_ = top;
        },
        load_options() {
            return rcloud.config.get_user_option('autoactivate-cells').then(function(auto) {
                if(auto===null || auto) { // default true
                    RCloud.UI.cell_commands.remove('edit');
                    window.setInterval(result.auto_activate, 100);
                }
            });
        }
    };
    model.views.push(result);
    cellarea_.on('scroll', function(event) { result.on_scroll(event); });
    return result;
};
