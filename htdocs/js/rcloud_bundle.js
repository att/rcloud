// FIXME all RCloud.*.post_error calls should be handled elsewhere

RClient = {
    create: function(opts) {
        opts = _.defaults(opts, {
            debug: false
        });
        function on_connect() {
            if (!rserve.ocap_mode) {
                RCloud.UI.session_pane.post_error(ui_utils.disconnection_error("Expected an object-capability Rserve. Shutting Down!"));
                shutdown();
                return;
            }

            // the rcloud ocap-0 performs the login authentication dance
            // success is indicated by the rest of the capabilities being sent
            rserve.ocap([token, execToken], function(err, ocaps) {
                ocaps = Promise.promisifyAll(ocaps);
                if (ocaps !== null) {
                    result.running = true;
                    /*jshint -W030 */
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
            if (opts.debug) {
                /*jshint -W087 */
                debugger;
            }
            if (opts.on_error && opts.on_error(msg, status_code))
                return;
            RCloud.UI.session_pane.post_error(ui_utils.disconnection_error(msg));
            shutdown();
        }

        function on_close(msg) {
            if (opts.debug) {
                /*jshint -W087 */
                debugger;
            }
            if (!clean) {
                RCloud.UI.session_pane.post_error(ui_utils.disconnection_error("Socket was closed. Goodbye!"));
                shutdown();
            }
        }

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

            post_response: function (msg) {
                var d = $("<pre class='response'></pre>").html(msg);
                $("#output").append(d);
                // not sure what this was for
                //window.scrollTo(0, document.body.scrollHeight);
            },

            post_rejection: function(e) {
                RCloud.UI.session_pane.post_error(e.message);
                throw e;
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

//////////////////////////////////////////////////////////////////////////////
// promisification

RCloud.promisify_paths = (function() {
    function rcloud_handler(command, promise_fn) {
        function success(result) {
            if(result && RCloud.is_exception(result)) {
                throw new Error(command + ": " + result[0].replace('\n', ' '));
            }
            return result;
        }

        return function() {
            return promise_fn.apply(this, arguments).then(success);
        };
    }

    function process_paths(ocaps, paths) {
        function get(path) {
            var v = ocaps;
            for (var i=0; i<path.length; ++i)
                v = v[path[i]];
            return v;
        }

        function set(path, val) {
            var v = ocaps;
            for (var i=0; i<path.length-1; ++i)
                v = v[path[i]];
            v[path[path.length-1] + "Async"] = val;
        }

        _.each(paths, function(path) {
            var fn = get(path);
            set(path, fn ? rcloud_handler(path.join('.'), Promise.promisify(fn)) : null);
        });
        return ocaps;
    }

    return process_paths;
})();

RCloud.create = function(rcloud_ocaps) {
    function rcloud_github_handler(command, promise) {
        function success(result) {
            if (result.ok) {
                return result.content;
            } else {
                var message;
                if(result.content && result.content.message)
                    message = result.content.message;
                else
                    message = "error code " + result.code;
                throw new Error(command + ': ' + message);
            }
        }
        return promise.then(success);
    }

    var rcloud = {};

    function setup_unauthenticated_ocaps() {
        var paths = [
            ["version_info"],
            ["anonymous_session_init"],
            ["prefix_uuid"],
            ["get_conf_value"],
            ["get_notebook"],
            ["load_notebook"],
            ["call_notebook"],
            ["install_notebook_stylesheets"],
            ["get_users"],
            ["log", "record_cell_execution"],
            ["setup_js_installer"],
            ["comments","get_all"],
            ["help"],
            ["debug","raise"],
            ["stars","star_notebook"],
            ["stars","unstar_notebook"],
            ["stars","is_notebook_starred"],
            ["stars","get_notebook_star_count"],
            ["stars","get_multiple_notebook_star_counts"],
            ["stars","get_my_starred_notebooks"],
            ["session_cell_eval"],
            ["reset_session"],
            ["set_device_pixel_ratio"],
            ["api", "enable_echo"],
            ["api", "disable_echo"],
            ["api", "enable_warnings"],
            ["api", "disable_warnings"],
            ["api", "set_url"],
            ["api", "get_url"],
            ["get_notebook_by_name"]
        ];
        RCloud.promisify_paths(rcloud_ocaps, paths);

        rcloud.username = function() {
            return $.cookies.get('user');
        };
        rcloud.github_token = function() {
            return $.cookies.get('token');
        };

        rcloud.version_info = function() {
            return rcloud_ocaps.version_infoAsync.apply(null, arguments);
        };

        rcloud.anonymous_session_init = function() {
            return rcloud_ocaps.anonymous_session_initAsync();
        };

        rcloud.init_client_side_data = function() {
            var that = this;
            return rcloud_ocaps.prefix_uuidAsync().then(function(v) {
                that.deferred_knitr_uuid = v;
            });
        };

        rcloud.get_conf_value = function(key) {
            return rcloud_ocaps.get_conf_valueAsync(key);
        };

        rcloud.get_notebook = function(id, version) {
            return rcloud_github_handler(
                "rcloud.get.notebook " + id,
                rcloud_ocaps.get_notebookAsync(id, version));
        };

        rcloud.load_notebook = function(id, version) {
            return rcloud_github_handler(
                "rcloud.load.notebook " + id,
                rcloud_ocaps.load_notebookAsync(id, version));
        };

        rcloud.call_notebook = function(id, version) {
            return rcloud_github_handler(
                "rcloud.call.notebook " + id,
                rcloud_ocaps.call_notebookAsync(id, version));
        };

        rcloud.install_notebook_stylesheets = function() {
            return rcloud_ocaps.install_notebook_stylesheetsAsync();
        };

        rcloud.help = function(topic) {
            return rcloud_ocaps.helpAsync(topic).then(function(found) {
                if(!found)
                    RCloud.UI.help_frame.display_content("<h2>No help found for <em>" + topic + "</em></h2>");
            });
        };

        rcloud.get_users = function() {
            return rcloud_ocaps.get_usersAsync();
        };

        rcloud.record_cell_execution = function(cell_model) {
            var json_rep = JSON.stringify(cell_model.json());
            return rcloud_ocaps.log.record_cell_executionAsync(rcloud.username(), json_rep);
        };

        // javascript.R
        rcloud.setup_js_installer = function(v) {
            return rcloud_ocaps.setup_js_installerAsync(v);
        };

        // having this naked eval here makes me very nervous.
        rcloud.modules = {};
        rcloud.setup_js_installer({
            install_js: function(name, content, k) {
                try {
                    /*jshint -W061 */
                    var result = eval(content);
                    rcloud.modules[name] = result;
                    k(null, result);
                } catch (e) {
                    Promise.reject(e); // print error
                    var v = { "type": e.name,
                              "message": e.message
                            };
                    k(v, null);
                }
            },
            clear_css: function(current_notebook, k) {
                $(".rcloud-user-defined-css").remove();
                k(null, null);
            },
            install_css: function(urls, k) {
                if (_.isString(urls))
                    urls = [urls];
                _.each(urls, function(url) {
                    $("head").append($('<link type="text/css" rel="stylesheet" class="rcloud-user-defined-css" href="' +
                                       url + '"/>'));
                });
                k(null, null);
            }
        });

        // notebook.comments.R
        rcloud.get_all_comments = function(id) {
            return rcloud_ocaps.comments.get_allAsync(id);
        };

        // debugging ocaps
        rcloud.debug = {};
        rcloud.debug.raise = function(msg) {
            return rcloud_ocaps.debug.raiseAsync(msg);
        };

        // stars
        rcloud.stars = {};
        rcloud.stars.is_notebook_starred = function(id) {
            return rcloud_ocaps.stars.is_notebook_starredAsync(id);
        };
        rcloud.stars.get_notebook_star_count = function(id) {
            return rcloud_ocaps.stars.get_notebook_star_countAsync(id);
        };
        rcloud.stars.get_multiple_notebook_star_counts = function(id) {
            return rcloud_ocaps.stars.get_multiple_notebook_star_countsAsync(id);
        };

        rcloud.session_cell_eval = function(filename, language, silent) {
            return rcloud_ocaps.session_cell_evalAsync(filename, language, silent);
        };

        rcloud.reset_session = function() {
            return rcloud_ocaps.reset_sessionAsync();
        };

        rcloud.display = {};
        var cached_device_pixel_ratio;
        rcloud.display.set_device_pixel_ratio = function() {
            cached_device_pixel_ratio = window.devicePixelRatio;
            return rcloud_ocaps.set_device_pixel_ratioAsync(window.devicePixelRatio);
        };
        rcloud.display.get_device_pixel_ratio = function() {
            return cached_device_pixel_ratio;
        };

        rcloud.get_notebook_by_name = function(user, path) {
            return rcloud_ocaps.get_notebook_by_nameAsync(user, path);
        };

        ////////////////////////////////////////////////////////////////////////////////
        // access the runtime API in javascript as well

        rcloud.api = {};
        rcloud.api.disable_warnings = function() {
            return rcloud_ocaps.api.disable_warningsAsync();
        };
        rcloud.api.enable_warnings = function() {
            return rcloud_ocaps.api.enable_warningsAsync();
        };
        rcloud.api.disable_echo = function() {
            return rcloud_ocaps.api.disable_echoAsync();
        };
        rcloud.api.enable_echo = function() {
            return rcloud_ocaps.api.enable_echoAsync();
        };
        rcloud.api.set_url = function(url) {
            return rcloud_ocaps.api.set_urlAsync(url);
        };
        rcloud.api.get_url = function() {
            return rcloud_ocaps.api.get_urlAsync();
        };
    }

    function setup_authenticated_ocaps() {
        var paths = [
            ["session_init"],
            ["search"],
            ["update_notebook"],
            ["create_notebook"],
            ["fork_notebook"],
            ["port_notebooks"],
            ["purl_source"],
            ["get_completions"],
            ["rename_notebook"],
            ["authenticated_cell_eval"],
            ["session_markdown_eval"],
            ["notebook_upload"],
            ["file_upload","upload_path"],
            ["file_upload","create"],
            ["file_upload","write"],
            ["file_upload","close"],
            ["comments","post"],
            ["comments","modify"],
            ["comments","delete"],
            ["is_notebook_published"],
            ["publish_notebook"],
            ["unpublish_notebook"],
            ["set_notebook_visibility"],
            ["api","disable_warnings"],
            ["api","enable_echo"],
            ["api","disable_warnings"],
            ["api","enable_echo"],
            ["config", "all_notebooks"],
            ["config", "all_notebooks_multiple_users"],
            ["config", "add_notebook"],
            ["config", "remove_notebook"],
            ["config", "get_current_notebook"],
            ["config", "set_current_notebook"],
            ["config", "new_notebook_number"],
            ["config", "get_recent_notebooks"],
            ["config", "set_recent_notebook"],
            ["config", "clear_recent_notebook"],
            ["config", "get_user_option"],
            ["config", "set_user_option"],
            ["get_notebook_info"],
            ["get_multiple_notebook_infos"],
            ["set_notebook_info"],
            ["notebook_by_name"]
        ];
        RCloud.promisify_paths(rcloud_ocaps, paths);

        rcloud.session_init = function(username, token) {
            return rcloud_ocaps.session_initAsync(username, token);
        };

        rcloud.update_notebook = function(id, content) {
            return rcloud_github_handler(
                "rcloud.update.notebook",
                rcloud_ocaps.update_notebookAsync(id, JSON.stringify(content)));
        };

        rcloud.search = rcloud_ocaps.searchAsync; // may be null

        rcloud.create_notebook = function(content) {
            return rcloud_github_handler(
                "rcloud.create.notebook",
                rcloud_ocaps.create_notebookAsync(JSON.stringify(content)));
        };
        rcloud.fork_notebook = function(id) {
            return rcloud_github_handler(
                "rcloud.fork.notebook",
                rcloud_ocaps.fork_notebookAsync(id));
        };
        rcloud.port_notebooks = function(source, notebooks, prefix) {
            return rcloud_ocaps.port_notebooksAsync(source, notebooks, prefix);
        };
        rcloud.purl_source = function(source) {
            return rcloud_ocaps.purl_sourceAsync(source);
        };

        rcloud.get_completions = function(text, pos) {
            return rcloud_ocaps.get_completionsAsync(text, pos)
                .then(function(comps) {
                    if (_.isString(comps))
                        comps = [comps]; // quirk of rserve.js scalar handling
                    // convert to the record format ace.js autocompletion expects
                    // meta is what gets displayed at right; name & score might be improved
                    return _.map(comps,
                                 function(comp) {
                                     return {meta: "local",
                                             name: "library",
                                             score: 3,
                                             value: comp
                                            };
                                 });
                });
        };

        rcloud.rename_notebook = function(id, new_name) {
            return rcloud_github_handler(
                "rcloud.rename.notebook",
                rcloud_ocaps.rename_notebookAsync(id, new_name));
        };
        rcloud.authenticated_cell_eval = function(command, language, silent) {
            return rcloud_ocaps.authenticated_cell_evalAsync(command, language, silent);
        };
        rcloud.session_markdown_eval = function(command, language, silent) {
            return rcloud_ocaps.session_markdown_evalAsync(command, language, silent);
        };

        rcloud.post_comment = function(id, content) {
            return rcloud_github_handler(
                "rcloud.post.comment",
                rcloud_ocaps.comments.postAsync(id, content));
        };

        rcloud.modify_comment = function(id, cid, content) {
            return rcloud_ocaps.comments.modifyAsync(id, cid,content);
        };

        rcloud.delete_comment = function(id, cid) {
            return rcloud_ocaps.comments.deleteAsync(id, cid);
        };

        // publishing notebooks
        rcloud.is_notebook_published = function(id) {
            return rcloud_ocaps.is_notebook_publishedAsync(id);
        };

        rcloud.publish_notebook = function(id) {
            return rcloud_ocaps.publish_notebookAsync(id);
        };
        rcloud.unpublish_notebook = function(id) {
            return rcloud_ocaps.unpublish_notebookAsync(id);
        };

        rcloud.set_notebook_visibility = function(id, value) {
            return rcloud_ocaps.set_notebook_visibilityAsync(id, value);
        };

        // stars
        rcloud.stars = {};
        rcloud.stars.star_notebook = function(id) {
            return rcloud_ocaps.stars.star_notebookAsync(id);
        };
        rcloud.stars.unstar_notebook = function(id) {
            return rcloud_ocaps.stars.unstar_notebookAsync(id);
        };
        rcloud.stars.is_notebook_starred = function(id) {
            return rcloud_ocaps.stars.is_notebook_starredAsync(id);
        };
        rcloud.stars.get_notebook_star_count = function(id) {
            return rcloud_ocaps.stars.get_notebook_star_countAsync(id);
        };
        rcloud.stars.get_multiple_notebook_star_counts = function(ids) {
            return rcloud_ocaps.stars.get_multiple_notebook_star_countsAsync(ids);
        };
        rcloud.stars.get_my_starred_notebooks = function() {
            return rcloud_ocaps.stars.get_my_starred_notebooksAsync();
        };

        // config
        rcloud.config = {
            all_notebooks: rcloud_ocaps.config.all_notebooksAsync,
            all_notebooks_multiple_users: rcloud_ocaps.config.all_notebooks_multiple_usersAsync,
            add_notebook: rcloud_ocaps.config.add_notebookAsync,
            remove_notebook: rcloud_ocaps.config.remove_notebookAsync,
            get_current_notebook: rcloud_ocaps.config.get_current_notebookAsync,
            set_current_notebook: rcloud_ocaps.config.set_current_notebookAsync,
            new_notebook_number: rcloud_ocaps.config.new_notebook_numberAsync,
            get_recent_notebooks: rcloud_ocaps.config.get_recent_notebooksAsync,
            set_recent_notebook: rcloud_ocaps.config.set_recent_notebookAsync,
            clear_recent_notebook: rcloud_ocaps.config.clear_recent_notebookAsync,
            get_user_option: rcloud_ocaps.config.get_user_optionAsync,
            set_user_option: rcloud_ocaps.config.set_user_optionAsync
        };

        // notebook cache
        rcloud.get_notebook_info = rcloud_ocaps.get_notebook_infoAsync;
        rcloud.get_multiple_notebook_infos = rcloud_ocaps.get_multiple_notebook_infosAsync;
        rcloud.set_notebook_info = function(id, info) {
            if(!info.username) return Promise.reject(new Error("attempt to set info no username"));
            if(!info.description) return Promise.reject(new Error("attempt to set info no description"));
            if(!info.last_commit) return Promise.reject(new Error("attempt to set info no last_commit"));
            return rcloud_ocaps.set_notebook_infoAsync(id, info);
        };

        rcloud.get_notebook_by_name = function(user, path) {
            return rcloud_ocaps.notebook_by_nameAsync(user, path);
        };
    }

    rcloud._ocaps = rcloud_ocaps;
    rcloud.authenticated = rcloud_ocaps.authenticated;
    setup_unauthenticated_ocaps();
    if (rcloud.authenticated)
        setup_authenticated_ocaps();

    return rcloud;
};
var ui_utils = {};

ui_utils.disconnection_error = function(msg, label) {
    var result = $("<div class='alert alert-danger'></div>");
    result.append($("<span></span>").text(msg));
    label = label || "Reconnect";
    var button = $("<button type='button' class='close'>" + label + "</button>");
    result.append(button);
    button.click(function() {
        window.location =
            (window.location.protocol +
            '//' + window.location.host +
            '/login.R?redirect=' +
            encodeURIComponent(window.location.pathname + window.location.search));
    });
    return result;
};

ui_utils.string_error = function(msg) {
    var button = $("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>");
    var result = $("<div class='alert alert-danger alert-dismissable'></div>");
    // var text = $("<span></span>");

    result.append(button);
    var text = _.map(msg.split("\n"), function(str) {
        // poor-man replacing 4 spaces with indent
        var el = $("<div></div>").text(str), match;
        if ((match = str.match(/^( {4})+/))) {
            var indent = match[0].length / 4;
            el.css("left", indent +"em");
            el.css("position", "relative");
        }
        return el;
    });
    result.append(text);
    return result;
};

/*
 * if container_is_self is true, then the html container of the tooltip is the element
 * itself (which is the default for bootstrap but doesn't work very well for us
 * because of z-index issues).
 *
 * On the other hand, if *all* containers are the html body, then this happens:
 *
 * https://github.com/att/rcloud/issues/525
 */
ui_utils.fa_button = function(which, title, classname, style, container_is_self)
{
    var icon = $.el.i({'class': which});
    var span = $.el.span({'class': 'fontawesome-button ' + (classname || '')},
                        icon);
    if(style) {
        for (var k in style)
            icon.style[k] = style[k];
    }
    // $(icon).css(style);
    var opts = {
        title: title,
        delay: { show: 250, hide: 0 }
    };
    if (!container_is_self) {
        opts.container = 'body';
    }
    return $(span).tooltip(opts);
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


ui_utils.ace_editor_height = function(widget, min_rows, max_rows)
{
    min_rows = _.isUndefined(min_rows) ? 0  : min_rows;
    max_rows = _.isUndefined(max_rows) ? 30 : max_rows;
    var lineHeight = widget.renderer.lineHeight;
    var rows = Math.max(min_rows, Math.min(max_rows, widget.getSession().getScreenLength()));
    var newHeight = lineHeight*rows + widget.renderer.scrollBar.getWidth();
    return Math.max(75, newHeight);
};

ui_utils.ace_set_pos = function(widget, row, column) {
    var sel = widget.getSelection();
    var range = sel.getRange();
    range.setStart(row, column);
    range.setEnd(row, column);
    sel.setSelectionRange(range);
};

ui_utils.install_common_ace_key_bindings = function(widget, get_language) {
    var Autocomplete = ace.require("ace/autocomplete").Autocomplete;
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
                win: 'Ctrl-Return',
                mac: 'Command-Return',
                sender: 'editor'
            },
            exec: function(widget, args, request) {
                if (widget.getOption("readOnly"))
                    return;
                var code = session.getTextRange(widget.getSelectionRange());
                if(code.length===0) {
                    var pos = widget.getCursorPosition();
                    var Range = ace.require('ace/range').Range;
                    var range = new Range(pos.row, 0, pos.row+1, 0);
                    code = session.getTextRange(range);
                    widget.navigateDown(1);
                    widget.navigateLineEnd();
                }
                shell.new_cell(code, get_language(), true);
            }
        }
    ]);
};

ui_utils.character_offset_of_pos = function(widget, pos) {
    // surprising this is not built-in.  this adapted from
    // https://groups.google.com/forum/#!msg/ace-discuss/-RVHHWZGkk8/blFQz0TcPf8J
    var session = widget.getSession(), doc = session.getDocument();
    var nlLength = doc.getNewLineCharacter().length;
    var text = doc.getAllLines();
    if(pos.row>text.length)
        throw new Error("getting position off end of editor");
    var ret = 0, i;
    for(i=0; i<pos.row; i++)
        ret += text[i].length + nlLength;
    ret += pos.column;
    return ret;
};

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

ui_utils.set_ace_readonly = function(widget, readonly) {
    // a better way to set non-interactive readonly
    // https://github.com/ajaxorg/ace/issues/266
    widget.setOptions({
        readOnly: readonly,
        highlightActiveLine: !readonly,
        highlightGutterLine: !readonly
    });
    widget.renderer.$cursorLayer.element.style.opacity = readonly?0:1;
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
    var dom = ace.require("ace/lib/dom");
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

// the existing jQuery editable libraries don't seem to do what we need, with
// different active and inactive text, and customized selection.
// this is a vague imitation of what a jquery.ui library might look like
// except without putting it into $ namespace
ui_utils.editable = function(elem$, command) {
    function selectRange(range) {
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
    function options() {
        return elem$.data('__editable');
    }
    function encode(s) {
        return s.replace(/  /g, ' \xa0'); // replace every space with nbsp
    }
    function decode(s) {
        return s.replace(/\xa0/g,' '); // replace nbsp's with spaces
    }

    var old_opts = options(),
        new_opts = old_opts;
    if(_.isObject(command)) {
        var defaults;
        if(old_opts)
            defaults = $.extend({}, old_opts);
        else
            defaults = {
                on_change: function() { return true; },
                allow_edit: true,
                inactive_text: elem$.text(),
                active_text: elem$.text(),
                select: function(el) {
                    var range = document.createRange();
                    range.selectNodeContents(el);
                    return range;
                }
            };
        new_opts = $.extend(defaults, command);
        elem$.data('__editable', new_opts);
    }
    else {
        if(command !== 'destroy' && !old_opts)
            throw new Error('expected already editable for command ' + command);
        var set_option = function(key, value) {
            old_opts = $.extend({}, old_opts);
            new_opts[key] = value;
        };
        switch(command) {
        case 'destroy':
            elem$.data('__editable', null);
            new_opts = null;
            break;
        case 'option':
            if(!arguments[2])
                return old_opts;
            else if(!arguments[3])
                return old_opts[arguments[2]];
            else {
                set_option(arguments[2], arguments[3]);
            }
            break;
        case 'disable':
            set_option('allow_edit', false);
            break;
        case 'enable':
            set_option('allow_edit', true);
            break;
        }
    }
    var action = null;
    if((!old_opts || !old_opts.allow_edit) && (new_opts && new_opts.allow_edit))
        action = 'melt';
    else if((old_opts && old_opts.allow_edit) && (!new_opts || !new_opts.allow_edit))
        action = 'freeze';

    if(new_opts)
        elem$.text(encode(options().__active ? new_opts.active_text : new_opts.inactive_text));

    switch(action) {
    case 'freeze':
        elem$.attr('contenteditable', 'false');
        elem$.off('keydown');
        elem$.off('focus');
        elem$.off('click');
        elem$.off('blur');
        break;
    case 'melt':
        elem$.attr('contenteditable', 'true');
        elem$.focus(function() {
            if(!options().__active) {
                options().__active = true;
                elem$.text(encode(options().active_text));
                window.setTimeout(function() {
                    selectRange(options().select(elem$[0]));
                    elem$.off('blur');
                    elem$.blur(function() {
                        elem$.text(encode(options().inactive_text));
                        options().__active = false;
                    }); // click-off cancels
                }, 10);
            }
        });
        elem$.click(function(e) {
            e.stopPropagation();
            // allow default action but don't bubble (causing eroneous reselection in notebook tree)
        });
        elem$.keydown(function(e) {
            if(e.keyCode === 13) {
                e.preventDefault();
                var result = elem$.text();
                result = decode(result);
                if(options().validate(result)) {
                    options().__active = false;
                    elem$.off('blur'); // don't cancel!
                    elem$.blur();
                    options().change(result);
                }
                else return false; // don't let CR through!
            }
            else if(e.keyCode === 27)
                elem$.blur(); // and cancel
            return true;
        });
        break;
    }
};

ui_utils.on_next_tick = function(f) {
    window.setTimeout(f, 0);
};

ui_utils.add_ace_grab_affordance = function(element) {
    var sel = $(element).children().filter(".ace_gutter");
    var div = $("<div class='grab-affordance' style='position:absolute;top:0px'><object data='/img/grab_affordance.svg' type='image/svg+xml'></object></div>");
    sel.append(div);
};

ui_utils.scroll_to_after = function($sel, duration) {
    // no idea why the plugin doesn't take current scroll into account when using
    // the element parameter version
    if ($sel.length === 0)
        return;
    var opts;
    if(duration !== undefined)
        opts = {animation: {duration: duration}};
    var $parent = $sel.parent();
    var y = $parent.scrollTop() + $sel.position().top +  $sel.outerHeight();
    $parent.scrollTo(null, y, opts);
};

ui_utils.prevent_backspace = function($doc) {
    // Prevent the backspace key from navigating back.
    // from http://stackoverflow.com/a/2768256/676195
    $doc.unbind('keydown').bind('keydown', function (event) {
        var doPrevent = false;
        if (event.keyCode === 8) {
            var d = event.srcElement || event.target;
            if((d.tagName.toUpperCase() === 'INPUT' &&
                (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' ||
                 d.type.toUpperCase() === 'FILE' || d.type.toUpperCase() === 'EMAIL' )) ||
               d.tagName.toUpperCase() === 'TEXTAREA' ||
               d.contentEditable) {
                doPrevent = d.readOnly || d.disabled;
            }
            else {
                doPrevent = true;
            }
        }

        if(doPrevent)
            event.preventDefault();
    });
};
var bootstrap_utils = {};

bootstrap_utils.alert = function(opts)
{
    opts = _.defaults(opts || {}, {
        close_button: true,
        on_close: function() {}
    });
    var div = $('<div class="alert"></div>');
    if (opts.html) div.html(opts.html);
    if (opts.text) div.text(opts.text);
    if (opts['class']) div.addClass(opts['class']);
    if (opts.close_button)
        div.prepend($('<button type="button" class="close" data-dismiss="alert">&times;</button>').click(opts.on_close));
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
Notebook.Buffer = {};
Notebook.Cell = {};
Notebook.Asset = {};
Notebook.Buffer.create_model = function(content, language) {
    // by default, consider this a new cell
    var checkpoint_ = "";

    function is_empty(text) {
        return Notebook.empty_for_github(text);
    }

    var result = {
        views: [], // sub list for pubsub
        parent_model: null,

        renew_content: function() {
            // make content look new again, e.g. to reinsert cell
            checkpoint_ = "";
        },
        content: function(new_content) {
            if (!_.isUndefined(new_content)) {
                if(content !== new_content) {
                    content = new_content;
                    this.notify_views(function(view) {
                        view.content_updated();
                    });
                    return content;
                }
                else return null;
            }
            return content;
        },
        language: function(new_language) {
            if (!_.isUndefined(new_language)) {
                if(language !== new_language) {
                    language = new_language;
                    this.notify_views(function(view) {
                        view.language_updated();
                    });
                    return language;
                }
                else return null;
            }
            if(language === undefined)
                throw new Error("tried to read no language");
            else if(language === null)
                return 'Text'; // Github considers null a synonym for Text; nip that in the bud
            return language;
        },
        change_object: function(obj) {
            if(obj.content)
                throw new Error("content must come from the object");
            if(!obj.filename)
                throw new Error("change object must have filename");
            var change = {filename: obj.filename};

            // github treats any content which is only whitespace or empty as an erase.
            // so we have to transform our requests to accommodate that.
            // note: any change without content, erase, or rename is a no-op.
            if(obj.erase)
                change.erase = !is_empty(checkpoint_);
            else if(obj.rename) {
                if(is_empty(content)) {
                    if(!is_empty(checkpoint_))
                        change.erase = true; // stuff => empty: erase
                    // else empty => empty: no-op
                    // no content either way
                }
                else {
                    if(is_empty(checkpoint_))
                        change.filename = obj.rename; // empty => stuff: create
                    else
                        change.rename = obj.rename; // stuff => stuff: rename
                    change.content = content;
                }
            }
            else { // change content
                if(!is_empty(content)) {
                    if(content != checkpoint_) // * => stuff: create/modify
                        change.content = content;
                    // we need to remember creates for one round
                    // (see notebook_controller's update_notebook)
                    if(is_empty(checkpoint_))
                        change.create = true;
                    // else no-op
                }
                else {
                    if(!is_empty(checkpoint_))
                        change.erase = true; // stuff => empty: erase
                    // else empty => empty: no-op
                }
            }

            // every time we get a change_object it's in order to send it to
            // github.  so we can assume that the cell has been checkpointed
            // whenever we create a change object.
            // it would be nice to verify this somehow, but for now
            // only notebook_model creates change_objects
            // and only notebook_controller consumes them
            checkpoint_ = content;
            return change;
        },
        notify_views: function(f) {
            _.each(this.views, function(view) {
                f(view);
            });
        }
    };
    return result;
};
Notebook.Asset.create_html_view = function(asset_model)
{
    var filename_div = $("<li></li>");
    var anchor = $("<a href='#'></a>");
    var filename_span = $("<span  style='cursor:pointer'>" + asset_model.filename() + "</span>");
    var remove = ui_utils.fa_button("icon-remove", "remove", '',
                                    { 'position': 'relative',
                                        'left': '2px',
                                        'opacity': '0.75'
                                    }, true);
    anchor.append(filename_span);
    filename_div.append(anchor);
    anchor.append(remove);
    var asset_old_name = filename_span.text();
    var rename_file = function(v){
        var new_asset_name = filename_span.text();
        var old_asset_content = asset_model.content();
        if (Notebook.is_part_name(new_asset_name)) {
            alert("Asset names cannot start with 'part[0-9]', sorry!");
            filename_span.text(asset_old_name);
            return;
        }
        var found = shell.notebook.model.has_asset(new_asset_name);
        if (found){
            filename_span.text(asset_old_name);
            found.controller.select();
        }
        else {
            shell.notebook.controller
            .append_asset(old_asset_content, new_asset_name)
            .then(function (controller) {
                controller.select();
            });
            asset_model.controller.remove(true);
        }
    };
    function select(el) {
        if(el.childNodes.length !== 1 || el.firstChild.nodeType != el.TEXT_NODE)
            throw new Error('expecting simple element with child text');
        var text = el.firstChild.textContent;
        var range = document.createRange();
        range.setStart(el.firstChild, 0);
        range.setEnd(el.firstChild, (text.lastIndexOf('.')>0?text.lastIndexOf('.'):text.length));
        return range;
    }
    var editable_opts = {
        change: rename_file,
        select: select,
        validate: function(name) { return editor.validate_name(name); }
    };
    if(!shell.notebook.model.read_only())
        ui_utils.editable(filename_span, $.extend({allow_edit: true,inactive_text: filename_span.text(),active_text: filename_span.text()},editable_opts));
    filename_span.click(function() {
        if(!asset_model.active())
            asset_model.controller.select();
    });
    remove.click(function() {
        asset_model.controller.remove();
    });
    var result = {
        filename_updated: function() {
            anchor.text(asset_model.filename());
        },
        content_updated: function() {
            if(asset_model.active())
                RCloud.UI.scratchpad.content_updated();
        },
        language_updated: function() {
            if(asset_model.active())
                RCloud.UI.scratchpad.language_updated();
        },
        active_updated: function() {
            if (asset_model.active())
                filename_div.addClass("active");
            else
                filename_div.removeClass("active");
        },
        self_removed: function() {
            filename_div.remove();
        },
        set_readonly: function(readonly) {
            if(readonly)
                remove.hide();
            else
                remove.show();
        },
        div: function() {
            return filename_div;
        }
    };
    return result;
};
Notebook.Asset.create_model = function(content, filename)
{
    var cursor_position_;
    var active_ = false;
    var result = Notebook.Buffer.create_model(content);
    var base_change_object = result.change_object;

    _.extend(result, {
        active: function(new_active) {
            if (!_.isUndefined(new_active)) {
                if(active_ !== new_active) {
                    active_ = new_active;
                    this.notify_views(function(view) {
                        view.active_updated();
                    });
                    return active_;
                } else {
                    return null;
                }
            }
            return active_;
        },
        cursor_position: function(new_cursor_position) {
            if (!_.isUndefined(new_cursor_position))
                cursor_position_ = new_cursor_position;
            return cursor_position_;
        },
        filename: function(new_filename) {
            if (!_.isUndefined(new_filename)) {
                if(filename != new_filename) {
                    filename = new_filename;
                    this.notify_views(function(view) {
                        view.filename_updated();
                    });
                    return filename;
                }
                else return null;
            }
            return filename;
        },
        json: function() {
            return {
                content: content,
                filename: this.filename(),
                language: this.language()
            };
        },
        change_object: function(obj) {
            obj = obj || {};
            obj.filename = obj.filename || this.filename();
            return base_change_object.call(this, obj);
        }
    });
    return result;
};
Notebook.Asset.create_controller = function(asset_model)
{
    var result = {
        select: function() {
            // a little ugly here...
            if (RCloud.UI.scratchpad.current_model) {
                RCloud.UI.scratchpad.current_model.controller.deselect();
            }
            asset_model.active(true);
            RCloud.UI.scratchpad.set_model(asset_model);
        },
        deselect: function() {
            asset_model.active(false);
        },
        remove: function(force) {
            var msg = "Are you sure you want to remove the asset from the notebook?";
            if (force || confirm(msg)) {
                asset_model.parent_model.controller.remove_asset(asset_model);
                var assets = asset_model.parent_model.assets;
                if (assets.length)
                    assets[0].controller.select();
                else {
                    RCloud.UI.scratchpad.set_model(null);
                }
            }
        }
    };
    return result;
};
(function() {

var languages = {
    "R": { 'background-color': "#E8F1FA",
           'ace_mode': "ace/mode/r" },
    "Markdown": { 'background-color': "#F7EEE4",
                  'ace_mode': "ace/mode/rmarkdown" },
    "Python": { 'background-color': "#E8F1FA",
                'ace_mode': "ace/mode/python" }
    // ,
    // "Bash": { 'background-color': "#00ff00" }
};

var non_language = { 'background-color': '#dddddd',
                     'ace_mode': 'ace/mode/text' };

function create_markdown_cell_html_view(language) { return function(cell_model) {
    var EXTRA_HEIGHT = 27;
    var notebook_cell_div  = $("<div class='notebook-cell'></div>");
    update_div_id();
    notebook_cell_div.data('rcloud.model', cell_model);

    //////////////////////////////////////////////////////////////////////////
    // button bar

    var insert_cell_button = ui_utils.fa_button("icon-plus-sign", "insert cell");
    var join_button = ui_utils.fa_button("icon-link", "join cells");
    var source_button = ui_utils.fa_button("icon-edit", "source");
    var result_button = ui_utils.fa_button("icon-picture", "result");
    var split_button = ui_utils.fa_button("icon-unlink", "split cell");
    var remove_button = ui_utils.fa_button("icon-trash", "remove");
    var run_md_button = ui_utils.fa_button("icon-play", "run");
    var gap = $('<div/>').html('&nbsp;').css({'line-height': '25%'});

    function update_model() {
        return cell_model.content(widget.getSession().getValue());
    }
    function update_div_id() {
        notebook_cell_div.attr('id', Notebook.part_name(cell_model.id(), cell_model.language()));
    }
    function set_widget_height() {
        notebook_cell_div.css({'height': (ui_utils.ace_editor_height(widget) + EXTRA_HEIGHT) + "px"});
    }
    var enable = ui_utils.enable_fa_button;
    var disable = ui_utils.disable_fa_button;

    var has_result = false;

    insert_cell_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            shell.insert_markdown_cell_before(cell_model.id());
        }
    });
    join_button.click(function(e) {
        join_button.tooltip('destroy');
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            shell.join_prior_cell(cell_model);
        }
    });
    split_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            var range = widget.getSelection().getRange();
            var point1, point2;
            point1 = ui_utils.character_offset_of_pos(widget, range.start);
            if(!range.isEmpty())
                point2 = ui_utils.character_offset_of_pos(widget, range.end);
            shell.split_cell(cell_model, point1, point2);
        }
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

        RCloud.UI.with_progress(function() {
            return cell_model.controller.execute();
        });
    }
    run_md_button.click(function(e) {
        execute_cell();
    });
    var cell_status = $("<div class='cell-status'></div>");
    var button_float = $("<div class='cell-controls'></div>");
    cell_status.append(button_float);
    cell_status.append($("<div style='clear:both;'></div>"));
    var col = $('<table/>').append('<tr/>');
    var select_lang = $("<select class='form-control'></select>");
    function add_language_selector(lang) {
        languages[lang].element = $("<option></option>").text(lang);
        select_lang.append(languages[lang].element);
    }
    _.each(languages, function(value, key) {
        add_language_selector(key);
    });
    if(!languages[language]) { // unknown language: add it
        languages[language] = _.clone(non_language);
        add_language_selector(language);
    }
    var lang_info = languages[language];
    $(lang_info.element).attr('selected', true);
    select_lang.on("change", function() {
        var l = select_lang.find("option:selected").text();
        cell_model.parent_model.controller.change_cell_language(cell_model, l);
        result.clear_result();
    });

    col.append($("<div></div>").append(select_lang));
    $.each([run_md_button, source_button, result_button, gap, split_button, remove_button],
           function() {
               col.append($('<td/>').append($(this)));
           });

    button_float.append(col);
    notebook_cell_div.append(cell_status);

    var insert_button_float = $("<div class='cell-insert-control'></div>");
    insert_button_float.append(join_button);
    insert_button_float.append(insert_cell_button);
    notebook_cell_div.append(insert_button_float);

    //////////////////////////////////////////////////////////////////////////

    var inner_div = $("<div></div>");
    var clear_div = $("<div style='clear:both;'></div>");
    notebook_cell_div.append(inner_div);
    notebook_cell_div.append(clear_div);

    var outer_ace_div = $('<div class="outer-ace-div"></div>');

    var ace_div = $('<div style="width:100%; height:100%;"></div>');
    ace_div.css({ 'background-color': lang_info["background-color"] });

    inner_div.append(outer_ace_div);
    outer_ace_div.append(ace_div);
    ace.require("ace/ext/language_tools");
    var widget = ace.edit(ace_div[0]);
    var RMode = ace.require(language === 'R' ? "ace/mode/r" : "ace/mode/rmarkdown").Mode;
    var session = widget.getSession();
    widget.setValue(cell_model.content());
    ui_utils.ace_set_pos(widget, 0, 0); // setValue selects all
    // erase undo state so that undo doesn't erase all
    ui_utils.on_next_tick(function() {
        session.getUndoManager().reset();
    });
    var doc = session.doc;
    var am_read_only = "unknown";
    widget.setOptions({
        enableBasicAutocompletion: true
    });
    session.setMode(new RMode(false, doc, session));
    session.on('change', function() {
        set_widget_height();
        widget.resize();
    });

    widget.setTheme("ace/theme/chrome");
    session.setUseWrapMode(true);
    widget.resize();

    ui_utils.add_ace_grab_affordance(widget.container);

    ui_utils.install_common_ace_key_bindings(widget, function() {
        return language;
    });
    widget.commands.addCommands([{
        name: 'sendToR',
        bindKey: {
            win: 'Alt-Return',
            mac: 'Alt-Return',
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
            // note: it's inconsistent, but not clearing the result for every
            // change, just particular ones, because one may want to refer to
            // the result if just typing but seems unlikely for other changes
            var range = widget.getSelection().getRange();
            var changed = change_content(cell_model.content());
            widget.getSelection().setSelectionRange(range);
            return changed;
        },
        self_removed: function() {
            notebook_cell_div.remove();
        },
        id_updated: update_div_id,
        language_updated: function() {
            language = cell_model.language();
            lang_info = languages[language];
            if(!lang_info) throw new Error("tried to set language to unknown language " + language);
            ace_div.css({ 'background-color': lang_info["background-color"] });
            select_lang.val(cell_model.language());
        },
        result_updated: function(r) {
            has_result = true;
            r_result_div.hide();
            r_result_div.html(r);
            r_result_div.slideDown(150);

            // There's a list of things that we need to do to the output:
            var uuid = rcloud.deferred_knitr_uuid;

            if (cell_model.language() === 'R' && inner_div.find("pre code").length === 0) {
                r_result_div.prepend("<pre><code class='r'>" + cell_model.content() + "</code></pre>");
            }

            // click on code to edit
            var code_div = $("code.r,code.py", r_result_div);
            code_div.off('click');
            if(!shell.is_view_mode()) {
                // distinguish between a click and a drag
                // http://stackoverflow.com/questions/4127118/can-you-detect-dragging-in-jquery
                code_div.on('mousedown', function(e) {
                    $(this).data('p0', { x: e.pageX, y: e.pageY });
                }).on('mouseup', function(e) {
                    var p0 = $(this).data('p0');
                    if(p0) {
                        var p1 = { x: e.pageX, y: e.pageY },
                            d = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
                        if (d < 4) {
                            result.show_source();
                        }
                    }
                });
            }

            // we use the cached version of DPR instead of getting window.devicePixelRatio
            // because it might have changed (by moving the user agent window across monitors)
            // this might cause images that are higher-res than necessary or blurry.
            // Since using window.devicePixelRatio might cause images
            // that are too large or too small, the tradeoff is worth it.
            var dpr = rcloud.display.get_device_pixel_ratio();
            // fix image width so that retina displays are set correctly
            inner_div.find("img")
                .each(function(i, img) {
                    function update() { img.style.width = img.width / dpr; }
                    if (img.width === 0) {
                        $(img).on("load", update);
                    } else {
                        update();
                    }
                });

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
                    // only highlight things which have
                    // defined classes coming from knitr and markdown
                    if (e.classList.length === 0)
                        return;
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
        clear_result: function() {
            has_result = false;
            disable(result_button);
            this.show_source();
        },
        set_readonly: function(readonly) {
            am_read_only = readonly;
            ui_utils.set_ace_readonly(widget, readonly);
            if (readonly) {
                disable(remove_button);
                disable(insert_cell_button);
                disable(split_button);
                disable(join_button);
                $(widget.container).find(".grab-affordance").hide();
                select_lang.prop("disabled", "disabled");
            } else {
                enable(remove_button);
                enable(insert_cell_button);
                enable(split_button);
                enable(join_button);
                select_lang.prop("disabled", false);
            }
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
            outer_ace_div.show();
            widget.resize(true);
            set_widget_height();
            widget.resize(true);
            disable(source_button);
            if(has_result)
                enable(result_button);
            // enable(hide_button);
            if (!am_read_only) {
                enable(remove_button);
                enable(split_button);
            }
            //editor_row.show();

            outer_ace_div.show();
            r_result_div.hide();
            widget.resize(); // again?!?
            widget.focus();

            current_mode = "source";
        },
        show_result: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            disable(result_button);
            disable(split_button);
            // enable(hide_button);
            if (!am_read_only) {
                enable(remove_button);
            }

            //editor_row.hide();
            outer_ace_div.hide();
            r_result_div.slideDown(150); // show();
            current_mode = "result";
        },
        hide_all: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            enable(result_button);
            // disable(hide_button);
            if (!am_read_only) {
                enable(remove_button);
            }

            //editor_row.hide();
            if (current_mode === "result") {
                r_result_div.slideUp(150); // hide();
            } else {
                outer_ace_div.slideUp(150); // hide();
            }
        },
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
        },
        reformat: function() {
            if(current_mode === "source") {
                // resize once to get right height, then set height,
                // then resize again to get ace scrollbars right (?)
                widget.resize();
                set_widget_height();
                widget.resize();
            }
        },
        check_buttons: function() {
            if(!cell_model.parent_model.prior_cell(cell_model))
                join_button.hide();
            else if(!am_read_only)
                join_button.show();
        }
    };

    result.show_result();
    return result;
};}

Notebook.Cell.create_html_view = function(cell_model)
{
    return create_markdown_cell_html_view(cell_model.language())(cell_model);
};

})();
Notebook.Cell.create_model = function(content, language)
{
    var id_ = -1;
    var result = Notebook.Buffer.create_model(content, language);
    var base_change_object = result.change_object;

    _.extend(result, {
        id: function(new_id) {
            if (!_.isUndefined(new_id) && new_id != id_) {
                id_ = new_id;
                this.notify_views(function(view) {
                    view.id_updated();
                });
            }
            return id_;
        },
        filename: function() {
            if(arguments.length)
                throw new Error("can't set filename of cell");
            return Notebook.part_name(this.id(), this.language());
        },
        json: function() {
            return {
                content: content,
                language: this.language()
            };
        },
        change_object: function(obj) {
            obj = obj || {};
            if(obj.id && obj.filename)
                throw new Error("must specify only id or filename");
            if(!obj.filename) {
                var id = obj.id || this.id();
                if((id>0)!==true) // negative, NaN, null, undefined, etc etc.  note: this isn't <=
                    throw new Error("bad id for cell change object: " + id);
                obj.filename = Notebook.part_name(id, this.language());
            }
            if(obj.rename && _.isNumber(obj.rename))
                obj.rename = Notebook.part_name(obj.rename, this.language());
            return base_change_object.call(this, obj);
        }
    });
    return result;
};
Notebook.Cell.create_controller = function(cell_model)
{
    var result = {
        execute: function() {
            var that = this;
            var language = cell_model.language() || 'Text'; // null is a synonym for Text
            function callback(r) {
                that.set_status_message(r);
            }
            var promise;

            rcloud.record_cell_execution(cell_model);
            if (rcloud.authenticated) {
                promise = rcloud.authenticated_cell_eval(cell_model.content(), language, false);
            } else {
                promise = rcloud.session_cell_eval(
                    Notebook.part_name(cell_model.id(),
                                       cell_model.language()),
                    cell_model.language(),
                    false);
            }
            return promise.then(callback);
        },
        set_status_message: function(msg) {
            _.each(cell_model.views, function(view) {
                view.result_updated(msg);
            });
        },
        change_language: function(language) {
            cell_model.language(language);
        }
    };

    return result;
};
Notebook.create_html_view = function(model, root_div)
{
    var root_asset_div = $("#asset-list");

    function on_rearrange() {
        _.each(result.sub_views, function(view) {
            view.check_buttons();
        });
    }

    var result = {
        model: model,
        sub_views: [],
        asset_sub_views: [],
        cell_appended: function(cell_model) {
            var cell_view = Notebook.Cell.create_html_view(cell_model);
            cell_model.views.push(cell_view);
            root_div.append(cell_view.div());
            this.sub_views.push(cell_view);
            on_rearrange();
            return cell_view;
        },
        asset_appended: function(asset_model) {
            var asset_view = Notebook.Asset.create_html_view(asset_model);
            asset_model.views.push(asset_view);
            root_asset_div.append(asset_view.div());
            this.asset_sub_views.push(asset_view);
            on_rearrange();
            return asset_view;
        },
        cell_inserted: function(cell_model, cell_index) {
            var cell_view = Notebook.Cell.create_html_view(cell_model);
            cell_model.views.push(cell_view);
            root_div.append(cell_view.div());
            $(cell_view.div()).insertBefore(root_div.children('.notebook-cell')[cell_index]);
            this.sub_views.splice(cell_index, 0, cell_view);
            cell_view.show_source();
            on_rearrange();
            return cell_view;
        },
        cell_removed: function(cell_model, cell_index) {
            _.each(cell_model.views, function(view) {
                view.self_removed();
            });
            this.sub_views.splice(cell_index, 1);
            on_rearrange();
        },
        asset_removed: function(asset_model, asset_index) {
            _.each(asset_model.views, function(view) {
                view.self_removed();
            });
            this.asset_sub_views.splice(asset_index, 1);
        },
        cell_moved: function(cell_model, pre_index, post_index) {
            this.sub_views.splice(pre_index, 1);
            this.sub_views.splice(post_index, 0, cell_model.views[0]);
            on_rearrange();
        },
        set_readonly: function(readonly) {
            _.each(this.sub_views, function(view) {
                view.set_readonly(readonly);
            });
            _.each(this.asset_sub_views, function(view) {
                view.set_readonly(readonly);
            });
        },
        update_urls: function() {
            RCloud.UI.scratchpad.update_asset_url();
        },
        update_model: function() {
            return _.map(this.sub_views, function(cell_view) {
                return cell_view.update_model();
            });
        },
        reformat: function() {
            _.each(this.sub_views, function(view) {
                view.reformat();
            });
        }
    };
    model.views.push(result);
    return result;
};
// these functions in loops are okay
/*jshint -W083 */
Notebook.create_model = function()
{
    var readonly_ = false;
    var user_ = "";

    function last_id(cells) {
        if(cells.length)
            return cells[cells.length-1].id();
        else
            return 0;
    }

    // anything here that returns a set of changes must only be called from the
    // controller.  the controller makes sure those changes are sent to github.

    /* note, the code below is a little more sophisticated than it needs to be:
       allows multiple inserts or removes but currently n is hardcoded as 1.  */
    return {
        cells: [],
        assets: [],
        views: [], // sub list for cell content pubsub
        dishers: [], // for dirty bit pubsub
        clear: function() {
            var cells_removed = this.remove_cell(null,last_id(this.cells));
            var assets_removed = this.remove_asset(null,this.assets.length);
            return cells_removed.concat(assets_removed);
        },
        has_asset: function(filename) {
            return _.find(this.assets, function(asset) {
                return asset.filename() == filename;
            });
        },
        append_asset: function(asset_model, filename, skip_event) {
            asset_model.parent_model = this;
            var changes = [];
            changes.push(asset_model.change_object());
            this.assets.push(asset_model);
            if(!skip_event)
                _.each(this.views, function(view) {
                    view.asset_appended(asset_model);
                });
            return changes;
        },
        append_cell: function(cell_model, id, skip_event) {
            cell_model.parent_model = this;
            cell_model.renew_content();
            var changes = [];
            var n = 1;
            id = id || 1;
            id = Math.max(id, last_id(this.cells)+1);
            while(n) {
                cell_model.id(id);
                changes.push(cell_model.change_object());
                this.cells.push(cell_model);
                if(!skip_event)
                    _.each(this.views, function(view) {
                        view.cell_appended(cell_model);
                    });
                ++id;
                --n;
            }
            return changes;
        },
        insert_cell: function(cell_model, id, skip_event) {
            var that = this;
            cell_model.parent_model = this;
            cell_model.renew_content();
            var changes = [];
            var n = 1, x = 0;
            while(x<this.cells.length && this.cells[x].id() < id) ++x;
            // if id is before some cell and id+n knocks into that cell...
            if(x<this.cells.length && id+n > this.cells[x].id()) {
                // see how many ids we can squeeze between this and prior cell
                var prev = x>0 ? this.cells[x-1].id() : 0;
                id = Math.max(this.cells[x].id()-n, prev+1);
            }
            for(var j=0; j<n; ++j) {
                changes.push(cell_model.change_object({id: id+j})); // most likely blank
                cell_model.id(id+j);
                this.cells.splice(x, 0, cell_model);
                if(!skip_event)
                    _.each(this.views, function(view) {
                        view.cell_inserted(that.cells[x], x);
                    });
                ++x;
            }
            while(x<this.cells.length && n) {
                if(this.cells[x].id() > id) {
                    var gap = this.cells[x].id() - id;
                    n -= gap;
                    id += gap;
                }
                if(n<=0)
                    break;
                changes.push(this.cells[x].change_object({
                    rename: this.cells[x].id()+n
                }));
                this.cells[x].id(this.cells[x].id() + n);
                ++x;
                ++id;
            }
            // apply the changes backward so that we're moving each cell
            // out of the way just before putting the next one in its place
            return changes.reverse();
        },
        remove_asset: function(asset_model, n, skip_event) {
            if (this.assets.length === 0)
                return [];
            var that = this;
            var asset_index, filename;
            if(asset_model!==null) {
                asset_index = this.assets.indexOf(asset_model);
                filename = asset_model.filename();
                if (asset_index === -1) {
                    throw new Error("asset_model not in notebook model?!");
                }
            }
            else {
                asset_index = 0;
                filename = this.assets[asset_index].filename();
            }
            n = n || 1;
            var x = asset_index;
            var changes = [];
            while(x<this.assets.length && n) {
                if(this.assets[x].filename() == filename) {
                    if(!skip_event)
                        _.each(this.views, function(view) {
                            view.asset_removed(that.assets[x], x);
                        });
                    changes.push(that.assets[x].change_object({ erase: 1 }));
                    this.assets.splice(x, 1);
                }
                if (x<this.assets.length)
                    filename = this.assets[x].filename();
                --n;
            }
            return changes;
        },
        remove_cell: function(cell_model, n, skip_event) {
            var that = this;
            var cell_index, id;
            if(cell_model!==null) {
                cell_index = this.cells.indexOf(cell_model);
                id = cell_model.id();
                if (cell_index === -1) {
                    throw new Error("cell_model not in notebook model?!");
                }
            }
            else {
                cell_index = 0;
                id = 1;
            }
            n = n || 1;
            var x = cell_index;
            var changes = [];
            while(x<this.cells.length && n) {
                if(this.cells[x].id() == id) {
                    var cell = this.cells[x];
                    this.cells.splice(x, 1);
                    if(!skip_event)
                        _.each(this.views, function(view) {
                            view.cell_removed(cell, x);
                        });
                    changes.push(cell.change_object({ erase: 1 }));
                }
                ++id;
                --n;
            }
            return changes;
        },
        move_cell: function(cell_model, before) {
            // remove doesn't change any ids, so we can just remove then add
            var pre_index = this.cells.indexOf(cell_model),
                changes = this.remove_cell(cell_model, 1, true)
                    .concat(before >= 0 ?
                            this.insert_cell(cell_model, before, true) :
                            this.append_cell(cell_model, null, true)),
                post_index = this.cells.indexOf(cell_model);
            _.each(this.views, function(view) {
                view.cell_moved(cell_model, pre_index, post_index);
            });
            return changes;
        },
        prior_cell: function(cell_model) {
            var index = this.cells.indexOf(cell_model);
            if(index>0)
                return this.cells[index-1];
            else
                return null;
        },
        change_cell_language: function(cell_model, language) {
            // for this one case we have to use filenames instead of ids
            var pre_name = cell_model.filename();
            cell_model.language(language);
            return [cell_model.change_object({filename: pre_name,
                                              rename: cell_model.filename()})];
        },
        update_cell: function(cell_model) {
            return [cell_model.change_object()];
        },
        update_asset: function(asset_model) {
            return [asset_model.change_object()];
        },
        reread_buffers: function() {
            // force views to update models
            var changed_cells_per_view = _.map(this.views, function(view) {
                return view.update_model();
            });
            if(changed_cells_per_view.length != 1)
                throw new Error("not expecting more than one notebook view");
            var contents = changed_cells_per_view[0];
            var changes = [];
            for (var i=0; i<contents.length; ++i)
                if (contents[i] !== null)
                    changes.push(this.cells[i].change_object());
            var asset_change = RCloud.UI.scratchpad.update_model();
            // too subtle here: update_model distinguishes between no change (null)
            // and change-to-empty.  we care about change-to-empty and let github
            // delete the asset but leave it on the screen until reload (as with cells)
            if (asset_change !== null) {
                var active_asset_model = RCloud.UI.scratchpad.current_model;
                changes.push(active_asset_model.change_object());
            }
            return changes;
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
        user: function(user) {
            if (!_.isUndefined(user)) {
                user_ = user;
            }
            return user_;
        },
        update_files: function(files) {
            for(var i = 0; i<this.assets.length; ++i) {
                var ghfile = files[this.assets[i].filename()];
                // note this is where to get the asset raw_url if we need it again
                this.assets[i].language(ghfile.language);
            }
            _.each(this.views, function(view) {
                view.update_urls();
            });
        },
        on_dirty: function() {
            _.each(this.dishers, function(disher) {
                disher.on_dirty();
            });
        },
        json: function() {
            return _.map(this.cells, function(cell_model) {
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

    // only create the callbacks once, but delay creating them until the editor
    // is initialized
    var default_callback = function() {
        var cb_ = null,
            editor_callback_ = null;
        return function() {
            if(!cb_) {
                editor_callback_ = editor.load_callback({is_change: true, selroot: true});
                cb_ = function(notebook) {
                    if(save_button_)
                        ui_utils.disable_bs_button(save_button_);
                    dirty_ = false;
                    if(save_timer_) {
                        window.clearTimeout(save_timer_);
                        save_timer_ = null;
                    }
                    return editor_callback_(notebook);
                };
            }
            return cb_;
        };
    }();

    function append_cell_helper(content, type, id) {
        var cell_model = Notebook.Cell.create_model(content, type);
        var cell_controller = Notebook.Cell.create_controller(cell_model);
        cell_model.controller = cell_controller;
        return {controller: cell_controller, changes: model.append_cell(cell_model, id)};
    }

    function append_asset_helper(content, filename) {
        var asset_model = Notebook.Asset.create_model(content, filename);
        var asset_controller = Notebook.Asset.create_controller(asset_model);
        asset_model.controller = asset_controller;
        return {controller: asset_controller,
                changes: model.append_asset(asset_model, filename)};
    }

    function insert_cell_helper(content, type, id) {
        var cell_model = Notebook.Cell.create_model(content, type);
        var cell_controller = Notebook.Cell.create_controller(cell_model);
        cell_model.controller = cell_controller;
        return {controller: cell_controller, changes: model.insert_cell(cell_model, id)};
    }

    function on_load(version, notebook) {
        var is_read_only = version !== null || notebook.user.login !== rcloud.username();
        current_gist_ = notebook;
        model.read_only(is_read_only);
        if (!_.isUndefined(notebook.files)) {
            var i;
            // we can't do much with a notebook with no name, so give it one
            if(!notebook.description)
                notebook.description = "(untitled)";
            this.clear();
            var cells = {}; // could rely on alphabetic input instead of gathering
            var assets = {};
            _.each(notebook.files, function (file, k) {
                // ugh, we really need to have a better javascript mapping of R objects..
                if (k === "r_attributes" || k === "r_type")
                    return;
                var filename = file.filename;
                if(Notebook.is_part_name(filename)) {
                    // cells
                    var number = parseInt(filename.slice(4).split('.')[0]);
                    if(!isNaN(number))
                        cells[number] = [file.content, file.language, number];
                } else {
                    // assets
                    assets[filename] = [file.content, file.filename];
                }
            });
            // we intentionally drop change objects on the floor, here and only here.
            // that way the cells/assets are checkpointed where they were loaded
            var asset_controller;
            for(i in cells)
                append_cell_helper(cells[i][0], cells[i][1], cells[i][2]);
            for(i in assets) {
                var result = append_asset_helper(assets[i][0], assets[i][1]).controller;
                asset_controller = asset_controller || result;
            }
            model.user(notebook.user.login);
            model.update_files(notebook.files);
            if(asset_controller)
                asset_controller.select();
            else
                RCloud.UI.scratchpad.set_model(null);
            // set read-only again to trickle MVC events through to the display :-(
            model.read_only(is_read_only);
        }
        return notebook;
    }

    // calculate the changes needed to get back from the newest version in notebook
    // back to what we are presently displaying (current_gist_)
    function find_changes_from(notebook) {
        function change_object(obj) {
            obj.name = function(n) { return n; };
            return obj;
        }
        var changes = [];

        // notebook files, current files
        var nf = notebook.files,
            cf = _.extend({}, current_gist_.files); // dupe to keep track of changes

        // find files which must be changed or removed to get from nf to cf
        for(var f in nf) {
            if(f==='r_type' || f==='r_attributes')
                continue; // R metadata
            if(f in cf) {
                if(cf[f].language != nf[f].language || cf[f].content != nf[f].content) {
                    changes.push(change_object({filename: f,
                                                language: cf[f].language,
                                                content: cf[f].content}));
                }
                delete cf[f];
            }
            else changes.push(change_object({filename: f, erase: true, language: nf[f].language}));
        }

        // find files which must be added to get from nf to cf
        for(f in cf) {
            if(f==='r_type' || f==='r_attributes')
                continue; // artifact of rserve.js
            changes.push(change_object({filename: f,
                                        language: cf[f].language,
                                        content: cf[f].content}));
        }
        return changes;
    }

    function update_notebook(changes, gistname, more) {
        function add_more_changes(gist) {
            if (_.isUndefined(more))
                return gist;
            return _.extend(_.clone(gist), more);
        }
        // remove any "empty" changes.  we can keep empty cells on the
        // screen but github will refuse them.  if the user doesn't enter
        // stuff in them before saving, they will disappear on next session
        changes = changes.filter(function(change) {
            return change.content || change.erase || change.rename;
        });
        if (model.read_only())
            return Promise.reject(new Error("attempted to update read-only notebook"));
        if (!changes.length && _.isUndefined(more)) {
            return Promise.cast(current_gist_);
        }
        gistname = gistname || shell.gistname();
        function changes_to_gist(changes) {
            var files = {}, creates = {};
            // play the changes in order - they must be sequenced so this makes sense
            _.each(changes, function(change) {
                if(change.erase || change.rename) {
                    if(creates[change.filename])
                        delete files[change.filename];
                    else
                        files[change.filename] = null;
                    if(change.rename)
                        files[change.rename] = {content: change.content};
                }
                else {
                    // if the first time we see a filename in the changeset is a create,
                    // we need to remember that so that if the last change is a delete,
                    // we just send "no change"
                    if(change.create && !(change.filename in files))
                        creates[change.filename] = true;
                    files[change.filename] = {content: change.content};
                }
            });
            return {files: files};
        }
        var gist = add_more_changes(changes_to_gist(changes));
        return rcloud.update_notebook(gistname, gist)
            .then(function(notebook) {
                if('error' in notebook)
                    throw notebook;
                current_gist_ = notebook;
                model.update_files(notebook.files);
                return notebook;
            })
            .catch(function(e) {
                // this should not ever happen but there is no choice but to reload if it does
                if(/non-existent/.test(e.message))
                    editor.fatal_reload(e.message);
                throw e;
            });
    }

    function apply_changes_and_load(changes, gistname) {
        return changes.length ?
            update_notebook(changes, gistname) :
            result.load_notebook(gistname, null); // do a load - we need to refresh
    }

    function refresh_buffers() {
        return model.reread_buffers();
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
        current_gist: function() {
            // are there reasons we shouldn't be exposing this?
            return current_gist_;
        },
        save_button: function(save_button) {
            if(arguments.length) {
                save_button_ = save_button;
            }
            return save_button_;
        },
        append_asset: function(content, filename) {
            var cch = append_asset_helper(content, filename);
            return update_notebook(refresh_buffers().concat(cch.changes))
                .then(default_callback())
                .return(cch.controller);
        },
        append_cell: function(content, type, id) {
            var cch = append_cell_helper(content, type, id);
            update_notebook(refresh_buffers().concat(cch.changes))
                .then(default_callback());
            return cch.controller;
        },
        insert_cell: function(content, type, id) {
            var cch = insert_cell_helper(content, type, id);
            update_notebook(refresh_buffers().concat(cch.changes))
                .then(default_callback());
            return cch.controller;
        },
        remove_cell: function(cell_model) {
            var changes = refresh_buffers().concat(model.remove_cell(cell_model));
            RCloud.UI.command_prompt.prompt.widget.focus(); // there must be a better way
            update_notebook(changes)
                .then(default_callback());
        },
        remove_asset: function(asset_model) {
            var changes = refresh_buffers().concat(model.remove_asset(asset_model));
            update_notebook(changes)
                .then(default_callback());
        },
        move_cell: function(cell_model, before) {
            var changes = refresh_buffers().concat(model.move_cell(cell_model, before ? before.id() : -1));
            update_notebook(changes)
                .then(default_callback());
        },
        join_prior_cell: function(cell_model) {
            var prior = model.prior_cell(cell_model);
            if(!prior)
                return;

            function opt_cr(text) {
                if(text.length && text[text.length-1] != '\n')
                    return text + '\n';
                return text;
            }
            function crunch_quotes(left, right) {
                var end = /```\n$/, begin = /^```{r}/;
                if(end.test(left) && begin.test(right))
                    return left.replace(end, '') + right.replace(begin, '');
                else return left + right;
            }

            // note we have to refresh everything and then concat these changes onto
            // that.  which won't work in general but looks like it is okay to
            // concatenate a bunch of change content objects with a move or change
            // to one of the same objects, and an erase of one
            var new_content, changes = refresh_buffers();

            // this may have to be multiple dispatch when there are more than two languages
            if(prior.language()==cell_model.language()) {
                new_content = crunch_quotes(opt_cr(prior.content()),
                                            cell_model.content());
                prior.content(new_content);
                changes = changes.concat(model.update_cell(prior));
            }
            else {
                if(prior.language()==="R") {
                    new_content = crunch_quotes('```{r}\n' + opt_cr(prior.content()) + '```\n',
                                                cell_model.content());
                    prior.content(new_content);
                    changes = changes.concat(model.change_cell_language(prior, "Markdown"));
                    changes[changes.length-1].content = new_content; //  NOOOOOO!!!!
                }
                else {
                    new_content = crunch_quotes(opt_cr(prior.content()) + '```{r}\n',
                                                opt_cr(cell_model.content()) + '```\n');
                    new_content = new_content.replace(/```\n```{r}\n/, '');
                    prior.content(new_content);
                    changes = changes.concat(model.update_cell(prior));
                }
            }
            _.each(prior.views, function(v) { v.clear_result(); });
            update_notebook(changes.concat(model.remove_cell(cell_model)))
                .then(default_callback());
        },
        split_cell: function(cell_model, point1, point2) {
            function resplit(a) {
                for(var i=0; i<a.length-1; ++i)
                    if(!/\n$/.test(a[i]) && /^\n/.test(a[i+1])) {
                        a[i] = a[i].concat('\n');
                        a[i+1] = a[i+1].replace(/^\n/, '');
                    }
            }
            var changes = refresh_buffers();
            var content = cell_model.content();
            // make sure point1 is before point2
            if(point1>=point2)
                point2 = undefined;
            // remove split points at the beginning or end
            if(point2 !== undefined && /^\s*$/.test(content.substring(point2)))
                point2 = undefined;
            if(point1 !== undefined) {
                if(/^\s*$/.test(content.substring(point1)))
                    point1 = undefined;
                else if(/^\s*$/.test(content.substring(0, point1)))
                    point1 = point2;
            }
            // don't do anything if there is no real split point
            if(point1 === undefined)
                return;
            var parts = [content.substring(0, point1)],
                id = cell_model.id(), language = cell_model.language();
            if(point2 === undefined)
                parts.push(content.substring(point1));
            else
                parts.push(content.substring(point1, point2),
                           content.substring(point2));
            resplit(parts);
            cell_model.content(parts[0]);
            _.each(cell_model.views, function(v) { v.clear_result(); });
            changes = changes.concat(model.update_cell(cell_model));
            // not great to do multiple inserts here - but not quite important enough to enable insert-n
            for(var i=1; i<parts.length; ++i)
                changes = changes.concat(insert_cell_helper(parts[i], language, id+i).changes);
            update_notebook(changes)
                .then(default_callback());
        },
        change_cell_language: function(cell_model, language) {
            var changes = refresh_buffers().concat(model.change_cell_language(cell_model, language));
            update_notebook(changes)
                .then(default_callback());
        },
        clear: function() {
            model.clear();
            // FIXME when scratchpad becomes a view, clearing the model
            // should make this happen automatically.
            RCloud.UI.scratchpad.clear();
        },
        load_notebook: function(gistname, version) {
            return rcloud.load_notebook(gistname, version || null)
                .then(_.bind(on_load, this, version));
        },
        create_notebook: function(content) {
            var that = this;
            return rcloud.create_notebook(content)
                .then(_.bind(on_load,this,null));
        },
        revert_notebook: function(gistname, version) {
            model.read_only(false); // so that update_notebook doesn't throw
            // get HEAD, calculate changes from there to here, and apply
            return rcloud.load_notebook(gistname, null).then(function(notebook) {
                return [find_changes_from(notebook), gistname];
            }).spread(apply_changes_and_load);
        },
        fork_notebook: function(gistname, version) {
            model.read_only(false); // so that update_notebook doesn't throw
            return rcloud.fork_notebook(gistname)
                .then(function(notebook) {
                    if(version)
                        // fork, then get changes from there to where we are in the past, and apply
                        // git api does not return the files on fork, so load
                        return rcloud.get_notebook(notebook.id, null)
                        .then(function(notebook2) {
                            return [find_changes_from(notebook2), notebook2.id];
                        });
                    else return [[], notebook.id];
            }).spread(apply_changes_and_load);
        },
        update_cell: function(cell_model) {
            return update_notebook(refresh_buffers().concat(model.update_cell(cell_model)))
                .then(default_callback());
        },
        update_asset: function(asset_model) {
            return update_notebook(refresh_buffers().concat(model.update_asset(asset_model)))
                .then(default_callback());
        },
        rename_notebook: function(desc) {
            return update_notebook(refresh_buffers(), null, {description: desc})
                .then(default_callback());
        },
        save: function() {
            if(!dirty_)
                return Promise.resolve(undefined);
            return update_notebook(refresh_buffers())
                .then(default_callback());
        },
        run_all: function() {
            this.save();
            _.each(model.cells, function(cell_model) {
                cell_model.controller.set_status_message("Waiting...");
            });

            // will ordering bite us in the leg here?
            var promises = _.map(model.cells, function(cell_model) {
                return Promise.resolve().then(function() {
                    cell_model.controller.set_status_message("Computing...");
                    return cell_model.controller.execute();
                });
            });
            return RCloud.UI.with_progress(function() {
                return Promise.all(promises);
            });
        },

        //////////////////////////////////////////////////////////////////////

        is_mine: function() {
            return rcloud.username() === model.user();
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
    case 'Python':
        ext = 'py';
        break;
    case 'Text':
        ext = 'txt';
        break;
    default:
        throw new Error("Unknown language " + language);
    }
    return 'part' + id + '.' + ext;
};

Notebook.empty_for_github = function(text) {
    return /^\s*$/.test(text);
};

Notebook.is_part_name = function(filename) {
    return filename.match(/^part\d+\./);
};
(function() {

// FIXME this is just a proof of concept - using Rserve console OOBs
// FIXME this should use RCloud.session_pane
var append_session_info = function(msg) {
    if(!$('#session-info').length)
        return; // workaround for view mode
    // one hacky way is to maintain a <pre> that we fill as we go
    // note that R will happily spit out incomplete lines so it's
    // not trivial to maintain each output in some separate structure
    if (!document.getElementById("session-info-out"))
        $("#session-info").append($("<pre id='session-info-out'></pre>"));
    $("#session-info-out").append(msg);
    RCloud.UI.right_panel.collapse($("#collapse-session-info"), false);
    ui_utils.on_next_tick(function() {
        ui_utils.scroll_to_after($("#session-info"));
    });
};

// FIXME this needs to go away as well.
var oob_handlers = {
    "browsePath": function(v) {
        var url=" "+ window.location.protocol + "//" + window.location.host + v+" ";
        RCloud.UI.help_frame.display_href(url);
    },
    "pager": function(v) {
        var files = v[0], header = v[1], title = v[2];
        var html = "<h2>" + title + "</h2>\n";
        for(var i=0; i<files.length; ++i) {
            if(_.isArray(header) && header[i])
                html += "<h3>" + header[i] + "</h3>\n";
            html += "<pre>" + files[i] + "</pre>";
        }
        RCloud.UI.help_frame.display_content(html);
    },
    "editor": function(v) {
        // what is an object to edit, content is file content to edit
        var what = v[0], content = v[1], name = v[2];
        // FIXME: do somethign with it - eventually this
        // should be a modal thing - for now we shoudl at least
        // show the content ...
        append_session_info("what: "+ what + "\ncontents:" + content + "\nname: "+name+"\n");
    },
    "console.out": append_session_info,
    "console.msg": append_session_info,
    "console.err": append_session_info,
    "stdout": append_session_info,
    "stderr": append_session_info
    // NOTE: "idle": ... can be used to handle idle pings from Rserve if we care ..
};

var on_data = function(v) {
    v = v.value.json();
    if(oob_handlers[v[0]])
        oob_handlers[v[0]](v.slice(1));
};

function could_not_initialize_error(err) {
    var msg = "Could not initialize session. The GitHub backend might be down or you might have an invalid authorization token. (You could try clearing your cookies, for example).";
    if(err)
        msg += "<br />Error: " + err.toString();
    return msg;
}

function on_connect_anonymous_allowed(ocaps) {
    var promise;
    rcloud = RCloud.create(ocaps.rcloud);
    if (rcloud.authenticated) {
        promise = rcloud.session_init(rcloud.username(), rcloud.github_token());
    } else {
        promise = rcloud.anonymous_session_init();
    }
    return promise.catch(function(e) {
        RCloud.UI.fatal_dialog(could_not_initialize_error(e), "Logout", "/logout.R");
    });
}

function on_connect_anonymous_disallowed(ocaps) {
    rcloud = RCloud.create(ocaps.rcloud);
    if (!rcloud.authenticated) {
        return Promise.reject(new Error("Authentication required"));
    }
    return rcloud.session_init(rcloud.username(), rcloud.github_token());
}

function rclient_promise(allow_anonymous) {
    return new Promise(function(resolve, reject) {
        rclient = RClient.create({
            debug: false,
            host:  location.href.replace(/^http/,"ws").replace(/#.*$/,""),
            on_connect: function (ocaps) { resolve(ocaps); },
            on_data: on_data,
            on_error: function(error) {
                reject(error);
                return false;
            }
        });
        rclient.allow_anonymous_ = allow_anonymous;
    }).then(function(ocaps) {
        var promise = allow_anonymous ?
            on_connect_anonymous_allowed(ocaps) :
            on_connect_anonymous_disallowed(ocaps);
        return promise;
    }).then(function(hello) {
        if (!$("#output > .response").length)
            rclient.post_response(hello);
    }).catch(function(error) { // e.g. couldn't connect with github
        if(rclient)
            rclient.close();
        if (error.message === "Authentication required") {
            RCloud.UI.fatal_dialog("Your session has been logged out.", "Reconnect", "/login.R");
        } else {
            RCloud.UI.fatal_dialog(could_not_initialize_error(error), "Logout", "/logout.R");
        }
        throw error;
    }).then(function() {
        rcloud.display.set_device_pixel_ratio();
        rcloud.api.set_url(window.location.href);
        return rcloud.init_client_side_data();
    });
}

RCloud.session = {
    first_session_: true,
    // FIXME rcloud.with_progress is part of the UI.
    reset: function() {
        if (this.first_session_) {
            this.first_session_ = false;
            return RCloud.UI.with_progress(function() {});
        }
        // perhaps we need an event to listen on here
        $("#session-info").empty();
        $(".progress").hide();
        $("#file-upload-results").empty();
        return RCloud.UI.with_progress(function() {
            var anonymous = rclient.allow_anonymous_;
            rclient.close();
            return rclient_promise(anonymous);
        });
    }, init: function(allow_anonymous) {
        this.first_session_ = true;
        return rclient_promise(allow_anonymous);
    }
};

})();
(function() {
    function upload_opts(opts) {
        if(_.isBoolean(opts) || _.isUndefined(opts))
            opts = {force: !!opts};
        else if(!_.isObject(opts))
            throw new Error("didn't understand options " + opts);
        opts = $.extend({
            force: false
        }, opts);
        if(!opts.files)
            opts.files = opts.$file ? opts.$file[0].files : [];
        return opts;
    }

    function text_reader() {
        return Promise.promisify(function(file, callback) {
            var fr = new FileReader();
            fr.onload = function(e) {
                callback(null, fr.result);
            };
            fr.onerror = function(e) {
                callback(fr.error, null);
            };
            fr.readAsText(file);
        });
    }

    function promise_for(condition, action, value) {
        if(!condition(value))
            return value;
        return action(value).then(promise_for.bind(null, condition, action));
    }

    // like Promise.each but each promise is not *started* until the last one completes
    function promise_sequence(collection, operator) {
        return promise_for(
            function(i) {
                return i < collection.length;
            },
            function(i) {
                return operator(collection[i]).return(++i);
            },
            0);
    }

    RCloud.upload_assets = function(options, react) {
        react = react || {};
        options = upload_opts(options);
        function upload_asset(filename, content) {
            var replacing = shell.notebook.model.has_asset(filename);
            var promise_controller;
            if(replacing) {
                if(react.replace)
                    react.replace(filename);
                replacing.content(content);
                promise_controller = shell.notebook.controller.update_asset(replacing)
                    .return(replacing.controller);
            }
            else {
                if(react.add)
                    react.add(filename);
                promise_controller = shell.notebook.controller.append_asset(content, filename);
            }
            return promise_controller.then(function(controller) {
                controller.select();
            });
        }
        return promise_sequence(
            options.files,
            function(file) {
                return text_reader()(file) // (we don't know how to deal with binary anyway)
                    .then(function(content) {
                        if(Notebook.empty_for_github(content))
                            throw new Error("empty");
                        return upload_asset(file.name, content);
                    });
            });
    };

    function binary_upload(upload_ocaps, react) {
        return Promise.promisify(function(file, is_replace, callback) {
            var fr = new FileReader();
            var chunk_size = 1024*1024;
            var f_size=file.size;
            var cur_pos=0;
            var bytes_read = 0;
            if(react.start)
                react.start(file.name);
            //initiate the first chunk, and then another, and then another ...
            // ...while waiting for one to complete before reading another
            fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
            fr.onload = function(e) {
                if(react.progress)
                    react.progress(bytes_read, f_size);
                var promise;
                if (e.target.result.byteLength > 0) {
                    var bytes = new Uint8Array(e.target.result);
                    promise = upload_ocaps.writeAsync(bytes.buffer)
                        .then(function() {
                            bytes_read += e.target.result.byteLength;
                            cur_pos += chunk_size;
                            fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
                        });
                } else {
                    promise = upload_ocaps.closeAsync()
                        .then(function() {
                            if(react.done)
                                react.done(is_replace, file.name);
                            callback(null, true);
                        });
                }
                promise.catch(function(err) {
                    callback(err, null);
                });
            };
        });
    }

    RCloud.upload_files = function(options, react) {
        var upload_ocaps = options.upload_ocaps || rcloud_ocaps.file_upload;
        react = react || {};
        options = upload_opts(options);
        var upload = binary_upload(upload_ocaps, react);
        function upload_file(path, file) {
            var upload_name = path + '/' + file.name;
            return upload_ocaps.createAsync(upload_name, options.force)
                .catch(function(err) {
                    if(react.confirm_replace && /exists/.test(err.message)) {
                        return react.confirm_replace(file.name)
                            .then(function(confirm) {
                                return confirm ?
                                    upload_ocaps.createAsync(upload_name, true)
                                    .return("overwrite") :
                                    Promise.resolve(false);
                            });
                    }
                    else throw err;
                })
                .then(function(whether) {
                    return whether ? upload(file, whether==="overwrite") : Promise.resolve(undefined);
                });
        }

        if(!(window.File && window.FileReader && window.FileList && window.Blob))
            return Promise.reject(new Error("File API not supported by browser."));
        else {
            if(_.isUndefined(options.files) || !options.files.length)
                return Promise.reject(new Error("No files selected!"));
            else {
                /*FIXME add logged in user */
                return upload_ocaps.upload_pathAsync()
                    .then(function(path) {
                        return promise_sequence(options.files, upload_file.bind(null, path));
                    });
            }
        }
    };
})();
RCloud.UI = {};
RCloud.UI.column = function(sel_column) {
    var colwidth_;
    function classes(cw) {
        return "col-md-" + cw + " col-sm-" + cw;
    }
    var result = {
        init: function() {
            var $sel = $(sel_column);
            if($sel.length === 0)
                return; // e.g. view mode
            // find current column width from classes
            var classes = $sel.attr('class').split(/\s+/);
            classes.forEach(function(c) {
                var cw = /^col-(?:md|sm)-(\d+)$/.exec(c);
                if(cw) {
                    cw = +cw[1];
                    if(colwidth_ === undefined)
                        colwidth_ = cw;
                    else if(colwidth_ !== cw)
                        throw new Error("mismatched col-md- or col-sm- in column classes");
                }
            });
        },
        colwidth: function(val) {
            if(!_.isUndefined(val) && val != colwidth_) {
                $(sel_column).removeClass(classes(colwidth_)).addClass(classes(val));
                colwidth_ = val;
            }
            return colwidth_;
        }
    };
    return result;
};

RCloud.UI.collapsible_column = function(sel_column, sel_accordion, sel_collapser) {
    var collapsed_ = false;
    var result = RCloud.UI.column(sel_column);
    var parent_init = result.init.bind(result);
    function collapsibles() {
        return $(sel_accordion + " > .panel > div.panel-collapse:not(.out)");
    }
    function togglers() {
        return $(sel_accordion + " > .panel > div.panel-heading");
    }
    function set_collapse(target, collapse, persist) {
        target.data("would-collapse", collapse);
        if(persist && rcloud.config && target.length) {
            var opt = 'ui/' + target[0].id;
            rcloud.config.set_user_option(opt, collapse);
        }
    }
    function all_collapsed() {
        return $.makeArray(collapsibles()).every(function(el) {
            return $(el).hasClass('out') || $(el).data("would-collapse")===true;
        });
    }
    function sel_to_opt(sel) {
        return sel.replace('#', 'ui/');
    }
    function opt_to_sel(opt) {
        return opt.replace('ui/', '#');
    }
    function reshadow() {
        $(sel_accordion + " .panel-shadow").each(function(v) {
            var h = $(this).parent().find('.panel-body').outerHeight();
            if (h === 0)
                h = "100%";
            $(this).attr("height", h);
        });
    }
    _.extend(result, {
        init: function() {
            var that = this;
            parent_init();
            collapsibles().each(function() {
                $(this).data("would-collapse", !$(this).hasClass('in') && !$(this).hasClass('out'));
            });
            togglers().click(function() {
                var target = $(this.dataset.target);
                that.collapse(target, target.hasClass('in'));
                return false;
            });
            collapsibles().on("size-changed", function() {
                that.resize();
            });
            $(sel_collapser).click(function() {
                if (collapsed_)
                    that.show(true);
                else
                    that.hide(true);
            });
        },
        load: function(promise) { // takes: promise that everything else has loaded
            var that = this;
            var sels = $.makeArray(collapsibles()).map(function(el) { return '#' + el.id; });
            sels.push(sel_accordion);
            var opts = sels.map(sel_to_opt);
            Promise.all([promise, rcloud.config.get_user_option(opts)])
                .spread(function(_, settings) {
                    var hide_column;
                    for(var k in settings) {
                        var id = opt_to_sel(k);
                        if(id === sel_accordion)
                            hide_column = settings[k];
                        else if(typeof settings[k] === "boolean")
                            set_collapse($(id), settings[k], false);
                    }
                    // do the column last because it will affect all its children
                    if(typeof hide_column === "boolean") {
                        if(hide_column)
                            that.hide(false);
                        else
                            that.show(false);
                    }
                    else that.show(true); // make sure we have a setting
                });
        },
        collapse: function(target, whether, persist) {
            if(persist === undefined)
                persist = true;
            if(collapsed_) {
                collapsibles().each(function() {
                    if(this===target[0])
                        set_collapse($(this), false, persist);
                    else
                        set_collapse($(this), true, persist);
                });
                this.show(true);
                return;
            }
            set_collapse(target, whether, persist);
            if(all_collapsed())
                this.hide(persist);
            else
                this.show(persist);
        },
        resize: function(skip_calc) {
            if(!skip_calc) {
                var cw = this.calcwidth();
                this.colwidth(cw);
            }
            RCloud.UI.middle_column.update();
            var heights = {}, padding = {}, cbles = collapsibles(), ncollapse = cbles.length;
            var greedy_one = null;
            cbles.each(function() {
                if(!$(this).hasClass("out") && !$(this).data("would-collapse")) {
                    var spf = $(this).data("panel-sizer");
                    var sp = spf ? spf(this) : RCloud.UI.collapsible_column.default_sizer(this);
                    heights[this.id] = sp.height;
                    padding[this.id] = sp.padding;
                    // remember the first greedy panel
                    if(!greedy_one && $(this).attr("data-widgetheight")==="greedy")
                        greedy_one = $(this);
                }
            });
            var available = $(sel_column).height();
            var total_headings = d3.sum($(sel_accordion + " .panel-heading")
                                        .map(function(_, ph) { return $(ph).outerHeight(); }));
            available -= total_headings;
            for(var id in padding)
                available -= padding[id];
            var left = available, do_fit = false;
            for(id in heights)
                left -= heights[id];
            if(left>=0) {
                // they all fit, now just give the rest to greedy one (if any)
                if(greedy_one !== null) {
                    heights[greedy_one.get(0).id] += left;
                    do_fit = true;
                }
            }
            else {
                // they didn't fit
                left = available;
                var remaining = _.keys(heights),
                    done = false, i;
                var split = left/remaining.length;

                // see which need less than an even split and be done with those
                while(remaining.length && !done) {
                    done = true;
                    for(i = 0; i < remaining.length; ++i)
                        if(heights[remaining[i]] < split) {
                            left -= heights[remaining[i]];
                            remaining.splice(i,1);
                            --i;
                            done = false;
                        }
                    split = left/remaining.length;
                }
                // split the rest among the remainders
                for(i = 0; i < remaining.length; ++i)
                    heights[remaining[i]] = split;
                do_fit = true;
            }
            for(id in heights)
                $('#' + id).find(".panel-body").height(heights[id]);
            reshadow();
            var expected = $(sel_column).height();
            var got = d3.sum(_.values(padding)) + d3.sum(_.values(heights)) + total_headings;
            if(do_fit && expected != got)
                console.log("Error in vertical layout algo: filling " + expected + " pixels with " + got);
        },
        hide: function(persist, skip_calc) {
            // all collapsible sub-panels that are not "out" and not already collapsed, collapse them
            $(sel_accordion + " > .panel > div.panel-collapse:not(.collapse):not(.out)").collapse('hide');
            $(sel_collapser + " i").removeClass("icon-minus").addClass("icon-plus");
            collapsed_ = true;
            this.resize(skip_calc);
            if(persist && rcloud.config)
                rcloud.config.set_user_option(sel_to_opt(sel_accordion), true);
        },
        show: function(persist, skip_calc) {
            if(all_collapsed())
                set_collapse($(collapsibles()[0]), false, true);
            collapsibles().each(function() {
                $(this).collapse($(this).data("would-collapse") ? "hide" : "show");
            });
            $(sel_collapser + " i").removeClass("icon-plus").addClass("icon-minus");
            collapsed_ = false;
            this.resize(skip_calc);
            if(persist && rcloud.config)
                rcloud.config.set_user_option(sel_to_opt(sel_accordion), false);
        },
        calcwidth: function() {
            if(collapsed_)
                return 1;
            var widths = [];
            collapsibles().each(function() {
                var width = $(this).data("would-collapse") ? 1 : $(this).attr("data-colwidth");
                if(width > 0)
                    widths.push(width);
            });
            return d3.max(widths);
        }
    });
    return result;
};


RCloud.UI.collapsible_column.default_padder = function(el) {
    var el$ = $(el),
        body$ = el$.find('.panel-body'),
        padding = el$.outerHeight() - el$.height() +
            body$.outerHeight() - body$.height();
    return padding;
};

RCloud.UI.collapsible_column.default_sizer = function(el) {
    var el$ = $(el),
        $izer = el$.find(".widget-vsize"),
        height = $izer.height(),
        padding = RCloud.UI.collapsible_column.default_padder(el);
    return {height: height, padding: padding};
};
RCloud.UI.command_prompt = {
    prompt: null,
    history: null,
    init: function() {
        this.history = this.setup_prompt_history();
        this.prompt = this.setup_command_prompt();
    },
    get_language: function() {
        return $("#insert-cell-language option:selected").text();
    },
    focus: function() {
        // surely not the right way to do this
        if (!this.prompt)
            return;
        this.prompt.widget.focus();
        this.prompt.restore();
    },
    setup_prompt_history: function() {
        var entries_ = [], alt_ = [];
        var curr_ = 0;
        function curr_cmd() {
            return alt_[curr_] || (curr_<entries_.length ? entries_[curr_] : "");
        }
        var prefix_ = null;
        var result = {
            init: function() {
                prefix_ = "rcloud.history." + shell.gistname() + ".";
                var i = 0;
                entries_ = [];
                alt_ = [];
                while(1) {
                    var cmd = window.localStorage[prefix_+i],
                        cmda = window.localStorage[prefix_+i+".alt"];
                    if(cmda !== undefined)
                        alt_[i] = cmda;
                    if(cmd === undefined)
                        break;
                    entries_.push(cmd);
                    ++i;
                }
                curr_ = entries_.length;
                return curr_cmd();
            },
            execute: function(cmd) {
                if(cmd==="") return;
                alt_[entries_.length] = null;
                entries_.push(cmd);
                alt_[curr_] = null;
                curr_ = entries_.length;
                window.localStorage[prefix_+(curr_-1)] = cmd;
            },
            has_last: function() {
                return curr_>0;
            },
            last: function() {
                if(curr_>0) --curr_;
                return curr_cmd();
            },
            has_next: function() {
                return curr_<entries_.length;
            },
            next: function() {
                if(curr_<entries_.length) ++curr_;
                return curr_cmd();
            },
            change: function(cmd) {
                window.localStorage[prefix_+curr_+".alt"] = alt_[curr_] = cmd;
            }
        };
        return result;
    },

    setup_command_prompt: function() {
        var that = this;
        var prompt_div = $("#command-prompt");
        if (!prompt_div.length)
            return null;
        function set_ace_height() {
            var EXTRA_HEIGHT = 6;
            prompt_div.css({'height': (ui_utils.ace_editor_height(widget) + EXTRA_HEIGHT) + "px"});
            widget.resize();
            shell.scroll_to_end(0);
        }
        prompt_div.css({'background-color': "#fff"});
        prompt_div.addClass("r-language-pseudo");
        ace.require("ace/ext/language_tools");
        var widget = ace.edit(prompt_div[0]);
        set_ace_height();
        var RMode = ace.require("ace/mode/r").Mode;
        var session = widget.getSession();
        var doc = session.doc;
        widget.setOptions({
            enableBasicAutocompletion: true
        });
        session.setMode(new RMode(false, doc, session));
        session.on('change', set_ace_height);

        widget.setTheme("ace/theme/chrome");
        session.setUseWrapMode(true);
        widget.resize();
        var change_prompt = ui_utils.ignore_programmatic_changes(widget, this.history.change.bind(this.history));
        function execute(widget, args, request) {
            var code = session.getValue();
            if(code.length) {
                shell.new_cell(code, that.get_language(), true);
                change_prompt('');
            }
        }

        function last_row(widget) {
            var doc = widget.getSession().getDocument();
            return doc.getLength()-1;
        }

        function last_col(widget, row) {
            var doc = widget.getSession().getDocument();
            return doc.getLine(row).length;
        }

        function restore_prompt() {
            var cmd = that.history.init();
            change_prompt(cmd);
            var r = last_row(widget);
            ui_utils.ace_set_pos(widget, r, last_col(widget, r));
        }

        ui_utils.install_common_ace_key_bindings(widget, this.get_language.bind(this));

        var up_handler = widget.commands.commandKeyBinding[0].up,
            down_handler = widget.commands.commandKeyBinding[0].down;
        widget.commands.addCommands([{
            name: 'execute',
            bindKey: {
                win: 'Return',
                mac: 'Return',
                sender: 'editor'
            },
            exec: execute
        }, {
            name: 'execute-2',
            bindKey: {
                win: 'Alt-Return',
                mac: 'Alt-Return',
                sender: 'editor'
            },
            exec: execute
        }, {
            name: 'up-with-history',
            bindKey: 'up',
            exec: function(widget, args, request) {
                var pos = widget.getCursorPositionScreen();
                if(pos.row > 0)
                    up_handler.exec(widget, args, request);
                else {
                    if(that.history.has_last()) {
                        change_prompt(that.history.last());
                        var r = widget.getSession().getScreenLength();
                        ui_utils.ace_set_pos(widget, r, pos.column);
                    }
                    else
                        ui_utils.ace_set_pos(widget, 0, 0);
                }
            }
        }, {
            name: 'down-with-history',
            bindKey: 'down',
            exec: function(widget, args, request) {
                var pos = widget.getCursorPositionScreen();
                var r = widget.getSession().getScreenLength();
                if(pos.row < r-1)
                    down_handler.exec(widget, args, request);
                else {
                    if(that.history.has_next()) {
                        change_prompt(that.history.next());
                        ui_utils.ace_set_pos(widget, 0, pos.column);
                    }
                    else {
                        r = last_row(widget);
                        ui_utils.ace_set_pos(widget, r, last_col(widget, r));
                    }
                }
            }
        }
        ]);
        ui_utils.make_prompt_chevron_gutter(widget);

        return {
            widget: widget,
            restore: restore_prompt
        };
    }
};
/*
 * Adjusts the UI depending on whether notebook is read-only
 */
RCloud.UI.configure_readonly = function() {
    var readonly_notebook = $("#readonly-notebook");
    if(shell.notebook.controller.is_mine()) {
        if(shell.notebook.model.read_only()) {
            $('#revert-notebook').show();
            $('#save-notebook').hide();
        }
        else {
            $('#revert-notebook').hide();
            $('#save-notebook').show();
        }
    }
    else {
        $('#revert-notebook,#save-notebook').hide();
    }
    if(shell.notebook.model.read_only()) {
        $('#prompt-div').hide();
        readonly_notebook.show();
        $('#save-notebook').hide();
        $('#output').sortable('disable');
        $('#upload-to-notebook')
            .prop('checked', false)
            .attr("disabled", true);
        RCloud.UI.scratchpad.set_readonly(true);
    }
    else {
        $('#prompt-div').show();
        readonly_notebook.hide();
        $('#save-notebook').show();
        $('#output').sortable('enable');
        $('#upload-to-notebook')
            .prop('checked', false)
            .removeAttr("disabled");
        RCloud.UI.scratchpad.set_readonly(false);
    }
};
(function() {

var fatal_dialog_;

RCloud.UI.fatal_dialog = function(message, label, href) {
    if (_.isUndefined(fatal_dialog_)) {
        var default_button = $("<button type='submit' class='btn btn-primary' style='float:right'>" + label + "</span>"),
            ignore_button = $("<span class='btn' style='float:right'>Ignore</span>"),
            body = $('<div />')
                .append('<h1>Aw, shucks</h1>',
                        '<p>' + message + '</p>',
                        default_button, ignore_button,
                        '<div style="clear: both;"></div>');
        default_button.click(function(e) {
            e.preventDefault();
            window.location = href;
        });
        ignore_button.click(function() {
            fatal_dialog_.modal("hide");
        });
        fatal_dialog_ = $('<div id="fatal-dialog" class="modal fade" />')
            .append($('<div class="modal-dialog" />')
                    .append($('<div class="modal-content" />')
                            .append($('<div class="modal-body" />')
                                    .append(body))));
        $("body").append(fatal_dialog_);
        fatal_dialog_.on("shown.bs.modal", function() {
            default_button.focus();
        });
    }
    fatal_dialog_.modal({keyboard: false});
};

})();
RCloud.UI.help_frame = {
    init: function() {
        // i can't be bothered to figure out why the iframe causes onload to be triggered early
        // if this code is directly in edit.html
        $("#help-body").append('<iframe id="help-frame" frameborder="0" />');
    },
    show: function() {
        $("#help-body").css('display', 'table-row');
        $("#help-body").attr('data-widgetheight', "greedy");
        $("#collapse-help").trigger('size-changed');
        RCloud.UI.left_panel.collapse($("#collapse-help"), false);
        ui_utils.prevent_backspace($("#help-frame").contents());
    },
    display_content: function(content) {
        $("#help-frame").contents().find('body').html(content);
        this.show();
    },
    display_href: function(href) {
        $("#help-frame").attr("src", href);
        this.show();
    }
};
RCloud.UI.init = function() {
    $("#fork-notebook").click(function() {
        var is_mine = shell.notebook.controller.is_mine();
        var gistname = shell.gistname();
        var version = shell.version();
        editor.fork_notebook(is_mine, gistname, version);
    });
    $("#revert-notebook").click(function() {
        var is_mine = shell.notebook.controller.is_mine();
        var gistname = shell.gistname();
        var version = shell.version();
        editor.revert_notebook(is_mine, gistname, version);
    });
    $("#open-in-github").click(function() {
        window.open(shell.github_url(), "_blank");
    });
    $("#open-from-github").click(function() {
        var result = prompt("Enter notebook ID or github URL:");
        if(result !== null)
            shell.open_from_github(result);
    });

    $("#import-notebooks").click(function() {
        shell.import_notebooks();
    });
    var saveb = $("#save-notebook");
    saveb.click(function() {
        shell.save_notebook();
    });
    shell.notebook.controller.save_button(saveb);
    $('#export-notebook-file').click(function() {
        shell.export_notebook_file();
    });
    $('#export-notebook-as-r').click(function() {
        shell.export_notebook_as_r_file();
    });
    $('#import-notebook-file').click(function() {
        shell.import_notebook_file();
    });
    $("#file").change(function() {
        $("#progress-bar").css("width", "0%");
    });
    $("#upload-submit").click(function() {
        if($("#file")[0].files.length===0)
            return;
        var to_notebook = ($('#upload-to-notebook').is(':checked'));
        RCloud.UI.upload_files(to_notebook);
    });
    var showOverlay_;
    //prevent drag in rest of the page except asset pane and enable overlay on asset pane
    $(document).on('dragstart dragenter dragover', function (e) {
        var dt = e.originalEvent.dataTransfer;
        if(!dt)
            return;
        if (dt.types !== null &&
                   (dt.types.indexOf ?
                    dt.types.indexOf('Files') != -1 :
                    dt.types.contains('application/x-moz-file'))) {
            if (!shell.notebook.model.read_only()) {
                e.stopPropagation();
                e.preventDefault();
                $('#asset-drop-overlay').css({'display': 'block'});
                showOverlay_ = true;
            }
            else {
                e.stopPropagation();
                e.preventDefault();
            }
        }
    });
    $(document).on('drop dragleave', function (e) {
        e.stopPropagation();
        e.preventDefault();
        showOverlay_ = false;
        setTimeout(function() {
            if(!showOverlay_) {
                $('#asset-drop-overlay').css({'display': 'none'});
            }
        }, 100);
    });
    //allow asset drag from local to asset pane and highlight overlay for drop area in asset pane
    $('#scratchpad-wrapper').bind({
        drop: function (e) {
            e = e.originalEvent || e;
            var files = (e.files || e.dataTransfer.files);
            var dt = e.dataTransfer;
            if(!shell.notebook.model.read_only())
                RCloud.UI.upload_files(true, {files: files});
            $('#asset-drop-overlay').css({'display': 'none'});
        },
        "dragenter dragover": function(e) {
            var dt = e.originalEvent.dataTransfer;
            if(dt.items.length === 1 && !shell.notebook.model.read_only())
                dt.dropEffect = 'copy';
        }
    });


    RCloud.UI.left_panel.init();
    RCloud.UI.middle_column.init();
    RCloud.UI.right_panel.init();
    RCloud.UI.session_pane.init();

    var non_notebook_panel_height = 246;
    $('.notebook-tree').css('height', (window.innerHeight - non_notebook_panel_height)+'px');

    $("#search-form").submit(function(e) {
        e.preventDefault();
        e.stopPropagation();
        var qry = $('#input-text-search').val();
        $('#input-text-search').blur();
        RCloud.UI.search.exec(qry);
        return false;
    });
    $('#help-form').submit(function(e) {
        e.preventDefault();
        e.stopPropagation();
        var topic = $('#input-text-help').val();
        $('#input-text-help').blur();
        rcloud.help(topic);
        return false;
    });

    $("#collapse-search").data("panel-sizer", function(el) {
        var padding = RCloud.UI.collapsible_column.default_padder(el);
        var height = 24 + $('#search-summary').height() + $('#search-results').height();
        height += 30; // there is only so deep you can dig
        return {height: height, padding: padding};
    });

    // hmm maybe greedy isn't greedy enough
    $("#collapse-help").data("panel-sizer", function(el) {
        if($('#help-body').css('display') === 'none')
            return RCloud.UI.collapsible_column.default_sizer(el);
        else return {
            padding: RCloud.UI.collapsible_column.default_padder(el),
            height: 9000
        };
    });

    $("#collapse-assets").data("panel-sizer", function(el) {
        return {
            padding: RCloud.UI.collapsible_column.default_padder(el),
            height: 9000
        };
    });

    $("#collapse-file-upload").data("panel-sizer", function(el) {
        var padding = RCloud.UI.collapsible_column.default_padder(el);
        var height = 24 + $('#file-upload-controls').height() + $('#file-upload-results').height();
        //height += 30; // there is only so deep you can dig
        return {height: height, padding: padding};
    });

    $("#insert-new-cell").click(function() {
        var language = $("#insert-cell-language option:selected").text();
        shell.new_cell("", language, false);
        var vs = shell.notebook.view.sub_views;
        vs[vs.length-1].show_source();
    });

    $("#rcloud-logout").click(function() {
        // let the server-side script handle this so it can
        // also revoke all tokens
        window.location.href = '/logout.R';
    });

    $("#comment-submit").click(function() {
        if(!Notebook.empty_for_github($("#comment-entry-body").val())) {
            editor.post_comment($("#comment-entry-body").val());
        }
        return false;
    });

    $("#comment-entry-body").keydown(function (e) {
        if ((e.keyCode == 10 || e.keyCode == 13 || e.keyCode == 115 || e.keyCode == 19) &&
            (e.ctrlKey || e.metaKey)) {
            if(!Notebook.empty_for_github($("#comment-entry-body").val())) {
                editor.post_comment($("#comment-entry-body").val());
            }
            return false;
        }
        return undefined;
    });

    $("#run-notebook").click(shell.run_notebook);

    RCloud.UI.scratchpad.init();
    RCloud.UI.command_prompt.init();
    RCloud.UI.help_frame.init();

    //////////////////////////////////////////////////////////////////////////
    // allow reordering cells by dragging them
    function make_cells_sortable() {
        var cells = $('#output');
        cells.sortable({
            items: "> .notebook-cell",
            start: function(e, info) {
                $(e.toElement).addClass("grabbing");
                // http://stackoverflow.com/questions/6140680/jquery-sortable-placeholder-height-problem
                info.placeholder.height(info.item.height());
            },
            stop: function(e, info) {
                $(e.toElement).removeClass("grabbing");
            },
            update: function(e, info) {
                var ray = cells.sortable('toArray');
                var model = info.item.data('rcloud.model'),
                    next = info.item.next().data('rcloud.model');
                shell.notebook.controller.move_cell(model, next);
            },
            handle: " .ace_gutter-layer",
            scroll: true,
            scrollSensitivity: 40,
            forcePlaceholderSize: true
        });
    }
    make_cells_sortable();

    //////////////////////////////////////////////////////////////////////////
    // resizeable panels
    $('.notebook-sizer').draggable({
        axis: 'x',
        opacity: 0.75,
        zindex: 10000,
        revert: true,
        revertDuration: 0,
        grid: [window.innerWidth/12, 0],
        stop: function(event, ui) {
            var wid_over_12 = window.innerWidth/12;
            // position is relative to parent, the notebook
            var diff, size;
            if($(this).hasClass('left')) {
                diff = Math.round(ui.position.left/wid_over_12);
                size = Math.max(1,
                                Math.min(+RCloud.UI.left_panel.colwidth() + diff,
                                         11 - RCloud.UI.right_panel.colwidth()));
                if(size===1)
                    RCloud.UI.left_panel.hide(true, true);
                else
                    RCloud.UI.left_panel.show(true, true);
                RCloud.UI.left_panel.colwidth(size);
                RCloud.UI.middle_column.update();
            }
            else if($(this).hasClass('right')) {
                diff = Math.round(ui.position.left/wid_over_12) - RCloud.UI.middle_column.colwidth();
                size = Math.max(1,
                                Math.min(+RCloud.UI.right_panel.colwidth() - diff,
                                         11 - RCloud.UI.left_panel.colwidth()));
                if(size===1)
                    RCloud.UI.right_panel.hide(true, true);
                else
                    RCloud.UI.right_panel.show(true, true);
                RCloud.UI.right_panel.colwidth(size);
                RCloud.UI.middle_column.update();
            }
            else throw new Error('unexpected shadow drag with classes ' + $(this).attr('class'));
            // revert to absolute position
            $(this).css({left: "", top: ""});
        }
    });

    // make grid responsive to window resize
    $(window).resize(function() {
        var wid_over_12 = window.innerWidth/12;
        $('.notebook-sizer').draggable('option', 'grid', [wid_over_12, 0]);
    });

    //////////////////////////////////////////////////////////////////////////
    // autosave when exiting. better default than dropping data, less annoying
    // than prompting
    $(window).bind("unload", function() {
        shell.save_notebook();
        return true;
    });

    $(".panel-collapse").collapse({toggle: false});

    //////////////////////////////////////////////////////////////////////////
    // view mode things
    $("#edit-notebook").click(function() {
        window.location = "edit.html?notebook=" + shell.gistname();
    });

    ui_utils.prevent_backspace($(document));

    // prevent unwanted document scrolling e.g. by dragging
    $(document).on('scroll', function() {
        $(this).scrollLeft(0);
        $(this).scrollTop(0);
    });

    // prevent left-right scrolling of notebook area
    $('#rcloud-cellarea').on('scroll', function() {
        $(this).scrollLeft(0);
    });
};
RCloud.UI.left_panel = (function() {
    var result = RCloud.UI.collapsible_column("#left-column",
                                              "#accordion-left", "#left-pane-collapser");
    var base_hide = result.hide.bind(result),
        base_show = result.show.bind(result);

    _.extend(result, {
        hide: function(persist, calc) {
            $("#new-notebook").hide();
            base_hide(persist, calc);
        },
        show: function(persist, calc) {
            $("#new-notebook").show();
            base_show(persist);
        }
    });
    return result;
}());

RCloud.UI.load = function(promise) {
    RCloud.UI.left_panel.load(promise);
    RCloud.UI.right_panel.load(promise);
};
RCloud.UI.middle_column = (function() {
    var result = RCloud.UI.column("#middle-column, #prompt-div");

    _.extend(result, {
        update: function() {
            var size = 12 - RCloud.UI.left_panel.colwidth() - RCloud.UI.right_panel.colwidth();
            result.colwidth(size);
            shell.notebook.view.reformat();
        }
    });
    return result;
}());
RCloud.UI.notebook_title = (function() {
    var last_editable_ =  null;
    function rename_current_notebook(name) {
        editor.rename_notebook(name)
            .then(function() {
                result.set(name);
            });
    }
    // always select all text after last slash, or all text
    function select(el) {
        if(el.childNodes.length !== 1 || el.firstChild.nodeType != el.TEXT_NODE)
            throw new Error('expecting simple element with child text');
        var text = el.firstChild.textContent;
        var range = document.createRange();
        range.setStart(el.firstChild, text.lastIndexOf('/') + 1);
        range.setEnd(el.firstChild, text.length);
        return range;
    }
    var editable_opts = {
        change: rename_current_notebook,
        select: select,
        validate: function(name) { return editor.validate_name(name); }
    };

    var result = {
        set: function (text) {
            $("#notebook-author").text(shell.notebook.model.user());
            $('#author-title-dash').show();

            var is_read_only = shell.notebook.model.read_only();
            var active_text = text;
            var ellipt_start = false, ellipt_end = false;
            var title = $('#notebook-title');
            title.text(text);
            while(window.innerWidth - title.width() < 505) {
                var slash = text.search('/');
                if(slash >= 0) {
                    ellipt_start = true;
                    text = text.slice(slash+1);
                }
                else {
                    ellipt_end = true;
                    text = text.substr(0, text.length - 2);
                }
                title.text((ellipt_start ? '.../' : '') +
                           text +
                           (ellipt_end ? '...' : ''));
            }
            ui_utils.editable(title, $.extend({allow_edit: !is_read_only,
                                               inactive_text: title.text(),
                                               active_text: active_text},
                                              editable_opts));
        }, make_editable: function(node, editable) {
            function get_title(node) {
                return $('.jqtree-title:not(.history)', node.element);
            }
            if(last_editable_ && (!node || last_editable_ !== node))
                ui_utils.editable(get_title(last_editable_), 'destroy');
            if(node) {
                ui_utils.editable(get_title(node),
                                  $.extend({allow_edit: editable,
                                            inactive_text: node.name,
                                            active_text: node.full_name},
                                           editable_opts));
            }
            last_editable_ = node;
        }
    };
    return result;
})();
(function() {

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

RCloud.UI.with_progress = function(promise_thunk, delay) {
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
    return Promise.resolve(done)
        .then(promise_thunk)
        .then(function(v) {
            done();
            return v;
        }).catch(function(error) {
            done();
            throw error;
        });
};

RCloud.UI.prevent_progress_modal = function() {
    if (allowed === 1) {
        if (progress_counter > 0) {
            clear_cursor();
            clear_curtain();
        }
    }
    allowed -= 1;
};

RCloud.UI.allow_progress_modal = function() {
    if (allowed === 0) {
        if (progress_counter > 0) {
            set_cursor();
            set_curtain();
        }
    }
    allowed += 1;
};

})();
RCloud.UI.right_panel = (function() {
    var result = RCloud.UI.collapsible_column("#right-column",
                                              "#accordion-right", "#right-pane-collapser");
    return result;
}());
RCloud.UI.scratchpad = {
    session: null,
    widget: null,
    exists: false,
    current_model: null,
    change_content: null,
    init: function() {
        var that = this;
        function setup_scratchpad(div) {
            var inner_div = $("<div></div>");
            var clear_div = $("<div style='clear:both;'></div>");
            div.append(inner_div);
            div.append(clear_div);
            var ace_div = $('<div style="width:100%; height:100%"></div>');
            ace_div.css({'background-color': "#f1f1f1"});
            inner_div.append(ace_div);
            ace.require("ace/ext/language_tools");
            var widget = ace.edit(ace_div[0]);
            var RMode = ace.require("ace/mode/r").Mode;
            var session = widget.getSession();
            that.session = session;
            that.widget = widget;
            var doc = session.doc;
            session.on('change', function() {
                widget.resize();
            });

            widget.setOptions({
                enableBasicAutocompletion: true
            });
            session.setMode(new RMode(false, doc, session));
            session.setUseWrapMode(true);
            widget.resize();
            ui_utils.on_next_tick(function() {
                session.getUndoManager().reset();
                widget.resize();
            });
            that.change_content = ui_utils.ignore_programmatic_changes(
                that.widget, function() {
                    if (that.current_model)
                        that.current_model.parent_model.on_dirty();
                });
            ui_utils.install_common_ace_key_bindings(widget, function() {
                return that.current_model.language();
            });
            $("#collapse-assets").on("shown.bs.collapse", function() {
                widget.resize();
            });
        }
        var scratchpad_editor = $("#scratchpad-editor");
        if (scratchpad_editor.length) {
            this.exists = true;
            setup_scratchpad(scratchpad_editor);
        }
        $("#new-asset > a").click(function() {
            // FIXME prompt, yuck. I know, I know.
            var filename = prompt("Choose a filename for your asset");
            if (!filename)
                return;
            if (Notebook.is_part_name(filename)) {
                alert("Asset names cannot start with 'part[0-9]', sorry!");
                return;
            }
            var found = shell.notebook.model.has_asset(filename);
            if(found)
                found.controller.select();
            else {
                // very silly i know
                var comment_text = function(text, ext) {
                    switch(ext) {
                    case 'css': return '/* ' + text + ' */\n';
                    case 'js': return '// ' + text + '\n';
                    case 'html': return '<!-- ' + text + ' -->\n';
                    default: return '# ' + text + '\n';
                    }
                };
                shell.notebook.controller
                    .append_asset(comment_text("New file " + filename, filename.match(/\.(.*)/)[1]), filename)
                    .then(function(controller) {
                        controller.select();
                    })
                    .then(function() {
                        ui_utils.ace_set_pos(RCloud.UI.scratchpad.widget, 2, 1);
                    });
            }
        });
    },
    // FIXME this is completely backwards
    set_model: function(asset_model) {
        var that = this;
        if(!this.exists)
            return;
        if (this.current_model) {
            this.current_model.cursor_position(this.widget.getCursorPosition());
            // if this isn't a code smell I don't know what is.
            if (this.current_model.content(this.widget.getValue())) {
                this.current_model.parent_model.controller.update_asset(this.current_model);
            }
        }
        this.current_model = asset_model;
        if (!this.current_model) {
            that.change_content("");
            that.widget.resize();
            that.widget.setReadOnly(true);
            $('#scratchpad-editor > *').hide();
            $('#asset-link').hide();
            return;
        }
        that.widget.setReadOnly(false);
        $('#scratchpad-editor > *').show();
        this.change_content(this.current_model.content());
        this.update_asset_url();
        $('#asset-link').show();
        // restore cursor
        var model_cursor = asset_model.cursor_position();
        if (model_cursor) {
            ui_utils.ace_set_pos(this.widget, model_cursor);
        } else {
            ui_utils.ace_set_pos(this.widget, 0, 0);
        }
        ui_utils.on_next_tick(function() {
            that.session.getUndoManager().reset();
        });
        that.language_updated();
        that.widget.resize();
        that.widget.focus();
    },
    // this behaves like cell_view's update_model
    update_model: function() {
        return this.current_model ?
            this.current_model.content(this.widget.getSession().getValue()) :
            null;
    }, content_updated: function() {
        var range = this.widget.getSelection().getRange();
        var changed = this.current_model.content();
        this.change_content(changed);
        this.widget.getSelection().setSelectionRange(range);
        return changed;
    }, language_updated: function() {
        // github gist detected languages
        var modes = {
            R: "ace/mode/r",
            Python: "ace/mode/python",
            Markdown: "ace/mode/rmarkdown",
            CSS: "ace/mode/css",
            JavaScript: "ace/mode/javascript",
            Text: "ace/mode/text"
        };
        var lang = this.current_model.language();
        var mode = ace.require(modes[lang] || modes.Text).Mode;
        this.session.setMode(new mode(false, this.session.doc, this.session));
    }, set_readonly: function(readonly) {
        if(!shell.is_view_mode()) {
            ui_utils.set_ace_readonly(this.widget, readonly);
            if(readonly)
                $('#new-asset').hide();
            else
                $('#new-asset').show();
        }
    }, update_asset_url: function() {
        // this function probably belongs elsewhere
        function make_asset_url(model) {
            return window.location.protocol + '//' + window.location.host + '/notebook.R/' +
                    model.parent_model.controller.current_gist().id + '/' + model.filename();
        }
        if(this.current_model)
            $('#asset-link').attr('href', make_asset_url(this.current_model));
    }, clear: function() {
        if(!this.exists)
            return;
        this.change_content("");
        this.session.getUndoManager().reset();
        this.widget.resize();
    }
};
RCloud.UI.search = {
    exec: function(query) {
        function summary(html) {
            $("#search-summary").show().html($("<h4 />").append(html));
        }
        function create_list_of_search_results(d) {
            var i;
            if(d === null || d === "null" || d === "") {
                summary("No Results Found");
            } else if(d[0] === "error") {
                d[1] = d[1].replace(/\n/g, "<br/>");
                summary("ERROR:\n" + d[1]);
            } else {
                if(typeof (d) === "string") {
                    d = JSON.parse("[" + d + "]");
                }
                //convert any string type part to json object : not required most of the time
                for(i = 0; i < d.length; i++) {
                    if(typeof (d[i]) === "string") {
                        d[i] = JSON.parse(d[i]);
                    }
                }
                d.sort(function(a, b) {
                    var astars = +(a.starcount||0), bstars = +(b.starcount||0);
                    return bstars-astars;
                });
                var len = d.length;
                var search_results = "";
                var star_count;
                var qtime = 0;
                //iterating for all the notebooks got in the result/response
                for(i = 0; i < len; i++) {
                    try {
                        qtime = d[0].QTime;
                        if(typeof d[i].starcount === "undefined") {
                            star_count = 0;
                        } else {
                            star_count = d[i].starcount;
                        }
                        var notebook_id = d[i].id;
                        var image_string = "<i class=\"icon-star\" style=\"font-size: 110%; line-height: 90%;\"><sub>" + star_count + "</sub></i>";
                        d[i].parts = JSON.parse(d[i].parts);
                        var parts_table = "";
                        var inner_table = "";
                        var added_parts = 0;
                        //displaying only 5 parts of the notebook sorted based on relevancy from solr
                        for(var k = 0; k < d[i].parts.length && added_parts < 5; k++) {
                            inner_table = "";
                            var ks = Object.keys(d[i].parts[k]);
                            if(ks.length > 0 && d[i].parts[k].content !== "") {
                                var content = d[i].parts[k].content;
                                if(typeof content === "string")
                                    content = [content];
                                if(content.length > 0)
                                    parts_table += "<tr><th class='search-result-part-name'>" + d[i].parts[k].filename + "</th></tr>";
                                for(var l = 0; l < content.length; l++)
                                    inner_table += "<tr><td class='search-result-line-number'>" + (l + 1) + "</td><td class='search-result-code'><code>" + content[l] + "</code></td></tr>";

                                added_parts++;
                            }
                            if(inner_table !== "") {
                                inner_table = "<table>" + inner_table + "</table>";
                                parts_table += "<tr><td>" + inner_table + "</td></tr>";
                            }
                        }
                        if(parts_table !== "") {
                            parts_table = "<table>" + parts_table + "</table>";
                        }
                        search_results += "<table class='search-result-item' width=100%><tr><td width=10%>" +
                            "<a id=\"open_" + i + "\" href='#' data-gistname='" + notebook_id + "' class='search-result-heading'>" +
                            d[i].user + " / " + d[i].notebook + "</a>" +
                            image_string + "<br/><span class='search-result-modified-date'>modified at <i>" + d[i].updated_at + "</i></span></td></tr>";
                        if(parts_table !== "")
                            search_results += "<tr><td colspan=2 width=100% style='font-size: 12'><div>" + parts_table + "</div></td></tr>";
                        search_results += "</table>";
                    } catch(e) {
                        summary("Error : \n" + e);
                    }
                }
                var qry = decodeURIComponent(query);
                qry = qry.replace(/</g,'&lt;');
                qry = qry.replace(/>/g,'&gt;');
                var search_summary = len + " Results Found"; //+ " <i style=\"font-size:10px\"> Response Time:"+qtime+"ms</i>";
                summary(search_summary);
                $("#search-results-row").css('display', 'table-row');
                $('#search-results').html(search_results);
                $("#search-results .search-result-heading").click(function(e) {
                    e.preventDefault();
                    var gistname = $(this).attr("data-gistname");
                    editor.open_notebook(gistname, null, true, e.metaKey || e.ctrlKey);
                    return false;
                });
            }
            $("#collapse-search").trigger("size-changed");
        }

        summary("Searching...");
        $("#search-results-row").hide();
        $("#search-results").html("");
        query = encodeURIComponent(query);
        RCloud.UI.with_progress(function() {
            return rcloud.search(query)
                .then(function(v) {
                    create_list_of_search_results(v);
                });
        });
    }
};
RCloud.UI.session_pane = {
    init: function() {
        // detect where we will show errors
        this.error_dest_ = $("#session-info");
        if(this.error_dest_.length) {
            this.show_error_area = function() {
                RCloud.UI.right_panel.collapse($("#collapse-session-info"), false, false);
            };
        }
        else {
            this.error_dest_ = $("#output");
            this.show_error_area = function() {};
        }

        var that = this;
        //////////////////////////////////////////////////////////////////////
        // bluebird unhandled promise handler
        Promise.onPossiblyUnhandledRejection(function(e, promise) {
            var msg = "";
            // bluebird will print the message for Chrome/Opera but no other browser
            if(!window.chrome && e.message)
                msg += "Error: " + e.message + "\n";
            msg += e.stack;
            console.log(msg);
            that.post_error(msg);
        });

    },
    error_dest: function() {
        return this.error_dest_;
    },
    post_error: function(msg, dest) {
        var errclass = 'session-error';
        if (typeof msg === 'string') {
            msg = ui_utils.string_error(msg);
            errclass = 'session-error spare';
        }
        else if (typeof msg !== 'object')
            throw new Error("post_error expects a string or a jquery div");
        msg.addClass(errclass);
        dest = dest || this.error_dest_;
        dest.append(msg);
        this.show_error_area();
        ui_utils.on_next_tick(function() {
            ui_utils.scroll_to_after($("#session-info"));
        });
    }
};
RCloud.UI.share_button = {
    set_link: function(notebook) {
        var link = window.location.protocol + '//' + window.location.host +
            '/view.R/' + shell.notebook.model.user() +
            '/' + notebook.description;
        // var link = window.location.protocol + '//' + window.location.host + '/view.html?notebook=' + shell.gistname();
        var v = shell.version();
        if(v)
            link += '&version='+v;

        $("#share-link").attr("href", link);
    }
};
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
