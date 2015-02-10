(function() {

// from https://github.com/ebidel/filer.js/blob/master/src/filer.js
/**
 * Creates and returns a blob from a data URL (either base64 encoded or not).
 *
 * @param {string} dataURL The data URL to convert.
 * @return {Blob} A blob representing the array buffer data.
 */
function dataURLToBlob(dataURL) {
    var BASE64_MARKER = ';base64,';
    var parts, contentType, raw;
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        parts = dataURL.split(',');
        contentType = parts[0].split(':')[1];
        raw = decodeURIComponent(parts[1]);

        return new Blob([raw], {type: contentType});
    }

    parts = dataURL.split(BASE64_MARKER);
    contentType = parts[0].split(':')[1];
    raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
}

RCloud.UI.image_manager = (function() {
    var images_ = {};
    var formats_ = RCloud.extension.create();
    function create_image(id, url, dims, device, page) {
        var div_, img_, dims_;
        function img_tag() {
            var attrs = [];
            attrs.push("id='" + id + "'");

            attrs.push("src='" + url + "'");
            return $("<img " + attrs.join(' ') + ">\n");
        }
        function save_as(fmt) {
            var options = {type: fmt};
            if(dims_)
                options.dim = dims_;
            rcloud.plots.render(device, page, options)
                .then(function(data) {
                    saveAs(dataURLToBlob(data.url), id + '.' + fmt);
                });
        }
        function resize_stop(event, ui) {
            dims_ = [ui.size.width, ui.size.height];
            rcloud.plots.render(device, page, {dim: dims_})
                .then(function(data) {
                    result.update(data.url);
                });
        }
        function save_button() {
            var save_dropdown = $('<div class="dropdown"></div>');
            // i couldn't figure out how to get fa_button('icon-save', 'save image', 'btn dropdown-toggle')
            // to open a dropdown
            var save_button = $('<span class="dropdown-toggle fontawesome-button" type="button" data-toggle="dropdown" aria-expanded="true"></span>');
            save_button.append($('<i class="icon-save"></i>'));
            var save_menu = $('<ul role="menu" class="dropdown-menu plot-save-formats"></ul>');
            _.pluck(formats_.entries('all'), 'key').forEach(function(fmt) {
                var link = $('<a role="menuitem" href="#">' + fmt + '</a>');
                link.click(function() {
                    save_as(fmt);
                });
                var li = $('<li role="presentation"></li>').append(link);
                save_menu.append(li);
            });
            var opts = {
                title: 'save image',
                delay: { show: 250, hide: 0 }
            };
            opts.container = 'body';
            save_button.tooltip(opts);
            save_dropdown.append(save_button, save_menu);
            return save_dropdown;
        }

        function add_controls($image) {
            var div = $('<div class="live-plot"></div>');
            div.append($image);
            var image_commands = $('<div class="live-plot-commands"></div>');
            image_commands.append(save_button());
            image_commands.hide();
            $image.add(image_commands).hover(function() {
                image_commands.show();
            }, function() {
                image_commands.hide();
            });
            div.append(image_commands);
            if(dims) {
                if(dims[0])
                    div.css('width', dims[0]);
                if(dims[1])
                    div.css('height', dims[1]);
                $image.css({width: '100%', height: '100%'});
                dims_ = dims;
            }


            div.resizable({
                autoHide: true,
                aspectRatio: true,
                stop: resize_stop
            });
            return div;
        }
        img_ = img_tag();
        div_ = add_controls(img_);

        var result = {
            div: function() {
                return div_;
            },
            update: function(url) {
                img_.attr('src', url);
            }
        };
        return result;
    }
    var result = {
        update: function(url, dims, device, page) {
            var id = device + "-" + page;
            var image;
            if(images_[id]) {
                image = images_[id];
                image.update(url);
            }
            else {
                image = create_image(id, url, dims, device, page);
                images_[id] = image;
            }
            return image;
        },
        formats: formats_
    };
    return result;
})();

})();
