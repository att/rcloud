function notebook_tree_controller(model, view) {

    "use strict";

    this.model_ = model;
    this.view_ = view;
    this.show_terse_dates_ = false;
    this.notebook_open = new event(this);

    var controller_obj = this;

    this.view_.notebook_open.attach(function(sender, args) {
        controller_obj.notebook_open.notify(args);
    });
}

notebook_tree_controller.prototype = {
    
    set_current: function(current) {
        this.model_.set_current(current);
    },

    get_current: function() {
        return this.model_.get_current();
    },

    get_previous: function() {
        return this.model_.get_previous();
    },

    get_next: function() {
        return this.model_.get_next();
    },

    get_notebook_star_count: function(gistname) {
        return this.model_.get_notebook_star_count(gistname);
    },

    set_notebook_star_count: function(gistname, count) {
        this.model_.set_notebook_star_count(gistname, count);
    },

    notebook_star_count_exists: function(notebook_id) {
        return this.model_.notebook_star_count_exists(notebook_id);
    },

    is_notebook_starred_by_current_user: function(gistname) {
        return this.model_.is_notebook_starred_by_current_user(gistname);
    },

    get_notebook_info: function(gistname) {
        return this.model_.get_notebook_info(gistname);
    },

    set_notebook_info: function(gistname, value) {
        this.model_.set_notebook_info(gistname, value);
    },

    add_interest: function(user, gistname) {
        this.model_.add_interest(user, gistname);
    },

    get_my_star_count_by_friend: function(user) {
        return this.model_.get_my_star_count_by_friend(user);
    },

    user_is_friend: function(user) {
        return this.model_.user_is_friend(user);
    },

    remove_interest: function(user, gistname) {
        this.model_.remove_interest(user, gistname);
    },

    show_terse_dates: function(show_terse_dates) {
        this.show_terse_dates_ = show_terse_dates;
    },    

    set_visibility: function(gistname, visible) {
        return this.model_.set_visibility(gistname, visible);
    },

    load_everything: function() {
        return this.model_.load_everything();
    },

    highlight_notebooks: function(notebooks) {
        this.view_.highlight_notebooks(notebooks);
    },

    select_history_node: function(node) {
        this.select_node(node);
        $(node.element).find('.jqtree-element:eq(0)').trigger('click');
    },
    
    update_notebook_view: function(user, gistname, entry, selroot) {
        return this.model_.update_notebook_view(user, gistname, entry, selroot);
    },

    unstar_notebook_view: function(user, gistname, selroot) {
        this.model_.unstar_notebook_view(user, gistname, selroot);
    },

    update_notebook_from_gist: function(result, history, selroot) {
        return this.model_.update_notebook_from_gist(result, history, selroot);
    },

    toggle_folder_friendness: function(user) {
        this.model_.toggle_folder_friendness(user);
    },

    show_history: function(node, opts) {
        this.model_.update_history(node, opts);
    },

    // way too subtle. shamelessly copying OSX Finder behavior here (because they're right).
    find_next_copy_name: function (username, description) {
        return this.model_.find_next_copy_name(username, description);
    }
};
