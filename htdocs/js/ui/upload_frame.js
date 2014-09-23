RCloud.UI.upload_frame = {
    init: function() {
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

    },
    panel_sizer: function(el) {
        var padding = RCloud.UI.collapsible_column.default_padder(el);
        var height = 24 + $('#file-upload-controls').height() + $('#file-upload-results').height();
        return {height: height, padding: padding};
    }
};

