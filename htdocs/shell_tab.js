var shell = (function() {

    var version_ = null,
        gistname_ = null,
        notebook_user_ = null,
        github_url_ = null,
        gist_url_ = null,
        notebook_model_ = Notebook.create_model(),
        notebook_view_ = Notebook.create_html_view(notebook_model_, $("#output")),
        notebook_controller_ = Notebook.create_controller(notebook_model_),
        view_mode_ = window.location.href.match("/view.html");

    function sanitize_notebook(notebook) {
        notebook = _.pick(notebook, 'description', 'files');
        var files = notebook.files;
        delete files.r_attributes;
        delete files.r_type;
        for(var fn in files)
            files[fn] = _.pick(files[fn], 'content');
        return notebook;
    }

    function on_new(notebook) {
        gistname_ = notebook.id;
        version_ = null;
        return on_load(notebook);
    }

    function on_load(notebook) {
        RCloud.UI.notebook_title.set(notebook.description);
        RCloud.UI.share_button.set_link();
        notebook_user_ = notebook.user.login;
        RCloud.UI.configure_readonly();
        _.each(notebook_view_.sub_views, function(cell_view) {
            cell_view.show_source();
        });
        RCloud.UI.command_prompt.focus();
        return notebook;
    }

    function scroll_to_end(duration) {
        if(duration===0) {
            var div = $("#rcloud-cellarea");
            div.scrollTop(div[0].scrollHeight);
        }
        else {
            window.setTimeout(function() {
                ui_utils.scroll_to_after($("#prompt-div"));
            }, 100);
        }
    }

    var result = {
        notebook: {
            model: notebook_model_,
            view: notebook_view_,
            controller: notebook_controller_
        },
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
        is_view_mode: function() {
            return view_mode_;
        },
        new_cell: function(content, language, execute) {
            var supported = ['R', 'Markdown'];
            if(!_.contains(supported, language)) {
                RCloud.UI.session_pane.post_error("Sorry, " + language + " notebook cells not supported (yet!)");
                return;
            }
            var cell = notebook_controller_.append_cell(content, language);
            RCloud.UI.command_prompt.history.execute(content);
            if(execute) {
                cell.execute().then(scroll_to_end);
            }
        },
        scroll_to_end: scroll_to_end,
        insert_markdown_cell_before: function(index) {
            return notebook_controller_.insert_cell("", "Markdown", index);
        }, join_prior_cell: function(cell_model) {
            return notebook_controller_.join_prior_cell(cell_model);
        }, split_cell: function(cell_model, point1, point2) {
            return notebook_controller_.split_cell(cell_model, point1, point2);
        },
        load_notebook: function(gistname, version) {
            var that = this;
            notebook_controller_.save();
            return RCloud.UI.with_progress(function() {
                return RCloud.session.reset().then(function() {
                    return that.notebook.controller.load_notebook(gistname, version);
                }).then(function(notebook) {
                    if (!_.isUndefined(notebook.error)) {
                        throw notebook.error;
                    }
                    gistname_ = gistname;
                    version_ = version;
                    $(".rcloud-user-defined-css").remove();
                    return rcloud.install_notebook_stylesheets()
                        .return(notebook);
                }).then(on_load);
            });
        }, save_notebook: function() {
            notebook_controller_.save();
        }, new_notebook: function(desc) {
            notebook_controller_.save();
            return RCloud.UI.with_progress(function() {
                return RCloud.session.reset().then(function() {
                    var content = {description: desc, 'public': false,
                                   files: {"scratch.R": {content:"# keep snippets here while working with your notebook's cells"}}};
                    return notebook_controller_.create_notebook(content).then(on_new);
                });
            });
        }, rename_notebook: function(desc) {
            return notebook_controller_.rename_notebook(desc);
        }, fork_or_revert_notebook: function(is_mine, gistname, version) {
            // force a full reload in all cases, as a sanity check
            // we might know what the notebook state should be,
            // but load the notebook and reset the session to be sure
            if(is_mine && !version)
                throw "unexpected revert of current version";
            return RCloud.UI.with_progress(function() {
                return RCloud.session.reset().then(function() {
                    var that = this;
                    notebook_model_.read_only(false);
                    return notebook_controller_
                        .fork_or_revert_notebook(is_mine, gistname, version)
                        .then(function(notebook) {
                            gistname_ = notebook.id;
                            version_ = null;
                            return notebook;
                        }).then(on_load);
                });
            });
        }, github_url: function() {
            var url;
            if(gist_url_) {
                url = gist_url_;
                url += notebook_user_ + '/';
            }
            else
                url = github_url_ + 'gist/';
            url += gistname_;
            if(version_)
                url += '/' + version_;
            return url;
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
            var gistname = ponents[0],
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
            editor.load_notebook(gistname, version).then(function(notebook) {
                if(notebook.user.login === rcloud.username())
                    editor.set_notebook_visibility(notebook.id, true);
            });
        }, export_notebook_as_r_file: function() {
            return rcloud.get_notebook(gistname_, version_).then(function(notebook) {
                var strings = [];
                var parts = [];
                _.each(notebook.files, function(file) {
                    var filename = file.filename;
                    if(/^part/.test(filename)) {
                        var number = parseInt(filename.slice(4).split('.')[0]);
                        if(!isNaN(number)) {
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
                rcloud.purl_source(strings.join("\n")).then(function(purled_lines) {
                    // rserve.js length-1 array special case making our lives difficult again
                    var purled_source = _.isString(purled_lines) ? purled_lines :
                            purled_lines.join("\n");
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
                            editor.star_notebook(true, {notebook: notebook}).then(function() {
                                editor.set_notebook_visibility(notebook.id, true);
                            });
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
                        succeeded.forEach(function(notebook) {
                            editor.star_notebook(true, {notebook: notebook}).then(function() {
                                editor.set_notebook_visibility(notebook.id, true);
                            });
                        });
                        if(failed.length)
                            RCloud.UI.session_pane.post_error("Failed to import notebooks: " + failed.join(', '));
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
        }, run_notebook: function() {
            RCloud.UI.with_progress(function() {
                return result.notebook.controller.run_all();
            }).then(function() {
                RCloud.UI.command_prompt.focus();
            });
        }
    };

    return result;
})();
