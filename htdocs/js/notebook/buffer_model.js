Notebook.Buffer.create_model = function(content) {
    // by default, consider this a new cell
    var checkpoint_ = "";

    function not_empty(text) {
        return ! /^\s*$/.test(text);
    }

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
            if(obj.content)
                throw new Error("content must come from the object");
            var change = {
                id: obj.id,
                name: function(id) {
                    return id;
                },
                erase: obj.erase,
                rename: obj.rename
            };
            // github treats any content which is only whitespace or empty
            // as an erase.  so we have to pretend those objects don't exist
            if(not_empty(content)) {
                if(content != checkpoint_)
                    change.content = content;
                // else no change
            }
            else if(not_empty(checkpoint_))
                change.erase = true;
            // else no change

            // every time we get a change_object it's in order to send it to
            // github.  so we can assume that the cell has been checkpointed
            // whenever we create a change object.
            checkpoint_ = content;
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

