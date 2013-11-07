var shell = (function() {

    var version_ = null,
        gistname_ = null,
        is_mine_ = null,
        github_url_ = null,
        gist_url_ = null,
        prefix_ = null,
        prompt_ = null,
        notebook_model_ = Notebook.create_model(),
        notebook_view_ = Notebook.create_html_view(notebook_model_, $("#output")),
        notebook_controller_ = Notebook.create_controller(notebook_model_);

    var cmd_history = (function() {
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
        var change_prompt = ui_utils.ignore_programmatic_changes(widget, cmd_history.change.bind(cmd_history));

        var Autocomplete = require("ace/autocomplete").Autocomplete;

        function execute(widget, args, request) {
            var code = session.getValue();
            if(code.length) {
                result.new_interactive_cell(code).execute(function() {
                    $.scrollTo(null, prompt_div);
                });
                cmd_history.execute(code);
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

        function set_pos(widget, row, column) {
            var sel = widget.getSelection();
            var range = sel.getRange();
            range.setStart(row, column);
            range.setEnd(row, column);
            sel.setSelectionRange(range);
        }

        function restore_prompt() {
            var cmd = cmd_history.init();
            change_prompt(cmd);
            var r = last_row(widget);
            set_pos(widget, r, last_col(widget, r));
        }

        // note ace.js typo which we need to correct when we update ace
        var up_handler = widget.commands.commmandKeyBinding[0]["up"],
            down_handler = widget.commands.commmandKeyBinding[0]["down"];

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
                cmd_history.execute(code);
                result.new_interactive_cell(code).execute(function() {
                    $.scrollTo(null, prompt_div);
                });
            }
        }, {
            name: 'another autocomplete key',
            bindKey: 'Ctrl-.',
            exec: Autocomplete.startCommand.exec
        }, {
            name: 'up-with-history',
            bindKey: 'up',
            exec: function(widget, args, request) {
                var pos = widget.getCursorPosition();
                if(pos.row > 0)
                    up_handler.exec(widget, args, request);
                else {
                    change_prompt(cmd_history.last());
                    var r = last_row(widget);
                    set_pos(widget, r, last_col(widget, r));
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
                    change_prompt(cmd_history.next());
                    set_pos(widget, 0, last_col(widget, 0));
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

    var prompt_div = $("#command-prompt");
    if(prompt_div.length)
        prompt_ = setup_command_prompt(prompt_div);

    function show_fork_or_prompt_elements() {
        var fork_revert = $('#fork-revert-notebook');
        if(notebook_model_.read_only()) {
            $('#prompt-div').hide();
            fork_revert.text(is_mine_ ? 'Revert' : 'Fork');
            fork_revert.show();
        }
        else {
            $('#prompt-div').show();
            fork_revert.hide();
        }
    }

    function notebook_is_mine(notebook) {
        return rcloud.username() === notebook.user.login;
    }

    function on_new(k, notebook) {
        $("#notebook-title").text(notebook.description);
        gistname_ = notebook.id;
        version_ = null;
        is_mine_ = notebook_is_mine(notebook);
        show_fork_or_prompt_elements();
        if(prompt_) {
            prompt_.widget.focus(); // surely not the right way to do this
            prompt_.restore();
        }
        k && k(notebook);
    }

    function on_load(k, notebook) {
        var is_read_only = result.notebook.model.read_only();
        $("#notebook-title").text(notebook.description);

        if (is_read_only) {
            $("#notebook-title").off('click');
        } else {
            $("#notebook-title").click(function() {
                var result = prompt("Please enter the new name for this notebook:", $(this).text());
                if (result !== null) {
                    $(this).text(result);
                    editor.rename_notebook(shell.gistname(), result);
                }
            });
        }

        is_mine_ = notebook_is_mine(notebook);
        show_fork_or_prompt_elements(notebook_is_mine(notebook));
        _.each(this.notebook.view.sub_views, function(cell_view) {
            cell_view.show_source();
        });
        if(prompt_) {
            prompt_.widget.focus(); // surely not the right way to do this
            prompt_.restore();
        }
        k && k(notebook);
    }

    var result = {
        notebook: {
            // very convenient for debugging
            model: notebook_model_,
            view: notebook_view_,
            controller: notebook_controller_
        },
        prompt_widget: prompt_.widget,
        gistname: function() {
            return gistname_;
        },
        version: function() {
            return version_;
        },
        init: function() {
            rcloud.get_conf_value("github.base.url", function(url) { github_url_ = url; });
            rcloud.get_conf_value("github.gist.url", function(url) { gist_url_ = url; });
        },
        fork_or_revert_button: function() {
            // hmm messages bouncing around everywhere
            editor.fork_or_revert_notebook(is_mine_, gistname_, version_);
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
        }, new_interactive_cell: function(content) {
            return notebook_controller_.append_cell(content, "R");
        }, insert_markdown_cell_before: function(index) {
            return notebook_controller_.insert_cell("", "Markdown", index);
        }, load_notebook: function(gistname, version, k) {
            var that = this;
            // asymetrical: we know the gistname before it's loaded here,
            // but not in new.  and we have to set this here to signal
            // editor's init load config callback to override the currbook
            rclient.close();
            // FIXME this is a bit of an annoying duplication of code on main.js and view.js
            rclient = RClient.create({
                debug: rclient.debug,
                host: rclient.host,
                on_connect: function(ocaps) {
                    rcloud = RCloud.create(ocaps.rcloud);
                    rcloud.session_init(rcloud.username(), rcloud.github_token(), function(hello) {});

                    rcloud.init_client_side_data(function() {
                        gistname_ = gistname;
                        version_ = version;
                        $("#output").find(".alert").remove();
                        that.notebook.controller.load_notebook(gistname, version_, on_load.bind(that, k));
                    });
                },
                on_data: function(v) {
                    v = v.value.json();
                    oob_handlers[v[0]] && oob_handlers[v[0]](v.slice(1));
                }
            });
        }, save_notebook: function() {
            notebook_controller_.save();
        }, new_notebook: function(desc, k) {
            var content = {description: desc, public: false, files: {"scratch.R": {content:"# scratch file"}}};
            this.notebook.controller.create_notebook(content, _.bind(on_new, this, k));
        }, fork_or_revert_notebook: function(is_mine, gistname, version, k) {
            if(is_mine && !version)
                throw "unexpected revert of current version";
            var that = this;
            notebook_model_.read_only(false);
            this.notebook.controller.fork_or_revert_notebook(is_mine, gistname, version, function(notebook) {
                gistname_ = notebook.id;
                version_ = null;
                on_load.call(that, k, notebook);
            });
        }, open_in_github: function() {
            var url;
            if(gist_url_) {
                url = gist_url_;
                url += rcloud.username() + '/';
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
        }, import_notebooks: function() {

            function do_import() {
                var url = $('#import-source').val(),
                    notebooks = $('#import-gists').val(),
                    prefix = $('#import-prefix').val();
                notebooks = _.without(notebooks.split(/[\s,;]+/), "");
                rcloud.port_notebooks(url, notebooks, prefix,
                                      function(result) {
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
                                          succeeded.forEach(function(imported) {
                                              editor.add_notebook(imported, null, false);
                                          });
                                      });
                $(dialog).modal('hide');
            }
            var body = $('<div class="container"/>').append(
                $(['<p>Import notebooks from another GitHub instance.  Note: import does not currently preserve history.</p>',
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
            var dialog = $('<div class="modal fade"></div>')
                    .append($('<div class="modal-dialog"></div>')
                            .append($('<div class="modal-content"></div>')
                                    .append(header).append(body).append(footer)));
            $("body").append(dialog);
            $(dialog).modal()
                .on('hide.bs.modal', function() {
                    $(dialog).remove();
                });


        }
    };

    $("#run-notebook").click(function() {
        result.notebook.controller.run_all();
        prompt_.widget.focus(); // surely not the right way to do this
    });
    return result;
})();
