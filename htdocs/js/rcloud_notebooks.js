// manages communication with RCloud server about notebook lists
// and caches info about known notebooks

RCloud.notebooks = function() {
    var notebook_entries_ = null,
        num_stars_ = null,
        current_ = null;

    return {
        current_notebook: function(current) {
            if(current !== undefined) {
                RCloud.config.set_current_notebook(current);
                current_ = current;
            }
            return current_;
        },
        notebook_entry: function(id, entry) {
            if(entry !== undefined) {
                RCloud.config.add_notebook(id, entry);
                return Promise.resolve();
            }
            else if(notebook_entries_[id] !== undefined)
                return Promise.resolve(notebook_entries_[id]);
            else RCloud.config.get_
        },
        notebook_stars: function(id) {
            
        },
    };
}();

