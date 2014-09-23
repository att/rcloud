RCloud.UI.load_options = function() {
    return RCloud.UI.load_panels().then(function() {
        RCloud.UI.left_panel.init();
        RCloud.UI.middle_column.init();
        RCloud.UI.right_panel.init();

        RCloud.UI.session_pane.init();
        RCloud.UI.scratchpad.init();
        RCloud.UI.command_prompt.init();
        RCloud.UI.help_frame.init();

        if(!rcloud.search)
            $("#search-wrapper").text("Search engine not enabled on server");

        $("#file").change(function() {
            $("#progress-bar").css("width", "0%");
        });

        $("#upload-submit").click(function() {
            if($("#file")[0].files.length===0)
                return;
            var to_notebook = ($('#upload-to-notebook').is(':checked'));
            RCloud.UI.upload_with_alerts(to_notebook)
                .catch(function() {}); // we have special handling for upload errors
        });

        $("#collapse-search").data("panel-sizer", function(el) {
            var padding = RCloud.UI.collapsible_column.default_padder(el);
            var height = 24 + $('#search-summary').height() + $('#search-results').height();
            height += 30; // there is only so deep you can dig
            return {height: height, padding: padding};
        });

        $("#collapse-help").data("panel-sizer", function(el) {
            if($('#help-body').css('display') === 'none')
                return RCloud.UI.collapsible_column.default_sizer(el);
            else return {
                padding: RCloud.UI.collapsible_column.default_padder(el),
                height: 9000
            };
        });

        $("#collapse-assets").data("panel-sizer", function(el) {
            return {
                padding: RCloud.UI.collapsible_column.default_padder(el),
                height: 9000
            };
        });

        $("#collapse-file-upload").data("panel-sizer", function(el) {
            var padding = RCloud.UI.collapsible_column.default_padder(el);
            var height = 24 + $('#file-upload-controls').height() + $('#file-upload-results').height();
            //height += 30; // there is only so deep you can dig
            return {height: height, padding: padding};
        });

        $(".panel-collapse").collapse({toggle: false});

        var showOverlay_;
        //prevent drag in rest of the page except asset pane and enable overlay on asset pane
        $(document).on('dragstart dragenter dragover', function (e) {
            var dt = e.originalEvent.dataTransfer;
            if(!dt)
                return;
            if (dt.types !== null &&
                (dt.types.indexOf ?
                 dt.types.indexOf('Files') != -1 :
                 dt.types.contains('application/x-moz-file'))) {
                if (!shell.notebook.model.read_only()) {
                    e.stopPropagation();
                    e.preventDefault();
                    $('#asset-drop-overlay').css({'display': 'block'});
                    showOverlay_ = true;
                }
                else {
                    e.stopPropagation();
                    e.preventDefault();
                }
            }
        });
        $(document).on('drop dragleave', function (e) {
            e.stopPropagation();
            e.preventDefault();
            showOverlay_ = false;
            setTimeout(function() {
                if(!showOverlay_) {
                    $('#asset-drop-overlay').css({'display': 'none'});
                }
            }, 100);
        });
        //allow asset drag from local to asset pane and highlight overlay for drop area in asset pane
        $('#scratchpad-wrapper').bind({
            drop: function (e) {
                e = e.originalEvent || e;
                var files = (e.files || e.dataTransfer.files);
                var dt = e.dataTransfer;
                if(!shell.notebook.model.read_only()) {
                    RCloud.UI.upload_with_alerts(true, {files: files})
                        .catch(function() {}); // we have special handling for upload errors
                }
                $('#asset-drop-overlay').css({'display': 'none'});
            },
            "dragenter dragover": function(e) {
                var dt = e.originalEvent.dataTransfer;
                if(dt.items.length === 1 && !shell.notebook.model.read_only())
                    dt.dropEffect = 'copy';
            }
        });

        $("#search-form").submit(function(e) {
            e.preventDefault();
            e.stopPropagation();
            var qry = $('#input-text-search').val();
            $('#input-text-search').focus();
            RCloud.UI.search.exec(qry);
            return false;
        });
        $('#help-form').submit(function(e) {
            e.preventDefault();
            e.stopPropagation();
            var topic = $('#input-text-help').val();
            $('#input-text-help').blur();
            rcloud.help(topic);
            return false;
        });

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

        return Promise.all([RCloud.UI.left_panel.load_options(),
                           RCloud.UI.right_panel.load_options()]);
    }).then(function() {
    });
};
