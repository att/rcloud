RCloud.UI.image_manager = (function() {
    var result = {
        update: function(url, dims, device, page, k) {
            var attrs = [];
            var id = device + "-" + page;
            attrs.push("id='" + id + "'");

            $('#' + id).remove(); // still wrong
            if(dims) {
                if(dims[0])
                    attrs.push("width=" + dims[0]);
                if(dims[1])
                    attrs.push("height=" + dims[1]);
            }
            attrs.push("src='" + url + "'");
            k($("<img " + attrs.join(' ') + ">\n"));
        }
    };
    return result;
})();
