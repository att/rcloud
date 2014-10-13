RCloud.UI.share_button = {
    set_link: function(notebook,type) {
        var link = window.location.protocol + '//' + window.location.host + '/';
        var suffix ;
        if(type != "" && type!= undefined) {
            if(type === "notebook.R"){
                suffix= type + '/' + shell.gistname();
            }else {
                suffix= type + '?notebook=' + shell.gistname();
            }
        }else{
            suffix = 'view.html?notebook=' + shell.gistname();
        }
        link +=suffix;
        var v = shell.version();
        if(v)
            link += '&version='+v;
        $("#share-link").attr("href", link);
    }
};