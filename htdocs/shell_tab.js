var shell = (function() {

    var version_ = null,
        gistname_ = null,
        notebook_user_ = null,
        is_mine_ = null,
        github_url_ = null,
        gist_url_ = null,
        prefix_ = null,
        prompt_ = null,
        notebook_model_ = Notebook.create_model(),
        notebook_view_ = Notebook.create_html_view(notebook_model_, $("#output")),
        notebook_controller_ = Notebook.create_controller(notebook_model_),
        first_session_ = true,
        prompt_history_ = null;

    prompt_history_ = (function() {
        var entries_ = [], alt_ = [];
        var curr_ = 0;
        function curr_cmd() {
            return alt_[curr_] || (curr_<entries_.length ? entries_[curr_] : "");
        }
        var result = {
            init: function() {
                prefix_ = "rcloud.history." + gistname_ + ".";
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
            last: function() {
                if(curr_>0) --curr_;
                return curr_cmd();
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
    })();

    function setup_scratchpad(div) {
        div.css({'background-color': "#f1f1f1"});
        ace.require("ace/ext/language_tools");
        var widget = ace.edit(div[0]);
        var RMode = require("ace/mode/r").Mode;
        var session = widget.getSession();
        var doc = session.doc;
        widget.setOptions({
            enableBasicAutocompletion: true
        });
        session.setMode(new RMode(false, doc, session));
        session.setUseWrapMode(true);
        widget.resize();
    }

    function setup_command_prompt(prompt_div) {
        function set_ace_height() {
            prompt_div.css({'height': ui_utils.ace_editor_height(widget) + "px"});
            widget.resize();
        }
        prompt_div.css({'background-color': "#f1f1f1"});
        prompt_div.addClass("r-language-pseudo");
        ace.require("ace/ext/language_tools");
        var widget = ace.edit(prompt_div[0]);
        set_ace_height();
        var RMode = require("ace/mode/r").Mode;
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
        var change_prompt = ui_utils.ignore_programmatic_changes(widget, prompt_history_.change.bind(prompt_history_));

        function execute(widget, args, request) {
            var code = session.getValue();
            if(code.length) {
                result.new_interactive_cell(code, true);
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
            var cmd = prompt_history_.init();
            change_prompt(cmd);
            var r = last_row(widget);
            ui_utils.ace_set_pos(widget, r, last_col(widget, r));
        }

        ui_utils.install_common_ace_key_bindings(widget);

        // note ace.js typo which we need to correct when we update ace
        var up_handler = widget.commands.commandKeyBinding[0]["up"],
            down_handler = widget.commands.commandKeyBinding[0]["down"];
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
                win: 'Ctrl-Return',
                mac: 'Command-Return',
                sender: 'editor'
            },
            exec: execute
        }, {
            name: 'up-with-history',
            bindKey: 'up',
            exec: function(widget, args, request) {
                var pos = widget.getCursorPosition();
                if(pos.row > 0)
                    up_handler.exec(widget, args, request);
                else {
                    change_prompt(prompt_history_.last());
                    var r = last_row(widget);
                    ui_utils.ace_set_pos(widget, r, last_col(widget, r));
                }
            }
        }, {
            name: 'down-with-history',
            bindKey: 'down',
            exec: function(widget, args, request) {
                var pos = widget.getCursorPosition();
                var r = last_row(widget);
                if(pos.row < r)
                    down_handler.exec(widget, args, request);
                else {
                    change_prompt(prompt_history_.next());
                    ui_utils.ace_set_pos(widget, 0, last_col(widget, 0));
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

    function do_interface_readonlyness() {
        var fork_revert = $('#fork-revert-notebook');
        if(notebook_model_.read_only()) {
            $('#prompt-div').hide();
            fork_revert.text(is_mine_ ? 'Revert' : 'Fork');
            fork_revert.show();
            $('#save-notebook').hide();
            $('#output').sortable('disable');
        }
        else {
            $('#prompt-div').show();
            fork_revert.hide();
            $('#save-notebook').show();
            $('#output').sortable('enable');
        }
    }

    function make_cells_sortable() {
        var cells = $('#output');
        cells.sortable({
            items: "> .notebook-cell",
            start: function(e, info) {
                $(e.toElement).addClass("grabbing");
            },
            stop: function(e, info) {
                $(e.toElement).removeClass("grabbing");
            },
            update: function(e, info) {
                var ray = cells.sortable('toArray');
                var model = info.item.data('rcloud.model'),
                    next = info.item.next().data('rcloud.model');
                notebook_controller_.move_cell(model, next);
            },
            handle: " .ace_gutter-layer",
            scroll: true,
            scrollSensitivity: 40
        });
    }

    function sanitize_notebook(notebook) {
        notebook = _.pick(notebook, 'description', 'files');
        var files = notebook.files;
        delete files.r_attributes;
        delete files.r_type;
        for(var fn in files)
            files[fn] = _.pick(files[fn], 'content');
        return notebook;
    }

    function notebook_is_mine(notebook) {
        return rcloud.username() === notebook.user.login;
    }

    function set_notebook_title(notebook) {
        var is_read_only = result.notebook.model.read_only();
        var desc = notebook.description;
        result.set_title(desc);
        var ellipt_start = false, ellipt_end = false;
        while(window.innerWidth - $("#notebook-title").width() < 505) {
            var slash = desc.search('/');
            if(slash >= 0) {
                ellipt_start = true;
                desc = desc.slice(slash+1);
            }
            else {
                ellipt_end = true;
                desc = desc.substr(0, desc.length - 2);
            }
            $("#notebook-title").text((ellipt_start ? '.../' : '')
                                      + desc +
                                      (ellipt_end ? '...' : ''));
        }
        var title = $('#notebook-title');
        ui_utils.make_editable(title, !is_read_only, function(text) {
            if(editor.rename_notebook(shell.gistname(), text)) {
                result.set_title(text);
                return true;
            }
            return false;
        });
    }

    function set_share_link() {
        var link = window.location.protocol + '//' + window.location.host + '/view.html?notebook=' + shell.gistname();
        var v = shell.version();
        if(v)
            link += '&version='+v;

        $("#share-link").attr("href", link);
    }

    function reset_session() {
        if (first_session_) {
            first_session_ = false;
            return rcloud.with_progress();
        } else {
            return rcloud.with_progress(function(done) {
                rclient.close();
                // FIXME this is a bit of an annoying duplication of code on main.js and view.js

                return new Promise(function(resolve, reject) {
                    rclient = RClient.create({
                        debug: rclient.debug,
                        host: rclient.host,
                        on_connect: function(ocaps) {
                            rcloud = RCloud.create(ocaps.rcloud);
                            rcloud.session_init(rcloud.username(), rcloud.github_token());
                            rcloud.display.set_device_pixel_ratio();

                            resolve(rcloud.init_client_side_data().then(function() {
                                $("#output").find(".alert").remove();
                                return done;
                            }));
                        },
                        on_error: function(error) {
                            // if we fail to reconnect we still want
                            // to resolve the promise so with_progress can continue.
                            if (!rclient.running) {
                                resolve(done);
                            }
                            return false;
                        },
                        on_data: function(v) {
                            v = v.value.json();
                            oob_handlers[v[0]] && oob_handlers[v[0]](v.slice(1));
                        }
                    });
                });
            });
        }
    }

    function on_new(notebook) {
        set_notebook_title(notebook);
        gistname_ = notebook.id;
        version_ = null;
        set_share_link();
        is_mine_ = notebook_is_mine(notebook);
        do_interface_readonlyness();
        if(prompt_) {
            prompt_.widget.focus(); // surely not the right way to do this
            prompt_.restore();
        }
        return notebook;
    }

    function on_load(notebook) {
        set_notebook_title(notebook);
        set_share_link();

        is_mine_ = notebook_is_mine(notebook);
        notebook_user_ = notebook.user.login;
        do_interface_readonlyness();
        _.each(notebook_view_.sub_views, function(cell_view) {
            cell_view.show_source();
        });
        if(prompt_) {
            prompt_.widget.focus(); // surely not the right way to do this
            prompt_.restore();
        }
        return notebook;
    }

    var prompt_div = $("#command-prompt");
    if(prompt_div.length)
        prompt_ = setup_command_prompt(prompt_div);

    var scratchpad_editor = $("#scratchpad-editor");
    if (scratchpad_editor.length) {
        setup_scratchpad(scratchpad_editor);
    }

    make_cells_sortable();

    var first = true;
    var result = {
        notebook: {
            model: notebook_model_,
            view: notebook_view_,
            controller: notebook_controller_
        },
        prompt_widget: prompt_? prompt_.widget : null,
        gistname: function() {
            return gistname_;
        },
        version: function() {
            return version_;
        },
        init: function() {
            rcloud.get_conf_value("github.base.url").then(function(url) { github_url_ = url; });
            rcloud.get_conf_value("github.gist.url").then(function(url) { gist_url_ = url; });
        },
        is_old_github: function() {
            return !gist_url_;
        },
        fork_or_revert_button: function() {
            // hmm messages bouncing around everywhere
            editor.fork_or_revert_notebook(is_mine_, gistname_, version_);
        },
        set_title: function(desc) {
            $("#notebook-title")
                .text(desc)
                .data('restore_edit', desc);
        },
        detachable_div: function(div) {
            var on_remove = function() {};
            var on_detach = function() {};
            var result = $("<div class='detachable' style='position: relative; z-index: 0;'></div>");
            var inner_div = $("<div style='float: right'></div>");
            result.append(inner_div);
            result.append(div);
            var sign_out = $("<i class='icon-signout figure-icon' style='position: absolute; right: 5px; top: 25px'>");
            sign_out.click(function(){
                $(result).detach().draggable();
                $("#output").append(result);
                make_fixed_menu(result[0], true);
                $(sign_out).remove();
                on_detach();
            });
            var trash = $("<i class='icon-trash figure-icon' style='position: absolute; right: 5px; top: 5px'>");
            trash.click(function() {
                $(result).remove();
                on_remove();
            });
            inner_div.append(sign_out);
            inner_div.append(trash);

            result[0].on_remove = function(callback) { on_remove = callback; };
            result[0].on_detach = function(callback) { on_detach = callback; };

            return result[0];
        }, new_markdown_cell: function(content) {
            return notebook_controller_.append_cell(content, "Markdown");
        }, new_interactive_cell: function(content, execute) {
            var cell = notebook_controller_.append_cell(content, "R");
            prompt_history_.execute(content);
            if(execute)
                cell.execute(function() {
                    $.scrollTo(null, prompt_div);
                });
        }, insert_markdown_cell_before: function(index) {
            return notebook_controller_.insert_cell("", "Markdown", index);
        }, load_notebook: function(gistname, version) {
            var that = this;
            function do_load(done) {
                var oldname = gistname_, oldversion = version_;
                gistname_ = gistname;
                version_ = version;
                return that.notebook.controller.load_notebook(gistname_, version_).then(function(notebook) {
                    if (!_.isUndefined(notebook.error)) {
                        done();
                        gistname_ = oldname;
                        version_ = oldversion;
                        return undefined;
                    }
                    $(".rcloud-user-defined-css").remove();
                    return rcloud.install_notebook_stylesheets()
                        .return(notebook)
                        .then(on_load).then(function(notebook) {
                            done();
                            return notebook;
                        });
                }).catch(function(err) {
                    done();
                    throw err;
                });
            }
            return reset_session().then(do_load);
        }, save_notebook: function() {
            notebook_controller_.save();
        }, new_notebook: function(desc) {
            return reset_session()
                .then(function(done) {
                    var content = {description: desc, 'public': false,
                                   files: {"scratch.R": {content:"# scratch file"}}};
                    done(); // well not really done (just done with cps bleh) FIXME
                    return notebook_controller_.create_notebook(content).then(on_new);
                });
        }, fork_or_revert_notebook: function(is_mine, gistname, version) {
            // force a full reload in all cases, as a sanity check
            // we might know what the notebook state should be,
            // but load the notebook and reset the session to be sure
            if(is_mine && !version)
                throw "unexpected revert of current version";
            return reset_session()
                .then(function(done) {
                    var that = this;
                    notebook_model_.read_only(false);
                    return notebook_controller_
                        .fork_or_revert_notebook(is_mine, gistname, version)
                        .then(function(notebook) {
                            gistname_ = notebook.id;
                            version_ = null;
                            done(); // again, not really done - just too nasty to compose done with k
                            return notebook;
                        }).then(on_load);
                });
        }, open_in_github: function() {
            var url;
            if(!this.is_old_github()) {
                url = gist_url_;
                url += notebook_user_ + '/';
            }
            else
                url = github_url_ + 'gist/';
            url += gistname_;
            if(version_)
                url += '/' + version_;
            window.open(url, "_blank");
        }, open_from_github: function(notebook_or_url) {
            function isHex(str) {
                return str.match(/^[a-f0-9]*$/i) !== null;
            }
            var ponents;
            if(notebook_or_url.indexOf('://') > 0) {
                var prefix = gist_url_ || github_url_;
                if(notebook_or_url.substring(0, prefix.length) !== prefix) {
                    alert("Sorry, importing from foreign GitHub instances not supported yet!");
                    return;
                }
                ponents = notebook_or_url.substring(prefix.length).split('/');
                if(!ponents[0])
                    ponents.splice(0,1); // prefix may not have trailing '/'
                if(gist_url_) {
                    // new format URL
                    // [{username}/]{gistid}/{version}
                    // there's an ambiguity between usernames and gist IDs
                    // so guess that if the first component is not 20 chars of hex, it's a username
                    if(ponents[0].length != 20 || !isHex(ponents[0]))
                        ponents.splice(0,1);
                }
                else {
                    // old format URL
                    // gist/{gistid}/{version}
                    if(ponents[0] !== 'gist') {
                        alert("old-format URL path must start with gist/");
                        return;
                    }
                    ponents.splice(0,1);
                }
            }
            else ponents = notebook_or_url.split('/');
            var notebook = ponents[0],
                version = null;
            if(ponents.length>1) {
                version = ponents[1] || null; // don't take empty string
                if(ponents.length>2) {
                    if(ponents[2]) {
                        alert("Sorry, couldn't parse '" + notebook_or_url + "'");
                        return;
                    }
                }
            }
            editor.load_notebook(notebook, version);
        }, export_notebook_as_r_file: function() {
            rcloud.get_notebook(gistname_, version_, function(notebook) {
                var strings = [];
                var parts = [];
                _.each(notebook.files, function(file) {
                    var filename = file.filename;
                    if(/^part/.test(filename)) {
                        var number = parseInt(filename.slice(4).split('.')[0]);
                        if(!isNaN(NaN)) {
                            if (file.language === 'R')
                                parts[number] = "```{r}\n" + file.content + "\n```";
                            else
                                parts[number] = file.content;
                        }
                    }
                });
                for (var i=0; i<parts.length; ++i)
                    if (!_.isUndefined(parts[i]))
                        strings.push(parts[i]);
                strings.push("");
                rcloud.purl_source(strings.join("\n"), function(purled_lines) {
                    var purled_source = purled_lines.join("\n");
                    var a=document.createElement('a');
                    a.textContent='download';
                    a.download=notebook.description + ".R";
                    a.href='data:text/plain;charset=utf-8,'+escape(purled_source);
                    a.click();
                });
            });
        }, export_notebook_file: function() {
            return rcloud.get_notebook(gistname_, version_).then(function(notebook) {
                notebook = sanitize_notebook(notebook);
                var gisttext = JSON.stringify(notebook);
                var a=document.createElement('a');
                a.textContent='download';
                a.download=notebook.description + ".gist";
                a.href='data:text/json;charset=utf-8,'+escape(gisttext);
                a.click();
                return notebook;
            });
        }, import_notebook_file: function() {
            var that = this;
            function create_import_file_dialog() {
                var notebook = null;
                var notebook_status = null;
                var notebook_desc_content = null;
                var import_button = null;
                function do_upload(file) {
                    notebook_status.hide();
                    notebook_desc.hide();
                    var fr = new FileReader();
                    fr.onloadend = function(e) {
                        notebook_status.show();
                        try {
                            notebook = JSON.parse(fr.result);
                        }
                        catch(x) {
                            notebook_status.text("Invalid notebook format: couldn't parse JSON");
                            return;
                        }
                        if(!notebook.description) {
                            notebook_status.text('Invalid notebook format: has no description');
                            notebook = null;
                            return;
                        }
                        if(!notebook.files || _.isEmpty(notebook.files)) {
                            notebook_status.text('Invalid notebook format: has no files');
                            notebook = null;
                            return;
                        }
                        notebook_status.text('');
                        notebook_desc_content.val(notebook.description);
                        notebook_desc.show();
                        notebook = sanitize_notebook(notebook);
                        ui_utils.enable_bs_button(import_button);
                    };
                    fr.readAsText(file);
                }
                function do_import() {
                    if(notebook) {
                        notebook.description = notebook_desc_content.val();
                        rcloud.create_notebook(notebook).then(function(notebook) {
                            editor.star_notebook(true, {notebook: notebook});
                        });
                    }
                    dialog.modal('hide');
                }
                var body = $('<div class="container"/>');
                var file_select = $('<input type="file" id="notebook-file-upload" size="50"></input>');
                file_select.click(function() { ui_utils.disable_bs_button(import_button); })
                    .change(function() { do_upload(file_select[0].files[0]); });
                notebook_status = $('<span />');
                notebook_status.append(notebook_status);
                var notebook_desc = $('<span>Notebook description: </span>');
                notebook_desc_content = $('<input type="text" size="50"></input>')
                    .keypress(function(e) {
                        if (e.which === 13) {
                            do_import();
                            return false;
                        }
                        return true;
                    });
                notebook_desc.append(notebook_desc_content);
                body.append($('<p/>').append(file_select))
                    .append($('<p/>').append(notebook_status.hide()))
                    .append($('<p/>').append(notebook_desc.hide()));
                var cancel = $('<span class="btn">Cancel</span>')
                        .on('click', function() { $(dialog).modal('hide'); });
                import_button = $('<span class="btn btn-primary">Import</span>')
                        .on('click', do_import);
                ui_utils.disable_bs_button(import_button);
                var footer = $('<div class="modal-footer"></div>')
                        .append(cancel).append(import_button);
                var header = $(['<div class="modal-header">',
                                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
                                '<h3>Import Notebook File</h3>',
                                '</div>'].join(''));
                var dialog = $('<div id="import-notebook-file-dialog" class="modal fade"></div>')
                        .append($('<div class="modal-dialog"></div>')
                                .append($('<div class="modal-content"></div>')
                                        .append(header).append(body).append(footer)));
                $("body").append(dialog);
                dialog
                    .on('show.bs.modal', function() {
                        notebook_status.text('');
                        notebook_status.hide();
                        notebook_desc_content.val('');
                        notebook_desc.hide();
                    });

                // keep selected file, in case repeatedly importing is helpful
                // but do reset Import button!
                dialog.data("reset", function() {
                    notebook = null;
                    ui_utils.disable_bs_button(import_button);
                });
                return dialog;
            }
            var dialog = $("#import-notebook-file-dialog");
            if(!dialog.length)
                dialog = create_import_file_dialog();
            else
                dialog.data().reset();
            dialog.modal({keyboard: true});
        }, import_notebooks: function() {
            function do_import() {
                var url = $('#import-source').val(),
                    notebooks = $('#import-gists').val(),
                    prefix = $('#import-prefix').val();
                notebooks = _.without(notebooks.split(/[\s,;]+/), "");
                rcloud.port_notebooks(url, notebooks, prefix)
                    .then(function(result) {
                        var succeeded = [], failed = [];
                        for(var res in result) {
                            if(res==='r_type' || res==='r_attributes')
                                continue; // R metadata
                            if(result[res].ok)
                                succeeded.push(result[res].content);
                            else
                                failed.push(res);
                        }
                        // TODO: tell user about failed imports
                        succeeded.forEach(function(notebook) {
                            editor.star_notebook(true, {notebook: notebook});
                        });
                    });
                dialog.modal('hide');
            }
            function create_import_notebook_dialog() {
                var body = $('<div class="container"/>').append(
                    $(['<p>Import notebooks from another GitHub instance.  Currently import does not preserve history.</p>',
                       '<p>source repo api url:&nbsp;<input type="text" id="import-source" size="50" value="https://api.github.com"></input></td>',
                       '<p>notebooks:<br /><textarea rows="10" cols="30" id="import-gists" form="port"></textarea></p>',
                       '<p>prefix:&nbsp;<input type="text" id="import-prefix" size="50"></input>'].join('')));

                var cancel = $('<span class="btn">Cancel</span>')
                        .on('click', function() { $(dialog).modal('hide'); });
                var go = $('<span class="btn btn-primary">Import</span>')
                        .on('click', do_import);
                var footer = $('<div class="modal-footer"></div>')
                        .append(cancel).append(go);
                var header = $(['<div class="modal-header">',
                                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
                                '<h3>Import Notebooks</h3>',
                                '</div>'].join(''));
                var dialog = $('<div id="import-notebooks-dialog" class="modal fade"></div>')
                        .append($('<div class="modal-dialog"></div>')
                                .append($('<div class="modal-content"></div>')
                                        .append(header).append(body).append(footer)));
                $("body").append(dialog);

                // clear gists list but keep the other fields, to aide repetitive operations
                dialog
                    .on('show.bs.modal', function() {
                        $('#import-gists').val('');
                    })
                    .on('shown.bs.modal', function() {
                        $('#import-source').focus().select();
                    });
                return dialog;
            }
            var dialog = $("#import-notebooks-dialog");
            if(!dialog.length)
                dialog = create_import_notebook_dialog();
            dialog.modal({keyboard: true});
        }
    };

    $("#run-notebook").click(function() {
        rcloud.with_progress().then(function(done) {
            result.notebook.controller.run_all().then(done);
            prompt_ && prompt_.widget.focus(); // surely not the right way to do this
        }).catch(function(done) { done(); });
    });
    return result;
})();
