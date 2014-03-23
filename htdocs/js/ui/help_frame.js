RCloud.UI.help_frame = {
    init: function() {
        // i can't be bothered to figure out why the iframe causes onload to be triggered early
        // if this code is directly in main.html
        $("#help-parent").append('<iframe id="help-frame" width="100%" height="100%" frameborder="0" />');
    }
};
