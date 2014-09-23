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

    }
};

