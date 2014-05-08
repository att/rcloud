Notebook.Asset.create_model = function(content, filename)
{
    var cursor_position_;
    var active_ = false;
    var result = Notebook.Buffer.create_model(content);
    var base_change_object = result.change_object;

    _.extend(result, {
        active: function(new_active) {
            if (!_.isUndefined(new_active)) {
                if(active_ !== new_active) {
                    active_ = new_active;
                    this.notify_views(function(view) {
                        view.active_updated();
                    });
                    return active_;
                } else {
                    return null;
                }
            }
            return active_;
        },
        cursor_position: function(new_cursor_position) {
            if (!_.isUndefined(new_cursor_position))
                cursor_position_ = new_cursor_position;
            return cursor_position_;
        },
        filename: function(new_filename) {
            if (!_.isUndefined(new_filename)) {
                if(filename != new_filename) {
                    filename = new_filename;
                    this.notify_views(function(view) {
                        view.filename_updated();
                    });
                    return filename;
                }
                else return null;
            }
            return filename;
        },
        json: function() {
            return {
                content: content,
                filename: this.filename(),
                language: this.language()
            };
        },
        change_object: function(obj) {
            obj = obj || {};
            obj.filename = obj.filename || this.filename();
            return base_change_object.call(this, obj);
        }
    });
    return result;
};
