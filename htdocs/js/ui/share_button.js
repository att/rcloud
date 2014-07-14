RCloud.UI.share_button = {
    set_link: function(notebook) {
        var link = window.location.protocol + '//' + window.location.host +
            '/view.R/' + shell.notebook.model.user() +
            '/' + notebook.description;
        // var link = window.location.protocol + '//' + window.location.host + '/view.html?notebook=' + shell.gistname();
        var v = shell.version();
        if(v)
            link += '&version='+v;

        $("#share-link").attr("href", link);
    }
};
