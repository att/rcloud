Notebook.Asset.create_model = function(content, filename)
{
    var result = {
        views: [], // sub list for pubsub
        parent_model: null,
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
        }
    };
    function notify_views(f) {
        _.each(result.views, function(view) {
            f(view);
        });
    }
    return result;
};
