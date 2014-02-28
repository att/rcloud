Notebook.Asset.create_model = function(content, filename)
{
    var cursor_position;
    var active = false;
    var result = {
        views: [], // sub list for pubsub
        parent_model: null,
        active: function(new_active) {
            if (!_.isUndefined(new_active)) {
                if(active !== new_active) {
                    active = new_active;
                    notify_views(function(view) {
                        view.active_updated();
                    });
                    return active;
                } else {
                    return null;
                }
            }
            return active;
        },
        cursor_position: function(new_cursor_position) {
            if (!_.isUndefined(new_cursor_position))
                cursor_position = new_cursor_position;
            return cursor_position;
        },
        language: function() {
            var extension = filename.match(/\.([^.]+)$/);
            if (!extension)
                throw new Error("extension does not exist");
            extension = extension[1];
            return extension;
        },
        filename: function(new_filename) {
            if (!_.isUndefined(new_filename)) {
                if(filename != new_filename) {
                    filename = new_filename;
                    notify_views(function(view) {
                        view.filename_updated();
                    });
                    return filename;
                }
                else return null;
            }
            return filename;
        },
        content: function(new_content) {
            if (!_.isUndefined(new_content)) {
                if(content != new_content) {
                    content = new_content;
                    notify_views(function(view) {
                        view.content_updated();
                    });
                    return content;
                }
                else return null;
            }
            return content;
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
            // unfortunately, yet another workaround because github
            // won't take blank files.  would prefer to make changes
            // a high-level description but i don't see it yet.
            var change = {
                id: obj.id || this.filename(),
                name: function() {
                    return this.id;
                },
                erase: obj.erase,
                rename: obj.rename
            };
            if(content === "")
                change.erase = true;
            else
                change.content = obj.content || this.content();
            return change;
        }
    };
    function notify_views(f) {
        _.each(result.views, function(view) {
            f(view);
        });
    }
    return result;
};
