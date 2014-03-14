Notebook.Cell.create_model = function(content, language)
{
    var id_ = -1;
    var result = Notebook.Buffer.create_model(content);
    var base_change_object = result.change_object;

    _.extend(result, {
        language: function(new_language) {
            if (!_.isUndefined(new_language)) {
                if(language != new_language) {
                    language = new_language;
                    this.notify_views(function(view) {
                        view.language_updated();
                    });
                    return language;
                }
                else return null;
            }
            return language;
        },
        id: function(new_id) {
            if (!_.isUndefined(new_id) && new_id != id_) {
                id_ = new_id;
                this.notify_views(function(view) {
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
            obj.id = obj.id || this.id();
            var change = base_change_object.call(this, obj);

            change.language = obj.language || this.language();
            change.name = function(id) {
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
            };
            return change;
        }
    });
    return result;
};
