function notebook_tree_model(username, show_terse_dates) {
    this.username_ = username;
    this.show_terse_dates_ = show_terse_dates;
}

notebook_tree_model.prototype = function() {
    var username = function() {
        return this.username;
    }

    return {
        username: username
    };
}();