var shell = (function() {

    var version_ = null,
        gistname_ = null,
        notebook_user_ = null,
        github_url_ = null,
        gist_url_ = null,
        notebook_model_ = Notebook.create_model(),
        notebook_view_ = Notebook.create_html_view(notebook_model_, $("#output")),
        notebook_controller_ = Notebook.create_controller(notebook_model_),
        view_mode_ = false;

    function on_new(notebook) {
        gistname_ = notebook.id;
        version_ = null;
        return on_load(notebook);
    }

    function on_load(notebook) {
        RCloud.UI.notebook_title.set(notebook.description);
        RCloud.UI.notebook_title.update_fork_info(notebook.fork_of);
        notebook_user_ = notebook.user.login;
        RCloud.UI.configure_readonly();
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
                ui_utils.scroll_to_after($("#prompt-area"));
            }, 100);
        }
    }

    function do_load(f) {
        return RCloud.UI.with_progress(function() {
            return RCloud.session.reset()
                .then(f)
                .spread(function(notebook, gistname, version) {
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
    }

    function check_cell_language(language) {
        if(!_.contains(RCloud.language.available_languages(), language)) {
            RCloud.UI.session_pane.post_error(
                "Sorry, " + language + " notebook cells not supported in this deployment.");
            return;
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
        is_view_mode: function(val) {
            if(val !== undefined) {
                view_mode_ = !!val;
                return this;
            }
            return view_mode_;
        },
        scroll_to_end: scroll_to_end,
        new_cell: function(content, language, execute) {
            check_cell_language(language);
            return notebook_controller_.append_cell(content, language);
        },
        insert_cell_before: function(content, language, index) {
            check_cell_language(language);
            return notebook_controller_.insert_cell(content, language, index);
        }, join_prior_cell: function(cell_model) {
            return notebook_controller_.join_prior_cell(cell_model);
        }, split_cell: function(cell_model, point1, point2) {
            return notebook_controller_.split_cell(cell_model, point1, point2);
        },
        load_notebook: function(gistname, version) {
            notebook_controller_.save();
            return do_load(function() {
                return [notebook_controller_.load_notebook(gistname, version),
                        gistname, version];
            }, gistname, version);
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
        }, fork_notebook: function(is_mine, gistname, version) {
            // Forcefully saving whole notebook before fork
            shell.save_notebook();
            return do_load(function() {
                var promise_fork;
                if(is_mine) {
                    // hack: copy without history as a first pass, because github forbids forking oneself
                    promise_fork = rcloud.get_notebook(gistname, version)
                        .then(function(notebook) {
                            // this smells
                            var fork_of = {owner: {login: notebook.user.login},
                                           description: notebook.description,
                                           id: notebook.id
                                          };
                            notebook = Notebook.sanitize(notebook);
                            notebook.description = editor.find_next_copy_name(notebook.description);
                            return notebook_controller_.create_notebook(notebook)
                                .then(function(result) {
                                    result.fork_of = fork_of;
                                    return rcloud.set_notebook_property(result.id, 'fork_of', fork_of)
                                        .return(result);
                                });
                        });
                }
                else promise_fork = notebook_controller_
                    .fork_notebook(gistname, version)
                    .then(function(notebook) {
                        /*
                         // it would be nice to choose a new name if we've forked someone
                         // else's notebook and we already have a notebook of that name
                         // but this slams into the github concurrency problem
                        var new_desc = editor.find_next_copy_name(notebook.description);
                        if(new_desc != notebook.description)
                            return notebook_controller_.rename_notebook(new_desc);
                        else
                         */
                        return notebook;
                    });
                return promise_fork
                    .then(function(notebook) {
                        return [notebook, notebook.id, null];
                    });
            });
        }, revert_notebook: function(gistname, version) {
            return do_load(function() {
                return notebook_controller_.revert_notebook(gistname, version)
                    .then(function(notebook) {
                        return [notebook, notebook.id, null];
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
            var gistname = ponents[0].replace(/\s+/g, ''), // trim notebook id whitespace
                version = null;
            if(ponents.length>1) {
                version = ponents[1].replace(/\s+/g, ''); // trim version whitespace
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
