Notebook.Cell.create_model = function(content, language)
{
    var id_ = -1;
    var result = {
        views: [], // sub list for pubsub
        parent_model: null,
        language: function(new_language) {
            if (!_.isUndefined(new_language)) {
                if(language != new_language) {
                    language = new_language;
                    notify_views(function(view) {
                        view.language_updated();
                    });
                    return language;
                }
                else return null;
            }
            return language;
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
        id: function(new_id) {
            if (!_.isUndefined(new_id) && new_id != id_) {
                id_ = new_id;
                notify_views(function(view) {
                    view.id_updated();
                });
            }
            return id_;
        },
        json: function() {
            return {
                content: content,
                language: language
            };
        },
        change_object: function(obj) {
            obj = obj || {};
            // unfortunately, yet another workaround because github
            // won't take blank files.  would prefer to make changes
            // a high-level description but i don't see it yet.
            var change = {
                id: obj.id || this.id(),
                language: obj.language || this.language(),
                name: function(id) {
                    if (_.isString(id))
                        return id;
                    var ext;
                    switch(this.language) {
                    case 'R':
                        ext = 'R';
                        break;
                    case 'Markdown':
                        ext = 'md';
                        break;
                    default:
                        throw "Unknown language " + this.language;
                    }
                    return 'part' + this.id + '.' + ext;
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
