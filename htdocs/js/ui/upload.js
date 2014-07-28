RCloud.UI.upload_files = (function() {
    function upload_ui_opts(opts) {
        if(_.isBoolean(opts))
            opts = {force: opts};
        else if(!_.isObject(opts))
            throw new Error("didn't understand options " + opts);
        opts = $.extend({
            $file: $("#file"),
            $progress: $(".progress"),
            $progress_bar: $("#progress-bar"),
            $upload_results: $("#file-upload-results").length ?
                $("#file-upload-results") :
                RCloud.UI.session_pane.error_dest(),
            $result_panel: $("#collapse-file-upload")
        }, opts);
        return opts;
    }

    function upload_files(to_notebook, options) {
        // we could easily continue optionifying this
        function results_append($div) {
            options.$upload_results.append($div);
            options.$result_panel.trigger("size-changed");
            ui_utils.on_next_tick(function() {
                ui_utils.scroll_to_after($("#file-upload-results"));
            });
        }

        function result_alert($content) {
            var alert_element = $("<div></div>");
            alert_element.append($content);
            var alert_box = bootstrap_utils.alert({'class': 'alert-danger', html: alert_element});
            results_append(alert_box);
            return alert_box;
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
                done: function(is_replace, filename) {
                    result_success("File " + filename + " " + (is_replace ? "replaced." : "uploaded."));
                },
                confirm_replace: Promise.promisify(function(filename, callback) {
                    var overwrite_click = function() {
                        alert_box.remove();
                        callback(null, true);
                    };
                    var p = $("<p>File " + filename + " exists. </p>");
                    var overwrite = bootstrap_utils
                            .button({"class": 'btn-danger'})
                            .click(overwrite_click)
                            .text("Overwrite");
                    p.append(overwrite);
                    var alert_box = result_alert(p);
                    $('button.close', alert_box).click(function() {
                        callback(null, false);
                    });
                })
            };
        }

        options = upload_ui_opts(options || {});
        RCloud.UI.right_panel.collapse($("#collapse-file-upload"), false);

        var file_error_handler = Promise.promisify(function(err, options, callback) {
            var message = err.message;
            var p, done = true;
            if(message==="empty") {
                p = $("<p>File is empty.</p>");
            }
            else if(message==="badname") {
                p = $("<p>Filename not allowed.</p>");
            }
            else {
                p = $("<p>(unexpected) " + message + "</p>");
                console.log(message, err.stack);
            }
            result_alert(p);
            if(done)
                callback(null, undefined);
        });


        var promise = to_notebook ?
                RCloud.upload_assets(options, asset_react(options)) :
                RCloud.upload_files(options, file_react(options));

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
