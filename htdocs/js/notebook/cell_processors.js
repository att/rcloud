Notebook.Cell.preprocessors = RCloud.extension.create();
Notebook.Cell.postprocessors = RCloud.extension.create();

Notebook.Cell.postprocessors.add({
    device_pixel_ratio: {
        sort: 1000,
        disable: true, // needs to move into RCloud.UI.image_manager
        process: function(div) {
            // we use the cached version of DPR instead of getting window.devicePixelRatio
            // because it might have changed (by moving the user agent window across monitors)
            // this might cause images that are higher-res than necessary or blurry.
            // Since using window.devicePixelRatio might cause images
            // that are too large or too small, the tradeoff is worth it.
            var dpr = rcloud.display.get_device_pixel_ratio();
            // fix image width so that retina displays are set correctly
            div.find("img")
                .each(function(i, img) {
                    function update() { img.style.width = img.width / dpr; }
                    if (img.width === 0) {
                        $(img).on("load", update);
                    } else {
                        update();
                    }
                });
        }
    },
    deferred_results: {
        sort: 2000,
        process: function(div) {
            var uuid = rcloud.deferred_knitr_uuid;
            div.find("span.deferred-result")
                .each(function() {
                    var that = this;
                    var uuids = this.textContent.split("|");
                    // FIXME monstrous hack: we rebuild the ocap from the string to
                    // call it via rserve-js
                    var ocap = [uuids[1]];
                    ocap.r_attributes = { "class": "OCref" };
                    var f = rclient._rserve.wrap_ocap(ocap);

                    f(function(err, future) {
                        var data;
                        if (RCloud.is_exception(future)) {
                            data = RCloud.exception_message(future);
                            $(that).replaceWith(function() {
                                return ui_utils.string_error(data);
                            });
                        } else {
                            data = future();
                            $(that).replaceWith(function() {
                                return data;
                            });
                        }
                    });
                });
        }
    },
    mathjax: {
        sort: 3000,
        process: function(div) {
            // typeset the math
            // why does passing the div as last arg not work, as documented here?
            // http://docs.mathjax.org/en/latest/typeset.html
            if (!_.isUndefined(MathJax))
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        }
    },
    shade_pre_r: {
        sort: 4000,
        process: function(div) {
            div.find("pre code")
                .filter(function(i, e) {
                    // things which have defined classes coming from knitr and markdown
                    // we might look in RCloud.language here?
                    return e.classList.length > 0;
                }).parent().toggleClass('r', true);
        }
    },
    hide_source: {
        sort: 5000,
        process: function(div) {
            // this is kinda bad
            if (!shell.notebook.controller._r_source_visible) {
                Notebook.hide_r_source(div);
            }
        }
    },
    click_markdown_code: {
        sort: 6000,
        process: function(div, view) {
            view.click_to_edit(div.find('pre.r'), true);
        }
    }
});

Notebook.Cell.preprocessors.add({
    quote_deferred_results: {
        sort: 1000,
        process: (function() {
            var deferred_result_uuid_, deferred_regexp_, deferred_replacement_;
            function make_deferred_regexp() {
                deferred_result_uuid_ = rcloud.deferred_knitr_uuid;
                deferred_regexp_ = new RegExp(deferred_result_uuid_ + '\\|[@a-zA-Z_0-9.]*', 'g');
                deferred_replacement_ = '<span class="deferred-result">$&</span>';
            }
            return function(r) {
                if(!deferred_result_uuid_ != rcloud.deferred_knitr_uuid)
                    make_deferred_regexp();
                return r.replace(deferred_regexp_, deferred_replacement_);
            };
        })()
    }
});

