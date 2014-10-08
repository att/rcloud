RCloud.UI.comments_frame = {
    body: function() {
        return RCloud.UI.panel_loader.load_snippet('comments-snippet');
    },
    init: function() {
        var comment = $("#comment-entry-body");
        var count = 0;
        var scroll_height = "";
        $("#comment-submit").click(function() {
            if(!Notebook.empty_for_github(comment.val())) {
                editor.post_comment(comment.val());
                comment.height("41px");
            }
            return false;
        });

        comment.keydown(function (e) {
            if (e.keyCode == 13 && (e.ctrlKey || e.metaKey)) {
                if(!Notebook.empty_for_github(comment.val())) {
                    editor.post_comment(comment.val());
                    comment.height("41px");
                    count = 0;
                    scroll_height = "";
                }
                return false;
            }
            comment.bind('input', function() {
                if(count > 1 && scroll_height != comment[0].scrollHeight) {
                    comment.height((comment[0].scrollHeight)  + 'px');
                }
                count = count + 1;
                scroll_height = comment[0].scrollHeight;
                $("#comments-qux").animate({ scrollTop: $(document).height() }, "slow");
                return false;
            });
            return undefined;
        });
    }
};
