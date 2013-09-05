({
    handle: function(url, width, height, k) {
        var div = $("<iframe src='"
                    + url + "' width='"
                    + width + "' height='"
                    + height + "' frameborder=0></iframe>");
        k(function() { return div; } );
    }
})
