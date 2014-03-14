Notebook.Buffer.create_model = function(content) {
    var result = {
        views: [], // sub list for pubsub
        parent_model: null,

        content: function(new_content) {
            if (!_.isUndefined(new_content)) {
                if(content != new_content) {
                    content = new_content;
                    this.notify_views(function(view) {
                        view.content_updated();
                    });
                    return content;
                }
                else return null;
            }
            return content;
        },
        change_object: function(obj) {
            var change = {
                id: obj.id,
                name: function(id) {
                    return id;
                },
                erase: obj.erase,
                rename: obj.rename
            };
            if(content === "")
                change.erase = true;
            else
                change.content = obj.content || this.content();
            return change;
        },
        notify_views: function(f) {
            _.each(this.views, function(view) {
                f(view);
            });
        }
    };
    return result;
};

