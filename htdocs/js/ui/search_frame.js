RCloud.UI.search_frame = {
    init: function() {
        if(!rcloud.search)
            $("#search-wrapper").text("Search engine not enabled on server");
        $("#search-form").submit(function(e) {
            e.preventDefault();
            e.stopPropagation();
            var qry = $('#input-text-search').val();
            $('#input-text-search').focus();
            RCloud.UI.search.exec(qry);
            return false;
        });
    }
};
