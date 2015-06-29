RCloud.UI.comments_frame = (function() {
    var is_foreign_ = false;
    function rebuild_comments(comments) {
        try {
            comments = JSON.parse(comments);
        } catch (e) {
            RCloud.UI.session_pane.post_error("populate comments: " + e.message);
            return;
        }
        var username = rcloud.username();
        var editable = function(d) {
            return d.user.login === username && !is_foreign_;
        };
        d3.select("#comment-count").text(String(comments.length));
        // no update logic, clearing/rebuilding is easier
        d3.select("#comments-container").selectAll("div").remove();
        var comment_div = d3.select("#comments-container")
                .selectAll("div")
                .data(comments)
                .enter()
                .append("div")
                .attr("class", "comment-container")
                .on("mouseover",function(d){
                    if(editable(d)) {
                        $('.comment-header-close', this).show();
                    }
                })
                .on("mouseout",function(d){
                    $('.comment-header-close', this).hide();
                })
                .attr("comment_id",function(d) { return d.id; });
        comment_div
            .append("div")
            .attr("class", "comment-header")
            .style({"max-width":"30%"})
            .text(function(d) { return d.user.login; });

        comment_div
            .append("div")
            .attr("class", "comment-body")
            .style({"max-width":"70%"})
            .append("div")
            .attr("class", "comment-body-wrapper")
            .append("div")
            .attr("class", "comment-body-text")
            .text(function(d) { return d.body; })
            .each(function(d){
                var comment_element = $(this);
                var edit_comment = function(v){
                    var comment_text = comment_element.html();
                    result.modify_comment(d.id, comment_text);
                };
                var editable_opts = {
                    change: edit_comment,
                    allow_multiline: true,
                    validate: function(name) { return !Notebook.empty_for_github(name); }
                };
                ui_utils.editable(comment_element, $.extend({allow_edit: editable(d),inactive_text: comment_element.text(),active_text: comment_element.text()},editable_opts));
            });
        var text_div = d3.selectAll(".comment-body-wrapper",this);
        text_div
            .append("i")
            .attr("class", "icon-remove comment-header-close")
            .style({"max-width":"5%"})
            .on("click", function (d, e) {
                if(editable(d))
                    result.delete_comment(d.id);
            });
        $('#collapse-comments').trigger('size-changed');
        ui_utils.on_next_tick(function() {
            ui_utils.scroll_to_after($("#comments-qux"));
        });
    }
    var result = {
        body: function() {
            return RCloud.UI.panel_loader.load_snippet('comments-snippet');
        },
        init: function() {
            var that = this;
            var comment = $("#comment-entry-body");
            var count = 0;
            var scroll_height = "";
            $("#comment-submit").click(function() {
                if(!Notebook.empty_for_github(comment.val())) {
                    that.post_comment(_.escape(comment.val()));
                    comment.height("41px");
                }
                return false;
            });

            comment.keydown(function (e) {
                if (e.keyCode == $.ui.keyCode.ENTER && (e.ctrlKey || e.metaKey)) {
                    if(!Notebook.empty_for_github(comment.val())) {
                        that.post_comment(_.escape(comment.val()));
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
        },
        set_foreign: function(is_foreign) {
            if(is_foreign) {
                $('#comment-entry').hide();
                $('#comments-not-allowed').show();
            } else {
                $('#comment-entry').show();
                $('#comments-not-allowed').hide();
            }
            is_foreign_ = is_foreign;
        },
        display_comments: function() {
            return rcloud.get_all_comments(shell.gistname())
                .then(function(comments) {
                    rebuild_comments(comments);
                });
        },
        post_comment: function(comment) {
            comment = JSON.stringify({"body":comment});
            return rcloud.post_comment(shell.gistname(), comment)
                .then(this.display_comments.bind(this))
                .then(function() {
                    $('#comment-entry-body').val('');
                });
        },
        modify_comment: function (cid,comment) {
            var that = this;
            comment = JSON.stringify({
                "body": comment
            });
            return rcloud.modify_comment(shell.gistname(), cid, comment)
                .then(this.display_comments.bind(this));
        },
        delete_comment: function (cid) {
            return rcloud.delete_comment(shell.gistname(), cid)
                .then(this.display_comments.bind(this));
        }
    };
    return result;
})();

