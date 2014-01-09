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
                    on_error("Login failed. Shutting down!");
                }
            });
        }

        // this might be called multiple times; some conditions result
        // in on_error and on_close both being called.
        function shutdown() {
            if (!clean) {
                $("#input-div").hide();
            }
            if (!rserve.closed)
                rserve.close();
        }

        function on_error(msg, status_code) {
            if (opts.on_error && opts.on_error(msg, status_code))
                return;
            result.post_error(result.disconnection_error(msg));
            shutdown();
        }

        function on_close(msg) {
            if (!clean) {
                result.post_error(result.disconnection_error("Socket was closed. Goodbye!"));
                shutdown();
            }
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
        var clean = false;

        result = {
            _rserve: rserve,
            host: opts.host,
            running: false,
           
            //////////////////////////////////////////////////////////////////
            // FIXME: all of this should move out of rclient and into
            // the notebook objects.

            string_error: function(msg) {
                var button = $("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>");
                var result = $("<div class='alert alert-danger alert-dismissable'></div>");
                var text = $("<span></span>");
                result.append(button);
                result.append(text);
                text.text(msg);
                return result;
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
            },

            close: function() {
                clean = true;
                shutdown();
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
            var json_result = {};
            try {
                json_result = JSON.parse(result);
            } catch (e) {
                rclient.post_error(e.message);
            }
            // FIXME: I must still call the continuation,
            // because bad things might happen otherwise. But calling
            // this means that I'm polluting the 
            // space of possible JSON answers with the error.
            // For example, right now a return string "{}" is indistinguishable
            // from an error
            k && k(json_result);
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
                // FIXME: I must still call the continuation,
                // because bad things might happen otherwise. But calling
                // this means that I'm polluting the 
                // space of possible JSON answers with the error.
                // For example, right now a return string "{}" is indistinguishable
                // from an error
                k && k({ error: result.content });
            }
        };
    }

    var rcloud = {};

    function setup_unauthenticated_ocaps() {
        rcloud.anonymous_session_init = function(k) {
            rcloud_ocaps.anonymous_session_init(k || _.identity);
        };

        rcloud.username = function() {
            return $.cookies.get('user');
        };
        rcloud.github_token = function() {
            return $.cookies.get('token');
        };
        rcloud.init_client_side_data = function(k) {
            k = k || _.identity;
            var that = this;
            rcloud_ocaps.prefix_uuid(function(v) {
                that.deferred_knitr_uuid = v;
                k();
            });
        };

        rcloud.get_conf_value = function(key, k) {
            rcloud_ocaps.get_conf_value(key, k);
        };

        rcloud.get_notebook = function(id, version, k) {
            k = rcloud_github_handler("rcloud.get.notebook " + id, k);
            rcloud_ocaps.get_notebook(id, version, function(notebook) {
                k(notebook);
            });
        };

        rcloud.load_notebook = function(id, version, k) {
            k = rcloud_github_handler("rcloud.load.notebook " + id, k);
            rcloud_ocaps.load_notebook(id, version, function(notebook) {
                k(notebook);
            });
        };

        rcloud.call_notebook = function(id, version, k) {
            k = rcloud_github_handler("rcloud.call.notebook " + id, k);
            rcloud_ocaps.call_notebook(id, version, function(notebook) {
                k(notebook);
            });
        };

        rcloud.install_notebook_stylesheets = function(k) {
            rcloud_ocaps.install_notebook_stylesheets(k || _.identity);
        };

        rcloud.get_users = function(user, k) {
            rcloud_ocaps.get_users(user, k || _.identity);
        };

        rcloud.record_cell_execution = function(cell_model) {
            var k = _.identity;
            var json_rep = JSON.stringify(cell_model.json());
            rcloud_ocaps.log.record_cell_execution(rcloud.username(), json_rep, k);
        };

        // javascript.R
        rcloud.setup_js_installer = function(v, k) {
            rcloud_ocaps.setup_js_installer(v, k || _.identity);
        };

        // having this naked eval here makes me very nervous.
        rcloud.modules = {};
        rcloud.setup_js_installer({
            install_js: function(name, content, k) {
                var result = eval(content);
                rcloud.modules[name] = result;
                k(result);
            },
            clear_css: function(current_notebook, k) {
                $(".rcloud-user-defined-css").remove();
                k();
            },
            install_css: function(urls, k) {
                if (_.isString(urls))
                    urls = [urls];
                _.each(urls, function(url) {
                    $("head").append($('<link type="text/css" rel="stylesheet" class="rcloud-user-defined-css" href="' +
                                       url + '"/>'));
                });
                k();
            }
        });

        // notebook.comments.R
        rcloud.get_all_comments = function(id, k) {
            rcloud_ocaps.comments.get_all(id, k || _.identity);
        };

        // debugging ocaps
        rcloud.debug = {};
        rcloud.debug.raise = function(msg, k) {
            rcloud_ocaps.debug.raise(msg, k || _.identity);
        };

        // stars
        rcloud.stars = {};
        rcloud.stars.is_notebook_starred = function(id, k) {
            rcloud_ocaps.stars.is_notebook_starred(id, k);
        };
        rcloud.stars.get_notebook_star_count = function(id, k) {
            rcloud_ocaps.stars.get_notebook_star_count(id, k);
        };
        rcloud.stars.get_multiple_notebook_star_counts = function(id, k) {
            rcloud_ocaps.stars.get_multiple_notebook_star_counts(id, k);
        };

        rcloud.session_cell_eval = function(filename, language, silent, k) {
            rcloud_ocaps.session_cell_eval(filename, language, silent, k);
        };

        rcloud.reset_session = function(k) {
            k = k || _.identity;
            rcloud_ocaps.reset_session(k);
        };
    }

    function setup_authenticated_ocaps() {
        rcloud.session_init = function(username, token, k) {
            rcloud_ocaps.session_init(username, token, k || _.identity);
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
        rcloud.port_notebooks = function(source, notebooks, prefix, k) {
            rcloud_ocaps.port_notebooks(source, notebooks, prefix, k);
        };
        rcloud.get_completions = function(text, pos, k) {
            return rcloud_ocaps.get_completions(text, pos, function(comps) {
                if(_.isString(comps))
                    comps = [comps]; // quirk of rserve.js scalar handling
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
        rcloud.session_markdown_eval = function(command, language, silent, k) {
            rcloud_ocaps.session_markdown_eval(command, language, silent, k || _.identity);
        };
        rcloud.upload_to_notebook = function(force, on_success, on_failure) {
            on_success = on_success || _.identity;
            on_failure = on_failure || _.identity;
            function do_upload(file) {
                var fr = new FileReader();
                var chunk_size = 1024*1024;
                var f_size = file.size;
                var file_to_upload = new Uint8Array(f_size);
                var cur_pos = 0;
                fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
                fr.onload = function(e) {
                    if (e.target.result.byteLength > 0) {
                        // still sending data to user agent
                        var bytes = new Uint8Array(e.target.result);
                        file_to_upload.set(bytes, cur_pos);
                        cur_pos += bytes.byteLength;
                        fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
                    } else {
                        // done, push to notebook.
                        rcloud_ocaps.notebook_upload(
                            file_to_upload.buffer, file.name, function(result){
                                on_success(file_to_upload, file, result.content);
                            });
                    }
                };
            }
            if(!(window.File && window.FileReader && window.FileList && window.Blob))
                throw new Error("File API not supported by browser.");
            var file=$("#file")[0].files[0];
            if(_.isUndefined(file))
                throw new Error("No file selected!");
            /*FIXME add logged in user */
            rcloud_ocaps.file_upload.upload_path(function(path) {
                var file=$("#file")[0].files[0];
                if(_.isUndefined(file))
                    throw new Error("No file selected!");
                do_upload(file);
            });
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

        rcloud.post_comment = function(id, content, k) {
            rcloud_ocaps.comments.post(id, content, k || _.identity);
        };

        // publishing notebooks
        rcloud.is_notebook_published = function(id, k) {
            rcloud_ocaps.is_notebook_published(id, k);
        };

        rcloud.publish_notebook = function(id, k) {
            rcloud_ocaps.publish_notebook(id, k || _.identity);
        };
        rcloud.unpublish_notebook = function(id, k) {
            rcloud_ocaps.unpublish_notebook(id, k || _.identity);
        };

        // stars
        rcloud.stars = {};
        rcloud.stars.star_notebook = function(id, k) {
            rcloud_ocaps.stars.star_notebook(id, k || _.identity);
        };
        rcloud.stars.unstar_notebook = function(id, k) {
            rcloud_ocaps.stars.unstar_notebook(id, k || _.identity);
        };
        rcloud.stars.is_notebook_starred = function(id, k) {
            rcloud_ocaps.stars.is_notebook_starred(id, k);
        };
        rcloud.stars.get_notebook_star_count = function(id, k) {
            rcloud_ocaps.stars.get_notebook_star_count(id, k);
        };
        rcloud.stars.get_multiple_notebook_star_counts = function(ids, k) {
            rcloud_ocaps.stars.get_multiple_notebook_star_counts(ids, k);
        };
        rcloud.stars.get_my_starred_notebooks = function(k) {
            rcloud_ocaps.stars.get_my_starred_notebooks(k);
        };

    }

    rcloud.authenticated = rcloud_ocaps.authenticated;
    setup_unauthenticated_ocaps();
    if (rcloud.authenticated)
        setup_authenticated_ocaps();

    //////////////////////////////////////////////////////////////////////////
    // Progress indication

    // FIXME this doesn't feel like it belongs on rcloud, but then again,
    // where would it?

    var progress_dialog;
    var progress_counter = 0;
    var allowed = 1;
    var curtains_on = false;

    function set_curtain() {
        if (curtains_on)
            return;
        curtains_on = true;
        if (_.isUndefined(progress_dialog)) {
            progress_dialog = $('<div id="progress-dialog" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-body">Please wait...</div></div></div>');
            $("body").append(progress_dialog);
        }
        progress_dialog.modal({keyboard: true});
    }
    function clear_curtain() {
        if (!curtains_on)
            return;
        curtains_on = false;
        progress_dialog.modal('hide');
    }
    function set_cursor() {
        _.delay(function() {
            document.body.style.cursor = "wait";
        }, 0);
    }
    function clear_cursor() {
        _.delay(function() {
            document.body.style.cursor = '';
        }, 0);
    }
    rcloud.with_progress = function(thunk, delay) {
        if (_.isUndefined(delay))
            delay = 2000;
        set_cursor();
        function done() {
            progress_counter -= 1;
            if (progress_counter === 0) {
                clear_cursor();
                clear_curtain();
            }
        }
        _.delay(function() {
            if (progress_counter > 0 && allowed > 0)
                set_curtain();
        }, delay);
        progress_counter += 1;
        thunk(done);
    };
    rcloud.prevent_progress_modal = function() {
        if (allowed === 1) {
            if (progress_counter > 0) {
                clear_cursor();
                clear_curtain();
            }
        }
        allowed -= 1;
    };
    rcloud.allow_progress_modal = function() {
        if (allowed === 0) {
            if (progress_counter > 0) {
                set_cursor();
                set_curtain();
            }
        }
        allowed += 1;
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

ui_utils.enable_fa_button = function(el) {
    el.removeClass("button-disabled");
};

ui_utils.disable_fa_button = function(el) {
    el.addClass("button-disabled");
};

ui_utils.enable_bs_button = function(el) {
    el.removeClass("disabled");
};

ui_utils.disable_bs_button = function(el) {
    el.addClass("disabled");
};


ui_utils.ace_editor_height = function(widget)
{
    var lineHeight = widget.renderer.lineHeight;
    var rows = Math.min(30, widget.getSession().getLength());
    var newHeight = lineHeight*rows + widget.renderer.scrollBar.getWidth();
    return Math.max(75, newHeight);
    /*
     // patch to remove tooltip when button clicked
     // (not needed anymore with later jquery?)
    var old_click = span.click;
    span.click = function() {
        $(this).tooltip('hide');
        old_click.apply(this, arguments);
    };
     */
};

ui_utils.ace_set_pos = function(widget, row, column) {
    var sel = widget.getSelection();
    var range = sel.getRange();
    range.setStart(row, column);
    range.setEnd(row, column);
    sel.setSelectionRange(range);
}

ui_utils.install_common_ace_key_bindings = function(widget) {
    var Autocomplete = require("ace/autocomplete").Autocomplete;
    var session = widget.getSession();

    widget.commands.addCommands([
        {
            name: 'another autocomplete key',
            bindKey: 'Ctrl-.',
            exec: Autocomplete.startCommand.exec
        },
        {
            name: 'disable gotoline',
            bindKey: {
                win: "Ctrl-L",
                mac: "Command-L"
            },
            exec: function() { return false; }
        }, {
            name: 'execute-selection-or-line',
            bindKey: {
                win: 'Alt-Return',
                mac: 'Alt-Return',
                sender: 'editor'
            },
            exec: function(widget, args, request) {
                var code = session.getTextRange(widget.getSelectionRange());
                if(code.length==0) {
                    var pos = widget.getCursorPosition();
                    var Range = require('ace/range').Range;
                    var range = new Range(pos.row, 0, pos.row+1, 0);
                    code = session.getTextRange(range);
                }
                shell.new_interactive_cell(code, true);
            }
        }
    ]);
}

// bind an ace editor to a listener and return a function to change the
// editor content without triggering that listener
ui_utils.ignore_programmatic_changes = function(widget, listener) {
    var listen = true;
    widget.on('change', function() {
        if(listen)
            listener(widget.getValue());
    });
    return function(value) {
        listen = false;
        var res = widget.setValue(value);
        listen = true;
        return res;
    };
};

ui_utils.twostate_icon = function(item, on_activate, on_deactivate,
                                  active_icon, inactive_icon) {
    function set_state(state) {
        item[0].checked = state;
        var icon = item.find('i');
        if(state) {
            icon.removeClass(inactive_icon);
            icon.addClass(active_icon);
        }
        else {
            icon.removeClass(active_icon);
            icon.addClass(inactive_icon);
        }
    }
    function on_click() {
        var state = !this.checked;
        set_state(state);
        if(state)
            on_activate();
        else
            on_deactivate();
    }
    function enable(val) {
        item.off('click');
        if(val)
            item.click(on_click);
    }
    enable(true);
    return {set_state: set_state, enable: enable};
};

// not that i'm at all happy with the look
ui_utils.checkbox_menu_item = function(item, on_check, on_uncheck) {
    var ret = ui_utils.twostate_icon(item, on_check, on_uncheck,
                                     'icon-check', 'icon-check-empty');
    var base_enable = ret.enable;
    ret.enable = function(val) {
        // bootstrap menu items go in in an <li /> that takes the disabled class
        $("#publish-notebook").parent().toggleClass('disabled', !val);
        base_enable(val);
    };
    return ret;
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
    var enable = ui_utils.enable_fa_button;
    var disable = ui_utils.disable_fa_button;

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
        rcloud.with_progress(function(done) {
            cell_model.controller.execute(function() {
                done();
            });
        });
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
    if (language === 'R') {
        inner_div.addClass("r-language-pseudo");
    } else {
        inner_div.addClass("rmarkdown-language-pseudo");
    }


    // ace_div.css({'background-color': language === 'R' ? "#B1BEA4" : "#F1EDC0"});
    inner_div.append(markdown_div);
    markdown_div.append(ace_div);
    ace.require("ace/ext/language_tools");
    var widget = ace.edit(ace_div[0]);
    var RMode = require(language === 'R' ? "ace/mode/r" : "ace/mode/rmarkdown").Mode;
    var session = widget.getSession();
    widget.setValue(cell_model.content());
    ui_utils.ace_set_pos(widget, 0, 0); // setValue selects all
    // erase undo state so that undo doesn't erase all
    window.setTimeout(function() {
        session.getUndoManager().reset();
    }, 0);
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

    ui_utils.install_common_ace_key_bindings(widget);
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
    }]);
    var change_content = ui_utils.ignore_programmatic_changes(widget, function() {
        cell_model.parent_model.on_dirty();
    });

    var r_result_div = $('<div class="r-result-div"><span style="opacity:0.5">Computing ...</span></div>');
    inner_div.append(r_result_div);

    var current_mode;

    var result = {

        //////////////////////////////////////////////////////////////////////
        // pubsub event handlers

        content_updated: function() {
            var range = widget.getSelection().getRange();
            var changed = change_content(cell_model.content());
            widget.getSelection().setSelectionRange(range);
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

            if (inner_div.find("pre code").length === 0) {
                r_result_div.prepend("<pre><code>" + cell_model.content() + "</code></pre>");
            }

            // fix image width so that retina displays are set correctly
            // FIXME currently assumes that all plots are 72 dpi x 7 inches (which is bad)
            inner_div.find("img")
                .attr("width", "504px");

            // capture deferred knitr results
            inner_div.find("pre code")
                .contents()
                .filter(function() {
                    return this.nodeValue ? this.nodeValue.indexOf(uuid) !== -1 : false;
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
        parent_model: null,
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
                that.set_status_message(r);
                k && k();
            }

            rcloud.record_cell_execution(cell_model);
            if (rcloud.authenticated) {
                rcloud.session_markdown_eval(cell_model.content(), language, false, callback);
            } else {
                rcloud.session_cell_eval(Notebook.part_name(cell_model.id,
                                                            cell_model.language()),
                                         cell_model.language(),
                                         false,
                                         callback);
            }
        },
        set_status_message: function(msg) {
            _.each(cell_model.views, function(view) {
                view.result_updated(msg);
            });
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
    var readonly_ = false;

    function last_id(notebook) {
        if(notebook.length)
            return notebook[notebook.length-1].id;
        else
            return 0;
    }

    function build_cell_change(id, content, language) {
        // unfortunately, yet another workaround because github
        // won't take blank files.  would prefer to make changes
        // a high-level description but i don't see it yet.
        var change = {id: id,
                      language: language};
        if(content === "")
            change.erase = true;
        else
            change.content = content;
        return change;
    }

    /* note, the code below is a little more sophisticated than it needs to be:
       allows multiple inserts or removes but currently n is hardcoded as 1.  */
    return {
        notebook: [],
        views: [], // sub list for cell content pubsub
        dishers: [], // for dirty bit pubsub
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
                changes.push({id: id, content: cell_model.content(), language: cell_model.language()});
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
                changes.push({id: id+j, content: cell_model.content(), language: cell_model.language()});
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
                changes.push({id: this.notebook[x].id,
                              content: this.notebook[x].content(),
                              rename: this.notebook[x].id+n,
                              language: this.notebook[x].language()});
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
            n = n || 1;
            var x = cell_index;
            var changes = [];
            while(x<this.notebook.length && n) {
                if(this.notebook[x].id == id) {
                    _.each(this.views, function(view) {
                        view.cell_removed(that.notebook[x], x);
                    });
                    changes.push({id: id, erase: 1, language: that.notebook[x].language()});
                    this.notebook.splice(x, 1);
                }
                ++id;
                --n;
            }
            return changes;
        },
        update_cell: function(cell_model) {
            return [build_cell_change(cell_model.id, cell_model.content(), cell_model.language())];
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
                                if(content !== null)
                                    changes.push(build_cell_change(that.notebook[index].id,
                                                                   content,
                                                                   that.notebook[index].language()));
                                return changes;
                            },
                            []);
        },
        read_only: function(readonly) {
            if(!_.isUndefined(readonly)) {
                readonly_ = readonly;
                _.each(this.views, function(view) {
                    view.set_readonly(readonly_);
                });
            }
            return readonly_;
        },
        on_dirty: function() {
            _.each(this.dishers, function(disher) {
                disher.on_dirty();
            });
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
    var current_gist_,
        dirty_ = false,
        save_button_ = null,
        save_timer_ = null,
        save_timeout_ = 30000, // 30s
        show_source_checkbox_ = null;

    function append_cell_helper(content, type, id) {
        var cell_model = Notebook.Cell.create_model(content, type);
        var cell_controller = Notebook.Cell.create_controller(cell_model);
        cell_model.controller = cell_controller;
        return {controller: cell_controller, changes: model.append_cell(cell_model, id)};
    }

    function insert_cell_helper(content, type, id) {
        var cell_model = Notebook.Cell.create_model(content, type);
        var cell_controller = Notebook.Cell.create_controller(cell_model);
        cell_model.controller = cell_controller;
        return {controller: cell_controller, changes: model.insert_cell(cell_model, id)};
    }

    function on_load(k, version, notebook) {
        if (!_.isUndefined(notebook.files)) {
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
        }
        k && k(notebook);
    }

    // calculate the changes needed to get back from the newest version in notebook
    // back to what we are presently displaying (current_gist_)
    function find_changes_from(notebook) {
        var changes = [];
        var nf = notebook.files,
            cf = _.extend({}, current_gist_.files); // to keep track of changes
        for(var f in nf) {
            if(f==='r_type' || f==='r_attributes')
                continue; // R metadata
            if(f in cf) {
                if(cf[f].language != nf[f].language || cf[f].content != nf[f].content) {
                    changes.push({id: f,
                                  language: cf[f].language,
                                  content: cf[f].content});
                }
                delete cf[f];
            }
            else changes.push({id: f, erase: true, language: nf[f].language});
        }
        for(f in cf) {
            if(f==='r_type' || f==='r_attributes')
                continue; // artifact of rserve.js
            changes.push({id: f,
                          language: cf[f].language,
                          content: cf[f].content});
        }
        return changes;
    }

    function on_dirty() {
        if(!dirty_) {
            if(save_button_)
                ui_utils.enable_bs_button(save_button_);
            dirty_ = true;
        }
        if(save_timer_)
            window.clearTimeout(save_timer_);
        save_timer_ = window.setTimeout(function() {
            result.save();
            save_timer_ = null;
        }, save_timeout_);
    }

    function setup_show_source() {
        show_source_checkbox_ = ui_utils.checkbox_menu_item($("#show-source"),
           function() {result.show_r_source();},
           function() {result.hide_r_source();});
        show_source_checkbox_.set_state(true);
    }

    setup_show_source();
    model.dishers.push({on_dirty: on_dirty});

    var result = {
        save_button: function(save_button) {
            if(arguments.length) {
                save_button_ = save_button;
            }
            return save_button_;
        },
        append_cell: function(content, type, id) {
            var cch = append_cell_helper(content, type, id);
            this.update_notebook(cch.changes);
            return cch.controller;
        },
        insert_cell: function(content, type, id) {
            var cch = insert_cell_helper(content, type, id);
            this.update_notebook(cch.changes);
            return cch.controller;
        },
        remove_cell: function(cell_model) {
            var changes = model.remove_cell(cell_model);
            shell.prompt_widget.focus(); // there must be a better way
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
            function update_and_load(changes, gistname, k) {
                // force a full reload in all cases, as a sanity check
                // i.e. we might know what the notebook state should be,
                // but load the notebook to make sure
                var k2 = function() {
                    that.load_notebook(gistname, null, k);
                };
                if(changes.length)
                    that.update_notebook(changes, gistname, k2);
                else
                    k2();

            }
            if(is_mine) // revert: get HEAD, calculate changes from there to here, and apply
                rcloud.load_notebook(gistname, null, function(notebook) {
                    var changes = find_changes_from(notebook);
                    update_and_load(changes, gistname, k);
                });
            else // fork:
                rcloud.fork_notebook(gistname, function(notebook) {
                    if(version) {
                        // fork, then get changes from there to where we are in the past, and apply
                        // git api does not return the files on fork, so load
                        rcloud.get_notebook(notebook.id, null, function(notebook2) {
                            var changes = find_changes_from(notebook2);
                            update_and_load(changes, notebook2.id, k);
                        });
                    }
                    else
                        update_and_load([], notebook.id, k);
                });
        },
        update_notebook: function(changes, gistname, k) {
            // remove any "empty" changes.  we can keep empty cells on the
            // screen but github will refuse them.  if the user doesn't enter
            // stuff in them before saving, they will disappear on next session
            changes = changes.filter(function(change) { return !!change.content || change.erase; });
            if(!changes.length)
                return;
            if(model.read_only())
                throw "attempted to update read-only notebook";
            gistname = gistname || shell.gistname();
            function changes_to_gist(changes) {
                // we don't use the gist rename feature because it doesn't
                // allow renaming x -> y and creating a new x at the same time
                // instead, create y and if there is no longer any x, erase it
                var post_names = _.reduce(changes,
                                         function(names, change) {
                                             if(!change.erase) {
                                                 var after = change.rename || change.id;
                                                 names[Notebook.part_name(after, change.language)] = 1;
                                             }
                                             return names;
                                         }, {});
                function xlate_change(filehash, change) {
                    var c = {};
                    if(change.content !== undefined)
                        c.content = change.content;
                    var pre_name = Notebook.part_name(change.id, change.language);
                    if(change.erase || !post_names[pre_name])
                        filehash[pre_name] = null;
                    if(!change.erase) {
                        var post_name = Notebook.part_name(change.rename || change.id, change.language);
                        filehash[post_name] = c;
                    }
                    return filehash;
                }
                return {files: _.reduce(changes, xlate_change, {})};
            }
            // not awesome to callback to someone else here
            k = k || editor.load_callback(null, true, true);
            var k2 = function(notebook) {
                if('error' in notebook) {
                    k(notebook);
                    return;
                }
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
        save: function() {
            if(dirty_) {
                var changes = this.refresh_cells();
                this.update_notebook(changes);
                if(save_button_)
                    ui_utils.disable_bs_button(save_button_);
                dirty_ = false;
            }

        },
        run_all: function(k) {
            this.save();
            var n = model.notebook.length;
            var disp;
            function bump_executed() {
                --n;
                if(disp.length)
                    disp.shift()();
                if (n === 0)
                    k && k();
            }
            _.each(model.notebook, function(cell_model) {
                cell_model.controller.set_status_message("Waiting...");
            });
            // this is silly.
            disp = _.map(model.notebook, function(cell_model) {
                return function() {
                    cell_model.controller.set_status_message("Computing...");
                };
            });
            if(disp.length) {
                disp.shift()();
                _.each(model.notebook, function(cell_model) {
                    cell_model.controller.execute(bump_executed);
                });
            }
            else k && k();
        },

        //////////////////////////////////////////////////////////////////////

        _r_source_visible: true,

        hide_r_source: function() {
            this._r_source_visible = false;
            show_source_checkbox_.set_state(this._r_source_visible);
            Notebook.hide_r_source();
        },
        show_r_source: function() {
            this._r_source_visible = true;
            show_source_checkbox_.set_state(this._r_source_visible);
            Notebook.show_r_source();
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
Notebook.part_name = function(id, language) {
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
};
