RCloud.UI.upload_files = (function() {
    function upload_opts(opts) {
        if(_.isBoolean(opts))
            opts = {force: opts};
        else if(!_.isObject(opts))
            throw new Error("didn't understand options " + opts);
        opts = $.extend({
            force: false,
            $file: $("#file"),
            $progress: $(".progress"),
            $progress_bar: $("#progress-bar")
        }, opts);
        if(!opts.files)
            opts.files = opts.$file[0].files;
        return opts;
    }

    // we could easily continue optionifying this
    function results_append($div) {
        $("#file-upload-results").append($div);
        $("#collapse-file-upload").trigger("size-changed");
        ui_utils.on_next_tick(function() {
            ui_utils.scroll_to_after($("#file-upload-results"));
        });
    }

    function result_success(message) {
        results_append(
            bootstrap_utils.alert({
                "class": 'alert-info',
                text: message,
                on_close: function() {
                    $(".progress").hide();
                    $("#collapse-file-upload").trigger("size-changed");
                }
            }));
    }

    function asset_react(options) {
        return {
            add: function(file) {
                result_success("Asset " + file + " added.");
            },
            replace: function(file) {
                result_success("Asset " + file + " replaced.");
            }
        };
    }

    function file_react(options) {
        return {
            start: function(filename) {
                options.$progress.show();
                options.$progress_bar.css("width", "0%");
                options.$progress_bar.attr("aria-valuenow", "0");
            },
            progress: function(read, size) {
                options.$progress_bar.attr("aria-valuenow", ~~(100 * (read / size)));
                options.$progress_bar.css("width", (100 * (read / size)) + "%");
            },
            done: function(filename) {
                result_success("File " + filename + " uploaded.");
            }
        };
    }

    function file_replace_react(options) {
        return $.extend(file_react(options), {
            done: function(file) {
                result_success("File " + file + " replaced.");
            }
        });
    }

    function upload_files(to_notebook, options) {
        options = upload_opts(options || {});
        RCloud.UI.right_panel.collapse($("#collapse-file-upload"), false);

        var file_error_handler = Promise.promisify(function(err, options, callback) {
            var overwrite_click = function() {
                options.force = true;
                rcloud.upload_files(options, file_replace_react(options))
                    .then(function(value) {
                        callback(null, value);
                    })
                    .catch(function(err) {
                        results_append(
                            bootstrap_utils.alert({
                                "class": 'alert-danger',
                                text: err
                            })
                        );
                        callback(err, null);
                    });
                alert_box.remove();
            };
            var message = err.message;
            var alert_element = $("<div></div>");
            var p, done = true;
            if(/exists/.test(message)) {
                p = $("<p>File exists. </p>");
                var overwrite = bootstrap_utils
                        .button({"class": 'btn-danger'})
                        .click(overwrite_click)
                        .text("Overwrite");
                p.append(overwrite);
                done = false;
            }
            else if(message==="empty") {
                p = $("<p>File is empty.</p>");
            }
            else if(message==="badname") {
                p = $("<p>Filename not allowed.</p>");
            }
            else {
                p = $("<p>(unexpected) " + message + "</p>");
            }
            alert_element.append(p);
            var alert_box = bootstrap_utils.alert({'class': 'alert-danger', html: alert_element});
            results_append(alert_box);
            if(done)
                callback(null, undefined);
        });

        var promise = to_notebook ?
                rcloud.upload_assets(options, asset_react(options)) :
                rcloud.upload_files(options, file_react(options));

        // U won't want to wait on this promise because it's after all overwrites etc.
        return promise.catch(function(err) {
            return file_error_handler(err, options);
        }).then(function() {
            window.setTimeout(function() {
                $(".progress").hide();
            }, 5000);
        });
    }

    return upload_files;
})();
