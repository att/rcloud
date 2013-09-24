RClient = {
    create: function(opts) {
        function on_connect() {
            if (!rserve.ocap_mode) {
                result.post_error(result.disconnection_error("Expected an object-capability Rserve. Shutting Down!"));
                shutdown();
                return;
            }

            // the rcloud ocap-0 performs the login authentication dance
            // success is indicated by the rest of the capabilities being sent
            rserve.ocap([token, execToken], function(ocaps) {
                if (ocaps !== null) {
                    result.running = true;
                    opts.on_connect && opts.on_connect.call(result, ocaps);
                } else {
                    result.post_error(result.disconnection_error("Login failed. Shutting down!"));
                    shutdown();
                }
            });
        }

        // this might be called multiple times; some conditions result
        // in on_error and on_close both being called.
        function shutdown() {
            $("#input-div").hide();
            if (!rserve.closed)
                rserve.close();
        }

        function on_error(msg, status_code) {
            result.post_error(result.disconnection_error(msg));
            shutdown();
        }

        function on_close(msg) {
            result.post_error(result.disconnection_error("Socket was closed. Goodbye!"));
            shutdown();
        };

        var token = $.cookies.get().token;  // document access token
        var execToken = $.cookies.get().execToken; // execution token (if enabled)
        var rserve = Rserve.create({
            host: opts.host,
            on_connect: on_connect,
            on_error: on_error,
            on_close: on_close,
            on_data: opts.on_data
        });

        var result;

        result = {
            _rserve: rserve,
            running: false,
           
            //////////////////////////////////////////////////////////////////
            // FIXME: all of this should move out of rclient and into
            // the notebook objects.

            string_error: function(msg) {
                return $("<div class='alert alert-danger'></div>").text(msg);
            },

            disconnection_error: function(msg) {
                var result = $("<div class='alert alert-danger'></div>");
                result.append($("<span></span>").text(msg));
                var button = $("<button type='button' class='close'>Reconnect</button>");
                result.append(button);
                button.click(function() {
                    window.location = 
                        (window.location.protocol + 
                         '//' + window.location.host + 
                         '/login.R?redirect=' + 
                         encodeURIComponent(window.location.pathname + window.location.search));
                });
                return result;
            },

            post_error: function (msg) {
                if (typeof msg === 'string')
                    msg = this.string_error(msg);
                if (typeof msg !== 'object')
                    throw new Error("post_error expects a string or a jquery div");
                // var d = $("<div class='alert alert-danger'></div>").text(msg);
                $("#output").append(msg);
                window.scrollTo(0, document.body.scrollHeight);
            },

            post_response: function (msg) {
                var d = $("<pre></pre>").html(msg);
                $("#output").append(d);
                window.scrollTo(0, document.body.scrollHeight);
            }
        };
        return result;
    }
};
RCloud = {};

RCloud.is_exception = function(v) {
    return _.isArray(v) && v.r_attributes && v.r_attributes['class'] === 'try-error';
};

RCloud.exception_message = function(v) {
    if (!RCloud.is_exception(v))
        throw new Error("Not an R exception value");
    return v[0];
};

RCloud.create = function(rcloud_ocaps) {
    function json_k(k) {
        return function(result) {
            k && k(JSON.parse(result));
        };
    }

    function rcloud_github_handler(command, k) {
        return function(result) {
            if(result.ok)
                k && k(result.content);
            else {
                var message = _.isObject(result) && 'ok' in result
                    ? result.content.message : result.toString();
                rclient.post_error(command + ': ' + message);
            }
        };
    }

    var rcloud = {};
    rcloud.username = function() {
        return $.cookies.get('user');
    };
    rcloud.github_token = function() {
        return $.cookies.get('token');
    };
    rcloud.session_init = function(username, token, k) {
        rcloud_ocaps.session_init(username, token, k || _.identity);
    };
    rcloud.init_client_side_data = function() {
        var that = this;
        rcloud_ocaps.prefix_uuid(function(v) {
            that.deferred_knitr_uuid = v;
        });
    };
    rcloud.search = function(search_string, k) {
        rcloud_ocaps.search(search_string, k || _.identity);
    };
    rcloud.load_user_config = function(user, k) {
        rcloud_ocaps.load_user_config(user, json_k(k));
    };
    rcloud.load_multiple_user_configs = function(users, k) {
        rcloud_ocaps.load_multiple_user_configs(users, json_k(k));
    };
    rcloud.save_user_config = function(user, content, k) {
        rcloud_ocaps.save_user_config(user, JSON.stringify(content), json_k(k));
    };
    rcloud.get_conf_value = function(key, k) {
        rcloud_ocaps.get_conf_value(key, k);
    };
    rcloud.load_notebook = function(id, version, k) {
        k = rcloud_github_handler("rcloud.get.notebook " + id, k);
        rcloud_ocaps.get_notebook(id, version, function(notebook) {
            rcloud_ocaps.reset_session(function() {
                k(notebook);
            });
        });
    };
    rcloud.update_notebook = function(id, content, k) {
        k = rcloud_github_handler("rcloud.update.notebook", k);
        rcloud_ocaps.update_notebook(id, JSON.stringify(content), k);
    };
    rcloud.create_notebook = function(content, k) {
        k = rcloud_github_handler("rcloud.create.notebook", k);
        rcloud_ocaps.create_notebook(JSON.stringify(content), k);
    };
    rcloud.fork_notebook = function(id, k) {
        k = rcloud_github_handler("rcloud.fork.notebook", k);
        rcloud_ocaps.fork_notebook(id, k);
    };
    rcloud.get_users = function(user, k) {
        rcloud_ocaps.get_users(user, k || _.identity);
    };
    rcloud.get_completions = function(text, pos, k) {
        return rcloud_ocaps.get_completions(text, pos, function(comps) {
            // convert to the record format ace.js autocompletion expects
            // meta is what gets displayed at right; name & score might be improved
            k(_.map(comps,
                    function(comp) {
                        return {meta: "local",
                                name: "library",
                                score: 3,
                                value: comp
                               };
                    }));
        });
    };
    rcloud.rename_notebook = function(id, new_name, k) {
        k = rcloud_github_handler("rcloud.rename.notebook", k);
        rcloud_ocaps.rename_notebook(id, new_name, k);
    };
    rcloud.record_cell_execution = function(cell_model) {
        var k = _.identity;
        var json_rep = JSON.stringify(cell_model.json());
        rcloud_ocaps.log.record_cell_execution(rcloud.username(), json_rep, k);
    };
    rcloud.session_markdown_eval = function(command, silent, k) {
        rcloud_ocaps.session_markdown_eval(command, silent, k || _.identity);
    };
    rcloud.upload_file = function(force, on_success, on_failure) {
        on_success = on_success || _.identity;
        function do_upload(path, file) {
            var upload_name = path + '/' + file.name;
            rcloud_ocaps.file_upload.create(upload_name, force, function(result) {
                if (RCloud.is_exception(result)) {
                    on_failure(RCloud.exception_message(result));
                    return;
                }
                var fr = new FileReader();
                var chunk_size = 1024*1024;
                var f_size=file.size;
                var cur_pos=0;
                //initiate the first chunk, and then another, and then another ...
                // ...while waiting for one to complete before reading another
                fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
                fr.onload = function(e) {
                    if (e.target.result.byteLength > 0) {
                        var bytes = new Uint8Array(e.target.result);
                        rcloud_ocaps.file_upload.write(bytes.buffer, function() {
                            cur_pos += chunk_size;
                            fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
                        });
                    } else {
                        //This is just temporary, until we add the nice info messages from bootstrap
                        rcloud_ocaps.file_upload.close(function(){
                            on_success(path, file);
                        });
                    }
                };
            });
        }
        if(!(window.File && window.FileReader && window.FileList && window.Blob))
            throw "File API not supported by browser.";
        else {
            var file=$("#file")[0].files[0];
            if(_.isUndefined(file))
                throw "No file selected!";
            else {
                /*FIXME add logged in user */
                rcloud_ocaps.file_upload.upload_path(function(path) {
                    var file=$("#file")[0].files[0];
                    if(_.isUndefined(file))
                        throw new Error("No file selected!");
                    do_upload(path, file);
                });
            }
        }
    };

    // javascript.R
    rcloud.setup_js_installer = function(v, k) {
        rcloud_ocaps.setup_js_installer(v, k || _.identity);
    };

    rcloud.modules = {};
    rcloud.setup_js_installer(function(name, content, k) {
        var result = eval(content);
        rcloud.modules[name] = result;
        k(result);
    });

    // notebook.comments.R
    rcloud.get_all_comments = function(id, k) {
        rcloud_ocaps.comments.get_all(id, k || _.identity);
    };
    rcloud.post_comment = function(id, content, k) {
        rcloud_ocaps.comments.post(id, content, k || _.identity);
    };

    // debugging ocaps
    rcloud.debug = {};
    rcloud.debug.raise = function(msg, k) {
        rcloud_ocaps.debug.raise(msg, k);
    };

    // graphics
    rcloud.graphics = {};
    rcloud.graphics.set_device_pixel_ratio = function(ratio, k) {
        rcloud_ocaps.graphics.set_device_pixel_ratio(ratio, k);
    };

    return rcloud;
};
var ui_utils = {};

ui_utils.fa_button = function(which, title, classname, style)
{
    var span = $('<span/>', {class: 'fontawesome-button ' + (classname || '')});
    var icon = $('<i/>', {class: which});
    if(style)
        icon.css(style);
    span.append(icon)
        .tooltip({
            title: title,
            delay: { show: 250, hide: 0 }
        });
    return span;
};

ui_utils.ace_editor_height = function(widget)
{
    var lineHeight = widget.renderer.lineHeight;
    var rows = Math.min(30, widget.getSession().getLength());
    var newHeight = lineHeight*rows + widget.renderer.scrollBar.getWidth();
    return Math.max(75, newHeight);
};

// this is a hack, but it'll help giving people the right impression.
// I'm happy to replace it witht the Right Way to do it when we learn
// how to do it.
ui_utils.make_prompt_chevron_gutter = function(widget)
{
    var dom = require("ace/lib/dom");
    widget.renderer.$gutterLayer.update = function(config) {
        var emptyAnno = {className: ""};
        var html = [];
        var i = config.firstRow;
        var lastRow = config.lastRow;
        var fold = this.session.getNextFoldLine(i);
        var foldStart = fold ? fold.start.row : Infinity;
        var foldWidgets = this.$showFoldWidgets && this.session.foldWidgets;
        var breakpoints = this.session.$breakpoints;
        var decorations = this.session.$decorations;
        var firstLineNumber = this.session.$firstLineNumber;
        var lastLineNumber = 0;
        html.push(
            "<div class='ace_gutter-cell ",
            "' style='height:", this.session.getRowLength(0) * config.lineHeight, "px;'>", 
            "&gt;", "</div>"
        );

        this.element = dom.setInnerHtml(this.element, html.join(""));
        this.element.style.height = config.minHeight + "px";
        
        if (this.session.$useWrapMode)
            lastLineNumber = this.session.getLength();
        
        var gutterWidth = ("" + lastLineNumber).length * config.characterWidth;
        var padding = this.$padding || this.$computePadding();
        gutterWidth += padding.left + padding.right;
        if (gutterWidth !== this.gutterWidth && !isNaN(gutterWidth)) {
            this.gutterWidth = gutterWidth;
            this.element.style.width = Math.ceil(this.gutterWidth) + "px";
            this._emit("changeGutterWidth", gutterWidth);
        }
    };
};
var bootstrap_utils = {};

bootstrap_utils.alert = function(opts)
{
    opts = _.defaults(opts || {}, {
        close_button: true
    });
    var div = $('<div class="alert"></div>');
    if (opts.html) div.html(opts.html);
    if (opts.text) div.text(opts.text);
    if (opts['class']) div.addClass(opts['class']);
    if (opts.close_button) 
        div.prepend($('<button type="button" class="close" data-dismiss="alert">&times;</button>'));
    return div;
};

bootstrap_utils.button = function(opts)
{
    opts = opts || {}; // _.defaults(opts || {}, {});
    var a = $('<a class="btn" href="#"></a>');
    a.text(opts.text);
    if (opts['class']) a.addClass(opts['class']);
    return a;
};
Notebook = {};

//////////////////////////////////////////////////////////////////////////////
//
// roughly a MVC-kinda-thing per cell, plus a MVC for all the cells
// 
Notebook.Cell = {};
(function() {

function create_markdown_cell_html_view(language) { return function(cell_model) {
    var notebook_cell_div  = $("<div class='notebook-cell'></div>");

    //////////////////////////////////////////////////////////////////////////
    // button bar

    var insert_cell_button = ui_utils.fa_button("icon-plus-sign", "insert cell");
    var source_button = ui_utils.fa_button("icon-edit", "source");
    var result_button = ui_utils.fa_button("icon-picture", "result");
    // var hide_button   = ui_utils.fa_button("icon-resize-small", "hide");
    var remove_button = ui_utils.fa_button("icon-trash", "remove");
    var run_md_button = ui_utils.fa_button("icon-play", "run");
    var gap = $('<div/>').html('&nbsp;').css({'line-height': '25%'});

    function update_model() {
        return cell_model.content(widget.getSession().getValue());
    }
    function enable(el) {
        el.removeClass("button-disabled");
    }
    function disable(el) {
        el.addClass("button-disabled");
    }

    insert_cell_button.click(function(e) {
        shell.insert_markdown_cell_before(cell_model.id);
    });
    source_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            result.show_source();
        }
    });
    result_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled"))
            result.show_result();
    });
    // hide_button.click(function(e) {
    //     if (!$(e.currentTarget).hasClass("button-disabled"))
    //         result.hide_all();
    // });
    remove_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            cell_model.parent_model.controller.remove_cell(cell_model);

            // twitter bootstrap gets confused about its tooltips if parent element
            // is deleted while tooltip is active; let's help it
            $(".tooltip").remove();
        }
    });
    function execute_cell() {
        r_result_div.html("Computing...");
        var new_content = update_model();
        result.show_result();
        if(new_content!==null) // if any change (including removing the content)
            cell_model.parent_model.controller.update_cell(cell_model);
        cell_model.controller.execute();
    }
    run_md_button.click(function(e) {
        execute_cell();
    });

    var button_float = $("<div class='cell-controls'></div>");
    var col = $('<table/>');
    $.each([run_md_button, source_button, result_button/*, hide_button*/, gap, remove_button],
           function() {
               col.append($('<tr/>').append($('<td/>').append($(this))));
           });
    button_float.append(col);
    notebook_cell_div.append(button_float);

    var insert_button_float = $("<div class='cell-insert-control'></div>");
    insert_button_float.append(insert_cell_button);
    notebook_cell_div.append(insert_button_float);

    //////////////////////////////////////////////////////////////////////////

    var inner_div = $("<div></div>");
    var clear_div = $("<div style='clear:both;'></div>");
    notebook_cell_div.append(inner_div);
    notebook_cell_div.append(clear_div);

    var markdown_div = $('<div style="position: relative; width:100%; height:100%"></div>');

    var ace_div = $('<div style="width:100%; height:100%"></div>');
    ace_div.css({'background-color': language === 'R' ? "#E8F1FA" : "#F7EEE4"});


    // ace_div.css({'background-color': language === 'R' ? "#B1BEA4" : "#F1EDC0"});
    inner_div.append(markdown_div);
    markdown_div.append(ace_div);
    ace.require("ace/ext/language_tools");
    var widget = ace.edit(ace_div[0]);
    var RMode = require(language === 'R' ? "ace/mode/r" : "ace/mode/rmarkdown").Mode;
    var session = widget.getSession();
    var doc = session.doc;
    widget.setReadOnly(cell_model.parent_model.read_only());
    widget.setOptions({
        enableBasicAutocompletion: true
    });
    session.setMode(new RMode(false, doc, session));
    session.on('change', function() {
        notebook_cell_div.css({'height': ui_utils.ace_editor_height(widget) + "px"});
        widget.resize();
    });

    widget.setTheme("ace/theme/chrome");
    session.setUseWrapMode(true);
    widget.resize();

    var Autocomplete = require("ace/autocomplete").Autocomplete;

    widget.commands.addCommands([{
        name: 'sendToR',
        bindKey: {
            win: 'Ctrl-Return',
            mac: 'Command-Return',
            sender: 'editor'
        },
        exec: function(widget, args, request) {
            execute_cell();
        }
    }, {
        name: 'another autocomplete key',
        bindKey: 'Ctrl-.',
        exec: Autocomplete.startCommand.exec
    }]);

    var r_result_div = $('<div class="r-result-div"><span style="opacity:0.5">Computing ...</span></div>');
    inner_div.append(r_result_div);

    var current_mode;

    var result = {

        //////////////////////////////////////////////////////////////////////
        // pubsub event handlers

        content_updated: function() {
            var position = widget.getCursorPosition();
            var changed = widget.getSession().setValue(cell_model.content());
            widget.getSelection().moveCursorToPosition(position);
            return changed;
        },
        self_removed: function() {
            notebook_cell_div.remove();
        },
        result_updated: function(r) {
            r_result_div.hide();
            r_result_div.html(r);
            r_result_div.slideDown(150);

            // There's a list of things that we need to do to the output:
            var uuid = rcloud.deferred_knitr_uuid;

            // fix image width so that retina displays are set correctly
            // FIXME currently assumes that all plots are 72 dpi x 7 inches (which is bad)
            inner_div.find("img")
                .attr("width", "504px");

            // capture deferred knitr results
            inner_div.find("pre code")
                .contents()
                .filter(function() {
                    return this.nodeValue.indexOf(uuid) !== -1;
                }).parent().parent()
                .each(function() {
                    var that = this;
                    var uuids = this.childNodes[0].childNodes[0].data.substr(8,65).split("|");
                    // FIXME monstrous hack: we rebuild the ocap from the string to
                    // call it via rserve-js
                    var ocap = [uuids[1]];
                    ocap.r_attributes = { "class": "OCref" };
                    var f = rclient._rserve.wrap_ocap(ocap);

                    f(function(future) {
                        if (RCloud.is_exception(future)) {
                            var data = RCloud.exception_message(future);
                            $(that).replaceWith(function() {
                                return rclient.string_error(data);
                            });
                        } else {
                            var data = future();
                            $(that).replaceWith(function() {
                                return data;
                            });
                        }
                    });
                    // rcloud.resolve_deferred_result(uuids[1], function(data) {
                    //     $(that).replaceWith(function() {
                    //         return shell.handle(data[0], data);
                    //     });
                    // });
                });
            // highlight R
            inner_div
                .find("pre code")
                .each(function(i, e) {
                    hljs.highlightBlock(e);
                });

            // typeset the math
            if (!_.isUndefined(MathJax))
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

            // this is kinda bad
            if (!shell.notebook.controller._r_source_visible) {
                Notebook.hide_r_source(inner_div);
            }

            this.show_result();
        },
        set_readonly: function(readonly) {
            widget.setReadOnly(readonly);
        },

        //////////////////////////////////////////////////////////////////////

        hide_buttons: function() {
            button_float.css("display", "none");
            insert_button_float.hide();
        },
        show_buttons: function() {
            button_float.css("display", null);
            insert_button_float.show();
        },

        show_source: function() {
            /*
             * Some explanation for the next poor soul
             * that might come across this great madness below:
             *
             * ACE appears to have trouble computing properties such as
             * renderer.lineHeight. This is unfortunate, since we want
             * to use lineHeight to determine the size of the widget in the
             * first place. The only way we got ACE to work with
             * dynamic sizing was to set up a three-div structure, like so:
             *
             * <div id="1"><div id="2"><div id="3"></div></div></div>
             *
             * set the middle div (id 2) to have a style of "height: 100%"
             *
             * set the outer div (id 1) to have whatever height in pixels you want
             *
             * make sure the entire div structure is on the DOM and is visible
             *
             * call ace's resize function once. (This will update the
             * renderer.lineHeight property)
             *
             * Now set the outer div (id 1) to have the desired height as a
             * funtion of renderer.lineHeight, and call resize again.
             *
             * Easy!
             *
             */
            // do the two-change dance to make ace happy
            notebook_cell_div.css({'height': ui_utils.ace_editor_height(widget) + "px"});
            markdown_div.show();
            widget.resize(true);
            notebook_cell_div.css({'height': ui_utils.ace_editor_height(widget) + "px"});
            widget.resize(true);
            disable(source_button);
            enable(result_button);
            // enable(hide_button);
            enable(remove_button);
            //editor_row.show();

            markdown_div.show();
            r_result_div.hide();
            widget.resize();
            widget.focus();

            current_mode = "source";
        },
        show_result: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            disable(result_button);
            // enable(hide_button);
            enable(remove_button);

            //editor_row.hide();
            markdown_div.hide();
            r_result_div.slideDown(150); // show();
            current_mode = "result";
        },
        hide_all: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            enable(result_button);
            // disable(hide_button);
            enable(remove_button);

            //editor_row.hide();
            if (current_mode === "result") {
                r_result_div.slideUp(150); // hide();
            } else {
                markdown_div.slideUp(150); // hide();
            }
        },
        /*
        // this doesn't make sense: changes should go through controller
        remove_self: function() {
            cell_model.parent_model.remove_cell(cell_model);
            notebook_cell_div.remove();
        },
        */
        div: function() {
            return notebook_cell_div;
        },
        update_model: function() {
            return update_model();
        },
        focus: function() {
            widget.focus();
        },
        get_content: function() { // for debug
            return cell_model.content();
        }
    };

    result.show_result();
    result.content_updated();
    return result;
}};

var dispatch = {
    Markdown: create_markdown_cell_html_view("Markdown"),
    R: create_markdown_cell_html_view("R")
};

Notebook.Cell.create_html_view = function(cell_model)
{
    return dispatch[cell_model.language()](cell_model);
};

})();
Notebook.Cell.create_model = function(content, language)
{
    var result = {
        views: [], // sub list for pubsub
        id: -1,
        language: function() {
            return language;
        },
        content: function(new_content) {
            if (!_.isUndefined(new_content)) {
                if(content != new_content) {
                    content = new_content;
                    notify_views();
                    return content;
                }
                else return null;
            }
            return content;
        },
        json: function() {
            return {
                content: content,
                language: language
            };
        }
    };
    function notify_views() {
        _.each(result.views, function(view) {
            view.content_updated();
        });
    }
    return result;
};
Notebook.Cell.create_controller = function(cell_model)
{
    var result = {
        execute: function(k) {
            var that = this;
            var language = cell_model.language();
            function callback(r) {
                _.each(cell_model.views, function(view) {
                    view.result_updated(r);
                });
                k && k();
            }

            rcloud.record_cell_execution(cell_model);

            if (language === 'Markdown') {
                rcloud.session_markdown_eval(cell_model.content(), false, callback);
                // var wrapped_command = rclient.markdown_wrap_command(cell_model.content());
                // rclient.send_and_callback(wrapped_command, callback, _.identity);
            } else if (language === 'R') {
                rcloud.session_markdown_eval("```{r}\n" + cell_model.content() + "\n```\n", false, callback);
                // var wrapped_command = rclient.markdown_wrap_command("```{r}\n" + cell_model.content() + "\n```\n");
                // rclient.send_and_callback(wrapped_command, callback, _.identity);
            } else alert("Don't know language '" + language + "' - can only do Markdown or R for now!");
        }
    };

    return result;
};
Notebook.create_html_view = function(model, root_div)
{
    function show_or_hide_cursor(readonly) {
        if(readonly)
            $('.ace_cursor-layer').hide();
        else
            $('.ace_cursor-layer').show();
    }
    var result = {
        model: model,
        sub_views: [],
        cell_appended: function(cell_model) {
            var cell_view = Notebook.Cell.create_html_view(cell_model);
            cell_model.views.push(cell_view);
            root_div.append(cell_view.div());
            this.sub_views.push(cell_view);
            return cell_view;
        },
        cell_inserted: function(cell_model, cell_index) {
            var cell_view = Notebook.Cell.create_html_view(cell_model);
            cell_model.views.push(cell_view);
            root_div.append(cell_view.div());
            $(cell_view.div()).insertBefore(root_div.children('.notebook-cell')[cell_index]);
            this.sub_views.splice(cell_index, 0, cell_view);
            cell_view.show_source();
            return cell_view;
        },
        cell_removed: function(cell_model, cell_index) {
            _.each(cell_model.views, function(view) {
                view.self_removed();
            });
            this.sub_views.splice(cell_index, 1);
        },
        set_readonly: function(readonly) {
            show_or_hide_cursor(readonly);
            _.each(this.sub_views, function(view) {
                view.set_readonly(readonly);
            });
        },
        update_model: function() {
            return _.map(this.sub_views, function(cell_view) {
                return cell_view.update_model();
            });
        }
    };
    model.views.push(result);
    return result;
};
Notebook.create_model = function()
{
    var read_only = false;

    /* note, the code below is a little more sophisticated than it needs to be:
       allows multiple inserts or removes but currently n is hardcoded as 1.  */

    function last_id(notebook) {
        if(notebook.length)
            return notebook[notebook.length-1].id;
        else
            return 0;
    }
    return {
        notebook: [],
        views: [], // sub list for pubsub
        clear: function() {
            return this.remove_cell(null,last_id(this.notebook));
        },
        append_cell: function(cell_model, id) {
            cell_model.parent_model = this;
            var changes = [];
            var n = 1;
            id = id || 1;
            id = Math.max(id, last_id(this.notebook)+1);
            while(n) {
                changes.push([id,{content: cell_model.content(), language: cell_model.language()}]);
                cell_model.id = id;
                this.notebook.push(cell_model);
                _.each(this.views, function(view) {
                    view.cell_appended(cell_model);
                });
                ++id;
                --n;
            }
            return changes;
        },
        insert_cell: function(cell_model, id) {
            var that = this;
            cell_model.parent_model = this;
            var changes = [];
            var n = 1, x = 0;
            while(x<this.notebook.length && this.notebook[x].id < id) ++x;
            // check if ids can go above rather than shifting everything else down
            if(x<this.notebook.length && id+n > this.notebook[x].id) {
                var prev = x>0 ? this.notebook[x-1].id : 0;
                id = Math.max(this.notebook[x].id-n, prev+1);
            }
            for(var j=0; j<n; ++j) {
                changes.push([id+j, {content: cell_model.content(), language: cell_model.language()}]);
                cell_model.id = id+j;
                this.notebook.splice(x, 0, cell_model);
                _.each(this.views, function(view) {
                    view.cell_inserted(that.notebook[x], x);
                });
                ++x;
            }
            while(x<this.notebook.length && n) {
                if(this.notebook[x].id > id) {
                    var gap = this.notebook[x].id - id;
                    n -= gap;
                    id += gap;
                }
                if(n<=0)
                    break;
                changes.push([this.notebook[x].id,{content: this.notebook[x].content(),
                                                   rename: this.notebook[x].id+n,
                                                   language: this.notebook[x].language()}]);
                this.notebook[x].id += n;
                ++x;
                ++id;
            }
            return changes;
        },
        remove_cell: function(cell_model, n) {
            var that = this;
            var cell_index, id;
            if(cell_model!=null) {
                cell_index = this.notebook.indexOf(cell_model);
                id = cell_model.id;
                if (cell_index === -1) {
                    throw "cell_model not in notebook model?!";
                }
            }
            else {
                cell_index = 0;
                id = 1;
            }
            var n = n || 1, x = cell_index;
            var changes = [];
            while(x<this.notebook.length && n) {
                if(this.notebook[x].id == id) {
                    _.each(this.views, function(view) {
                        view.cell_removed(that.notebook[x], x);
                    });
                    changes.push([id, {erase: 1, language: that.notebook[x].language()} ]);
                    this.notebook.splice(x, 1);
                }
                ++id;
                --n;
            }
            return changes;
        },
        update_cell: function(cell_model) {
            return [[cell_model.id, {content: cell_model.content(),
                                     language: cell_model.language()}]];
        },
        reread_cells: function() {
            var that = this;
            var changed_cells_per_view = _.map(this.views, function(view) {
                return view.update_model();
            });
            if(changed_cells_per_view.length != 1)
                throw "not expecting more than one notebook view";
            return _.reduce(changed_cells_per_view[0],
                            function(changes, content, index) {
                                if(content)
                                    changes.push([that.notebook[index].id, {content: content,
                                                                            language: that.notebook[index].language()}]);
                                return changes;
                            },
                            []);
        },
        read_only: function(readonly) {
            if(!_.isUndefined(readonly)) {
                read_only = readonly;
                _.each(this.views, function(view) {
                    view.set_readonly(read_only);
                });
            }
            return read_only;
        },
        json: function() {
            return _.map(this.notebook, function(cell_model) {
                return cell_model.json();
            });
        }
    };
};
Notebook.create_controller = function(model)
{
    var current_gist_;

    function append_cell_helper(content, type, id) {
        var cell_model = Notebook.Cell.create_model(content, type);
        var cell_controller = Notebook.Cell.create_controller(cell_model);
        cell_model.controller = cell_controller;
        return [cell_controller, model.append_cell(cell_model, id)];
    }

    function insert_cell_helper(content, type, id) {
        var cell_model = Notebook.Cell.create_model(content, type);
        var cell_controller = Notebook.Cell.create_controller(cell_model);
        cell_model.controller = cell_controller;
        return [cell_controller, model.insert_cell(cell_model, id)];
    }

    function on_load(k, version, notebook) {
        this.clear();
        var parts = {}; // could rely on alphabetic input instead of gathering
        _.each(notebook.files, function (file) {
            var filename = file.filename;
            if(/^part/.test(filename)) {
                var number = parseInt(filename.slice(4).split('.')[0]);
                if(number !== NaN)
                    parts[number] = [file.content, file.language, number];
            }
            // style..
        });
        for(var i in parts)
            append_cell_helper(parts[i][0], parts[i][1], parts[i][2]);
        // is there anything else to gist permissions?
        model.read_only(version != null || notebook.user.login != rcloud.username());
        current_gist_ = notebook;
        k && k(notebook);
    }

    function find_changes_from(notebook) {
        var changes = [];
        var nf = notebook.files,
            cf = _.extend({}, current_gist_.files); // to keep track of changes
        for(var f in nf) {
            if(f==='r_type' || f==='r_attributes')
                continue; // R metadata
            if(f in cf) {
                if(cf[f].language != nf[f].language || cf[f].content != nf[f].content) {
                    changes.push([f, cf[f]]);
                }
                delete cf[f];
            }
            else changes.push([f, {erase: true, language: nf[f].language}]);
        }
        for(f in cf) {
            if(f==='r_type')
                continue; // artifact of rserve.js
            changes.push([f, cf[f]]);
        }
        return changes;
    }

    var result = {
        append_cell: function(content, type, id) {
            var cch = append_cell_helper(content, type, id);
            // github gist api will not take empty cells, so drop them
            if(content.length)
                this.update_notebook(cch[1]);
            return cch[0];
        },
        insert_cell: function(content, type, id) {
            var cch = insert_cell_helper(content, type, id);
            if(content.length)
                this.update_notebook(cch[1]);
            return cch[0];
        },
        remove_cell: function(cell_model) {
            var changes = model.remove_cell(cell_model);
            shell.input_widget.focus(); // there must be a better way
            this.update_notebook(changes);
        },
        clear: function() {
            model.clear();
        },
        load_notebook: function(gistname, version, k) {
            var that = this;
            rcloud.load_notebook(gistname, version || null, _.bind(on_load, this, k, version));
        },
        create_notebook: function(content, k) {
            var that = this;
            rcloud.create_notebook(content, function(notebook) {
                that.clear();
                model.read_only(notebook.user.login != rcloud.username());
                current_gist_ = notebook;
                k && k(notebook);
            });
        },
        fork_or_revert_notebook: function(is_mine, gistname, version, k) {
            var that = this;
            function update_if(changes, gistname, k) {
                // if there are no changes, just load the gist so that we are sending along
                // the latest history, timestamp, etc.
                if(changes.length)
                    that.update_notebook(changes, gistname, k);
                else
                    rcloud.load_notebook(gistname, null, k);
            }
            if(is_mine) // revert: get HEAD, calculate changes from there to here, and apply
                rcloud.load_notebook(gistname, null, function(notebook) {
                    var changes = find_changes_from(notebook);
                    update_if(changes, gistname, k);
                });
            else // fork:
                rcloud.fork_notebook(gistname, function(notebook) {
                    if(version) {
                        // fork, then get changes from there to here, and apply
                        var changes = find_changes_from(notebook);
                        update_if(changes, notebook.id, k);
                    }
                    else
                        that.load_notebook(notebook.id, null, k);
                });
        },
        update_notebook: function(changes, gistname, k) {
            if(!changes.length)
                return;
            if(model.read_only())
                throw "attempted to update read-only notebook";
            gistname = gistname || shell.gistname();
            function partname(id, language) {
                // yuk
                if(_.isString(id))
                    return id;
                var ext;
                switch(language) {
                case 'R':
                    ext = 'R';
                    break;
                case 'Markdown':
                    ext = 'md';
                    break;
                default:
                    throw "Unknown language " + language;
                }
                return 'part' + id + '.' + ext;
            }
            function changes_to_gist(changes) {
                // we don't use the gist rename feature because it doesn't
                // allow renaming x -> y and creating a new x at the same time
                // instead, create y and if there is no longer any x, erase it
                var post_names = _.reduce(changes,
                                         function(names, change) {
                                             if(!change[1].erase) {
                                                 var after = change[1].rename || change[0];
                                                 names[partname(after, change[1].language)] = 1;
                                             }
                                             return names;
                                         }, {});
                function xlate_change(filehash, change) {
                    var c = {};
                    if(change[1].content !== undefined)
                        c.content = change[1].content;
                    var pre_name = partname(change[0], change[1].language);
                    if(change[1].erase || !post_names[pre_name])
                        filehash[pre_name] = null;
                    var post_name = partname(change[1].rename || change[0], change[1].language);
                    if(!change[1].erase)
                        filehash[post_name] = c;
                    return filehash;
                }
                return {files: _.reduce(changes, xlate_change, {})};
            }
            // not awesome to callback to someone else here
            k = k || editor.load_callback(null, true);
            var k2 = function(notebook) {
                current_gist_ = notebook;
                k(notebook);
            };
            if(changes.length)
                rcloud.update_notebook(gistname, changes_to_gist(changes), k2);
        },
        refresh_cells: function() {
            return model.reread_cells();
        },
        update_cell: function(cell_model) {
            this.update_notebook(model.update_cell(cell_model));
        },
        run_all: function(k) {
            var changes = this.refresh_cells();
            this.update_notebook(changes);
            var n = model.notebook.length;
            function bump_executed() {
                --n;
                if (n === 0)
                    k && k();
            }
            _.each(model.notebook, function(cell_model) {
                cell_model.controller.execute(bump_executed);
            });
        },

        //////////////////////////////////////////////////////////////////////

        _r_source_visible: true,

        hide_r_source: function() {
            this._r_source_visible = false;
            this.run_all(Notebook.hide_r_source);
        },
        show_r_source: function() {
            this._r_source_visible = true;
            this.run_all(Notebook.show_r_source);
        }
    };
    model.controller = result;
    return result;
};
Notebook.hide_r_source = function(selection)
{
    if (selection)
        selection = $(selection).find(".r");
    else
        selection = $(".r");
    selection.parent().hide();
};

Notebook.show_r_source = function(selection)
{
    if (selection)
        selection = $(selection).find(".r");
    else
        selection = $(".r");
    selection.parent().show();
};
