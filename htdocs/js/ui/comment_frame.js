RCloud.UI.comment_frame = {
    init: function() {
        $("#comment-submit").click(function() {
            if(!Notebook.empty_for_github($("#comment-entry-body").val())) {
                editor.post_comment($("#comment-entry-body").val());
            }
            return false;
        });

        $("#comment-entry-body").keydown(function (e) {
            if ((e.keyCode == 10 || e.keyCode == 13 || e.keyCode == 115 || e.keyCode == 19) &&
                (e.ctrlKey || e.metaKey)) {
                if(!Notebook.empty_for_github($("#comment-entry-body").val())) {
                    editor.post_comment($("#comment-entry-body").val());
                }
                return false;
            }
            return undefined;
        });
    }
};
