var shell = (function() {

    var version_ = null,
        gistname_ = null,
        notebook_user_ = null,
        github_urls_ = {},
        gist_urls_ = {},
        notebook_model_ = Notebook.create_model(),
        notebook_view_ = Notebook.create_html_view(notebook_model_, $("#output")),
        notebook_controller_ = Notebook.create_controller(notebook_model_),
        view_mode_ = false,
        autosave_timeout_ = 30000;

    function on_new(notebook) {
        gistname_ = notebook.id;
        version_ = null;
        return on_load(notebook);
    }

    function on_load(notebook) {
        RCloud.UI.notebook_title.set(notebook.description);
        RCloud.UI.notebook_title.update_fork_info(notebook.fork_of && notebook.fork_of.id);
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
            return rcloud.get_gist_sources().then(function(sources) {
                // de-rserve-ify
                if(_.isString(sources))
                    sources = [sources];
                else
                    sources = _.without(sources, 'r_type', 'r_attributes');
                sources.forEach(function(source) {
                    rcloud.get_conf_value('github.base.url', source).then(function(url) {
                        if(url) github_urls_[source] = url;
                    });
                    rcloud.get_conf_value('github.gist.url', source).then(function(url) {
                        if(url) gist_urls_[source] = url;
                    });
                });
                (rcloud.config ? rcloud.config.get_user_option('autosave-timeout') : Promise.resolve(30))
                    .then(function(TO) {
                        if(TO !== null)
                            autosave_timeout_ = +TO * 1000;
                    });
            });
        },
        refresh_notebook_title: function() {
            if(notebook_controller_.current_gist())
                RCloud.UI.notebook_title.set(notebook_controller_.current_gist().description);
        },
        is_view_mode: function(val) {
            if(val !== undefined) {
                view_mode_ = !!val;
                return this;
            }
            return view_mode_;
        },
        autosave_timeout: function() {
            return autosave_timeout_;
        },
        scroll_to_end: scroll_to_end,
        new_cell: function(content, language, execute) {
            check_cell_language(language);
            return notebook_controller_.append_cell(content, language);
        },
        insert_cell_before: function(content, language, index) {
            check_cell_language(language);
            return notebook_controller_.insert_cell(content, language, index);
        },
        insert_cell_after: function(content, language, index) {
            check_cell_language(language);
            return notebook_controller_.insert_cell(content, language, index + 1);
        },
        join_prior_cell: function(cell_model) {
            return notebook_controller_.join_prior_cell(cell_model);
        }, split_cell: function(cell_model, point1, point2) {
            return notebook_controller_.split_cell(cell_model, point1, point2);
        },
        get_selected_cells: function() {
            return notebook_controller_.get_selected_cells();
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
        }, fork_my_notebook: function(gistname, version, open_it, transform_description) {
            // hack: copy without history as a first pass, because github forbids forking oneself
            return Promise.all([rcloud.get_notebook(gistname, version, null, true), rcloud.protection.get_notebook_cryptgroup(gistname)])
                .spread(function(notebook, cryptgroup) {
                    // this smells less
                    var fork_of = {
                        id: notebook.id
                    };
                    notebook = Notebook.sanitize(notebook);
                    return transform_description(notebook.description).then(function(desc) {
                        notebook.description = desc;
                        var promise_create = open_it ? notebook_controller_.create_notebook(notebook) :
                                rcloud.create_notebook(notebook, false);
                        return promise_create
                            .then(function(result) {
                                result.fork_of = fork_of;
                                return rcloud.set_notebook_property(result.id, 'fork_of', fork_of)
                                    .then(function() {
                                        return cryptgroup ?
                                            rcloud.protection.set_notebook_cryptgroup(result.id, cryptgroup.id, false) :
                                            undefined;
                                    })
                                    .return(result);
                            });
                    });
                });
        }, fork_notebook: function(is_mine, gistname, version) {
            var that = this;
            return shell.save_notebook().then(function() {
                return do_load(function() {
                    var promise_fork;
                    if(is_mine) {
                        promise_fork = that.fork_my_notebook(gistname, version, true, editor.find_next_copy_name);
                    }
                    else promise_fork = notebook_controller_
                        .fork_notebook(gistname, version)
                        .then(function(notebook) {
                            /*
                             // it would be nice to choose a new name if we've forked someone
                             // else's notebook and we already have a notebook of that name
                             // but this slams into the github concurrency problem
                             editor.find_next_copy_name(notebook.description).then(function(new_desc) {
                             if(new_desc != notebook.description)
                             return notebook_controller_.rename_notebook(new_desc);
                             else ...
                             */
                            return notebook;
                        });
                    return promise_fork
                        .then(function(notebook) {
                            return shell.duplicate_notebook_attributes(gistname, notebook.id)
                                .return(notebook);
                        })
                        .then(function(notebook) {
                            return [notebook, notebook.id, null];
                        });
                });
            });
        }, revert_notebook: function(gistname, version) {
            return do_load(function() {
                return notebook_controller_.revert_notebook(gistname, version)
                    .then(function(notebook) {
                        return [notebook, notebook.id, null];
                    });
            });
        }, duplicate_notebook_attributes(srcid, destid) {
            var dupe_attrs = ['view-type'];
            return Promise.all(dupe_attrs.map(function(attr) {
                return rcloud.get_notebook_property(srcid, attr);
            })).then(function(values) {
                return Promise.all(dupe_attrs.map(function(attr, i) {
                    return rcloud.set_notebook_property(destid, attr, values[i]);
                }));
            });
        }, pull_and_replace_notebook: function(from_notebook) {
            return notebook_controller_.pull_and_replace_notebook(from_notebook);
        }, improve_load_error: function(xep, gistname, version) {
            var msg1 = "Could not open notebook " + gistname;
            if(version)
                msg1 += " (version " + version + ")";
            var msg2 = xep.toString().replace(/\n/g, '');
            var load_err = /Error: load_notebook: (.*)R trace/.exec(msg2);
            if(load_err)
                msg2 = load_err[1];
            var improve_msg_promise, errtype;
            if(/unable to access key/.test(msg2))
                errtype = 'access';
            else if(/checksum mismatch/.test(msg2))
                errtype = 'checksum';
            if(errtype) {
                improve_msg_promise = rcloud.protection.get_notebook_cryptgroup(gistname).then(function(cryptgroup) {
                    if(cryptgroup) {
                        if(cryptgroup.id === 'private')
                            return msg1 + "\nThe notebook is private and you are not the owner";
                        else if(cryptgroup.name) {
                            return rcloud.protection.get_cryptgroup_users(cryptgroup.id).then(function(users) {
                                return msg1 + "\nThe notebook belongs to protection group '" + cryptgroup.name + "' and you are not a member\n" +
                                    "Group administrators are: " + _.pairs(_.omit(users, 'r_type', 'r_attributes')).filter(function(usad) {
                                        return usad[1];
                                    }).map(function(usad) {
                                        return usad[0];
                                    }).join(', ');
                            });
                        }
                    }
                    return msg1 + '\n' + msg2;
                });
            } else {
                improve_msg_promise = Promise.resolve(msg1 + '\n' + msg2);
            }
            return improve_msg_promise;
        }, github_url: function() {
            // we can't use editor's notebook cache if in view mode, so load asynchronously
            return rcloud.get_notebook_info(gistname_).then(function(info) {
                var url;
                var source = info.source || 'default';
                if(gist_urls_[source]) {
                    url = gist_urls_[source];
                    url += notebook_user_ + '/';
                }
                else if(github_urls_[source])
                    url = github_urls_[source] + 'gist/';
                else return null;
                url += gistname_;
                if(version_)
                    url += '/' + version_;
                return url;
            });
        }, open_from_github: function(notebook_or_url) {
            var ponents;
            if(notebook_or_url.indexOf('://') > 0) {
                var prefix = gist_urls_['default'] || github_urls_['default'];
                if(notebook_or_url.substring(0, prefix.length) !== prefix) {
                    alert("Sorry, importing from foreign GitHub instances not supported yet!");
                    return;
                }
                ponents = notebook_or_url.substring(prefix.length).split('/');
                if(!ponents[0])
                    ponents.splice(0,1); // prefix may not have trailing '/'
                if(gist_urls_['default']) {
                    // new format URL
                    // [{username}/]{gistid}/{version}
                    // there's an ambiguity between usernames and gist IDs
                    // so guess that if the first component is not a gist id, it's a username
                    if(!Notebook.valid_gist_id(ponents[0]))
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
        }, run_notebook_from: function(cell_id) {
            RCloud.UI.with_progress(function() {
                return result.notebook.controller.run_from(cell_id);
            }).then(function() {
                RCloud.UI.command_prompt.focus();
            });
        }
    };

    return result;
})();
