RCloud.UI.share_button = {
    set_link: function(notebook, type) {
        var link = window.location.protocol + '//' + window.location.host + '/';
        var suffix, query_started = true;
        switch(type) {
        case 'notebook.R':
            suffix = type + '/' + shell.gistname();
            query_started = false;
            break;
        case 'mini.html':
            suffix = type + '?notebook=' + shell.gistname();
            break;
        case 'view.html':
        default:
            suffix = 'view.html?notebook=' + shell.gistname();
        }
        link += suffix;
        var v = shell.version();
        if(v)
            link += query_started?'&':'?' + 'version=' + v;
        $("#share-link").attr("href", link);
    }
};
