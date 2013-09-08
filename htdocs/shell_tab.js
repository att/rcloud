var shell = (function() {

    var version_ = null,
        gistname_ = null,
        is_mine_ = null,
        github_url_ = null;

    function setup_command_entry(entry_div) {
        function set_ace_height() {
            entry_div.css({'height': ui_utils.ace_editor_height(widget) + "px"});
            widget.resize();
        }
        entry_div.css({'background-color': "#E8F1FA"});
        var widget = ace.edit(entry_div[0]);
        set_ace_height();
        var RMode = require("ace/mode/r").Mode;
        var session = widget.getSession();
        var doc = session.doc;

        session.setMode(new RMode(false, doc, session));
        session.on('change', set_ace_height);

        widget.setTheme("ace/theme/chrome");
        session.setUseWrapMode(true);
        widget.resize();
        input_widget = widget;

        widget.commands.addCommands([{
            name: 'execute',
            bindKey: {
                win: 'Return',
                mac: 'Return',
                sender: 'editor'
            },
            exec: function(widget, args, request) {
                var code = session.getValue();
                if(code.length) {
                    result.new_interactive_cell(code).execute(function() {
                        $.scrollTo(null, entry_div);
                    });
                    session.setValue('');
                }
            }
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
                result.new_interactive_cell(code).execute(function() {
                    $.scrollTo(null, entry_div);
                });
            }
        }]);
        ui_utils.make_prompt_chevron_gutter(widget);
    }

    var entry_div = $("#command-entry");
    var input_widget = null;
    if(entry_div.length)
        setup_command_entry(entry_div);

    var notebook_model = Notebook.create_model();
    var notebook_view = Notebook.create_html_view(notebook_model, $("#output"));
    var notebook_controller = Notebook.create_controller(notebook_model);

    function show_fork_or_input_elements() {
        var fork_revert = $('#fork-revert-notebook');
        if(notebook_model.read_only()) {
            $('#input-div').hide();
            fork_revert.text(is_mine_ ? 'Revert' : 'Fork');
            fork_revert.show();
        }
        else {
            $('#input-div').show();
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
        show_fork_or_input_elements();
        if(this.input_widget)
            this.input_widget.focus(); // surely not the right way to do this
        k && k(notebook);
    }

    function on_load(k, notebook) {
        $("#notebook-title").text(notebook.description);
        is_mine_ = notebook_is_mine(notebook);
        show_fork_or_input_elements(notebook_is_mine(notebook));
        _.each(this.notebook.view.sub_views, function(cell_view) {
            cell_view.show_source();
        });
        if(this.input_widget)
            this.input_widget.focus(); // surely not the right way to do this
        k && k(notebook);
    }

    var result = {
        notebook: {
            // very convenient for debugging
            model: notebook_model,
            view: notebook_view,
            controller: notebook_controller
        },
        input_widget: input_widget,
        gistname: function() {
            return gistname_;
        },
        version: function() {
            return version_;
        },
        init: function() {
            rcloud.get_github_url(function(url) { github_url_ = url; });
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
            return notebook_controller.append_cell(content, "Markdown");
        }, new_interactive_cell: function(content) {
            return notebook_controller.append_cell(content, "R");
        }, insert_markdown_cell_before: function(index) {
            return notebook_controller.insert_cell("", "Markdown", index);
        }, load_notebook: function(gistname, version, k) {
            var that = this;
            // asymetrical: we know the gistname before it's loaded here,
            // but not in new.  and we have to set this here to signal
            // editor's init load config callback to override the currbook
            gistname_ = gistname;
            version_ = version;
            this.notebook.controller.load_notebook(gistname_, version_, _.bind(on_load, this, k));
        }, new_notebook: function(desc, k) {
            var content = {description: desc, public: false, files: {"scratch.R": {content:"# scratch file"}}};
            this.notebook.controller.create_notebook(content, _.bind(on_new, this, k));
        }, fork_or_revert_notebook: function(is_mine, gistname, version, k) {
            if(is_mine && !version)
                throw "unexpected revert of current version";
            var that = this;
            notebook_model.read_only(false);
            this.notebook.controller.fork_or_revert_notebook(is_mine, gistname, version, function(notebook) {
                gistname_ = notebook.id;
                version_ = null;
                on_load.call(that, k, notebook);
            });
        }, open_in_github: function() {
            var url = github_url_;
            url += 'gist/' + gistname_;
            if(version_)
                url += '/' + version_;
            // can't get this to open in new tab with target = '_blank'
            // so just going there.  FIXME
            window.open(url, "_self");
        }, open_from_github: function(notebook_or_url) {
            var notebook;
            // hmm a more general url parser might be in order here
            if(notebook_or_url.indexOf('://') > 0) {
                var pref = notebook_or_url.substring(0, github_url_.length);
                if(pref !== github_url_) {
                    alert("Sorry, importing from foreign GitHub instances not supported yet!");
                    return;
                }
                notebook = notebook_or_url.substring(github_url_.length);
                if(notebook.substring(0,1) == '/')
                    notebook = notebook.substring(1);
                if(notebook.substring(0,5) !== 'gist/') {
                    alert("URL must be a /gist/ url");
                    return;
                }
                notebook = notebook.substring(5);
            }
            else notebook = notebook_or_url;
            var version = null;
            var slashpos = notebook.indexOf('/');
            if(slashpos > 0) {
                version = notebook.substring(slashpos+1);
                notebook = notebook.substring(0, slashpos);
                slashpos = version.indexOf('/');
                if(slashpos > 0) {
                    if(slashpos < version.length-1) {
                        alert("Sorry, couldn't parse '" + notebook_or_url + "'");
                        return;
                    }
                    version = version.substring(0, slashpos);
                    if(version === "")
                        version = null;
                }
            }
            editor.load_notebook(notebook, version);
        }
    };

    $("#run-notebook").click(function() {
        result.notebook.controller.run_all();
        result.input_widget.focus(); // surely not the right way to do this
    });
    return result;
})();
