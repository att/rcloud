var editor = function () {
    // major key is sort_order and minor key is name (label)
    var ordering = {
        HEADER: 0, // like [New Notebook]
        NOTEBOOK: 1,
        SUBFOLDER: 2
    };
    function compare_nodes(a, b) {
        var so = a.sort_order-b.sort_order;
        if(so) return so;
        else {
            var alab = a.name || a.label, blab = b.name || b.label;
            // haha horrible special case to sort "Notebook X" numerically!
            if(/Notebook /.test(alab) && /Notebook /.test(blab)) {
                var an = alab.slice(9), bn = blab.slice(9);
                if($.isNumeric(an) && $.isNumeric(bn))
                    return an-bn;
            }
            var lc = alab.localeCompare(blab);
            return lc;
        }
    }

    function convert_notebook_set(root, username, set) {
        var notebook_nodes = [];
        for(var name in set) {
            var attrs = set[name];
            if(username!==this_user && root==='alls' && attrs.visibility==='private')
                continue;
            var result = {
                label: attrs.description,
                gistname: name,
                user: username,
                root: root,
                visibility: attrs.visibility || 'public',
                last_commit: attrs.last_commit || 'none',
                id: '/' + root + '/' + username + '/' + name,
                sort_order: ordering.NOTEBOOK
            };
            notebook_nodes.push(result);
        }
        return notebook_nodes;
    }

    function populate_interests(config, this_user) {
        var my_notebooks, user_nodes = [];
        if(!config.interests[this_user])
            config.interests[this_user] = {};
        for (var username in config.interests) {
            var notebooks_config = config.interests[username];
            var notebook_nodes = [];
            if(username === this_user) {
                notebook_nodes.push({
                    label: "[New Notebook]",
                    id: "newbook",
                    sort_order: ordering.HEADER
                });
            }
            notebook_nodes = notebook_nodes.concat(convert_notebook_set('interests', username, notebooks_config));

            if(username === this_user)
                my_notebooks = notebook_nodes;
            else {
                var node = {
                    label: someone_elses(username),
                    id: '/interests/' + username,
                    sort_order: ordering.SUBFOLDER,
                    children: notebook_nodes.sort(compare_nodes)
                };
                user_nodes.push(node);
            }
        }
        var children =  my_notebooks.concat(user_nodes).sort(compare_nodes);
        var $tree = $("#editor-book-tree");
        var interests = $tree.tree('getNodeById', "/interests");
        $tree.tree("loadData", children, interests);
        $(interests.element).parent().prepend(interests.element);
        $tree.tree('openNode', interests);
    }

    function load_all_configs(this_user, k) {
        rcloud.get_users(function(userlist) {
            var users = _.pluck(userlist, 'login');
            rcloud.load_multiple_user_configs(users, function(configset) {
                var my_alls = [], user_nodes = [], my_config = null;
                for(var username in configset) {
                    var config = configset[username];
                    if(!config)
                        continue;
                    var notebook_nodes = convert_notebook_set('alls', username, config.all_books);
                    if(username === this_user) {
                        my_config = config;
                        my_alls = notebook_nodes;
                    }
                    else {
                        var node = {
                            label: someone_elses(username),
                            id: '/alls/' + username,
                            sort_order: ordering.SUBFOLDER,
                            children: notebook_nodes.sort(compare_nodes)
                        };
                        user_nodes.push(node);
                    }
                }

                // create both root folders now but only load /alls now
                // populate_interests will load /interests
                var children = my_alls.concat(user_nodes).sort(compare_nodes);
                var root_data = [
                    {
                        label: 'My Interests',
                        id: '/interests'
                    },
                    {
                        label: 'All Notebooks',
                        id: '/alls',
                        children: children
                    }
                ];
                var $tree = $("#editor-book-tree");
                $tree.tree("loadData", root_data);

                k && k(my_config);
            });
        });
    }

    function insert_alpha($tree, data, parent) {
        // this could be a binary search but linear is probably fast enough
        // for a single insert, and it also could be out of order
        for(var i = 0; i < parent.children.length; ++i) {
            var child = parent.children[i];
            var so = compare_nodes(data, child);
            if(so<0)
                return $tree.tree('addNodeBefore', data, child);
        }
        return $tree.tree('appendNode', data, parent);
    }

    function update_tree($tree, root, user, notebook, data) {
        var id = '/' + root + '/' + user + '/' + notebook;
        var node = $tree.tree('getNodeById', id);
        var parent;
        data.gistname = notebook;
        data.id = id;
        data.root = root;
        data.user = user;
        if(node) {
            // the update stuff doesn't exist in the jqtree version
            // we're using, and the latest jqtree didn't seem to work
            // at all, so.. blunt stupid approach here:
            parent = node.parent;
            $tree.tree('removeNode', node);
            insert_alpha($tree, data, parent);
        }
        else {
            if(user == this_user) {
                parent = $tree.tree('getNodeById', '/' + root);
                node = insert_alpha($tree, data, parent);
            }
            else {
                var usernode = $tree.tree('getNodeById', '/' + root + '/' + user);
                if(usernode)
                    node = insert_alpha($tree, data, usernode);
                else {
                    // creating a subfolder and then using loadData on it
                    // seems to be *the* way that works
                    parent = $tree.tree('getNodeById', '/' + root);
                    var pdat = {
                        label: someone_elses(user),
                        id: '/' + root + '/' + user,
                        sort_order: ordering.SUBFOLDER
                    };
                    var children = [data];
                    var user_folder = insert_alpha($tree, pdat, parent);
                    $tree.tree('loadData', children, user_folder);
                    $tree.tree('openNode', user_folder);
                    node = $tree.tree('getNodeById',id);
                }
            }
        }
        return node;
    }

    function display_date(ds) {
        function pad(n) { return n<10 ? '0'+n : n; }
        if(ds==='none')
            return '';
        var date = new Date(ds);
        var diff = Date.now() - date;
        if(diff < 24*60*60*1000)
            return date.getHours() + ':' + pad(date.getMinutes());
        else
            return (date.getMonth()+1) + '/' + date.getDate();
    }

    function someone_elses(name) {
        return name + "'s Notebooks";
    }

    function fa_button(which, classname, title, size)
    {
        size = size || '90%';
        var span = $('<span/>', {class: 'fontawesome-button ' + classname});
        span.append($('<i/>', {class: which})
                    .css({'line-height': '90%',
                          'font-size': size}))
            .tooltip({
                title: title,
                delay: { show: 250, hide: 0 }
            });
        return span;
    }

    var this_user = null;

    var result = {
        widget: undefined,
        config: undefined,
        init: function() {
            var that = this;
            this_user = rcloud.username();
            $("#input-text-source-results-title").css("display", "none");
            $("#input-text-history-results-title").css("display", "none");
            this.create_book_tree_widget();
            this.load_config(function(config) {
                if(shell.gistname) // notebook specified in url
                    config.currbook = shell.gistname;
                else if(config.currbook)
                    that.load_notebook(config.currbook);
                else // branch new config
                    that.new_notebook();
            });
            var old_text = "";
            window.setInterval(function() {
                var new_text = $("#input-text-search").val();
                if (new_text !== old_text) {
                    old_text = new_text;
                    that.search(new_text);
                }
            }, 500);
        },
        create_book_tree_widget: function() {
            var that = this;
            var $tree = $("#editor-book-tree");
            function onCreateLiHandler(node, $li) {
                var title = $li.find('.title');
                if(node.visibility==='private')
                    title.wrap('<i/>');
                if (node.last_commit) {
                    title.after('<span style="float: right" id="date">'
                                             + display_date(node.last_commit) + '</span>');
                }
                if(node.gistname) {
                    var commands = $('<span/>', {class: 'commands'});
                    if(node.root==='interests' || node.user===this_user) {
                        var remove = fa_button('icon-remove', 'remove', 'remove', '75%');
                        remove.click(function() {
                            $(this).tooltip('hide');
                            that.remove_notebook(node);
                        });
                        commands.append(remove);
                    };
                    if(node.user===this_user) {
                        var make_private = fa_button('icon-eye-close', 'private', 'make private'),
                            make_public = fa_button('icon-eye-open', 'public', 'make public');
                        if(node.visibility=='public')
                            make_public.hide();
                        else
                            make_private.hide();
                        make_private.click(function() {
                            $(this).tooltip('hide');
                            that.set_visibility(node, 'private');
                        });
                        make_public.click(function() {
                            $(this).tooltip('hide');
                            that.set_visibility(node, 'public');
                        });
                        commands.append(make_private, make_public);
                    }
                    commands.hide();
                    title.append(commands);
                    $li.hover(
                        function() {
                            $('.commands', this).show();
                        },
                        function() {
                            $('.commands', this).hide();
                        });
                }
            }
            $tree.tree({
                onCreateLi: onCreateLiHandler
            });
            $tree.bind(
                'tree.click', function(event) {
                    if (event.node.id === 'newbook')
                        that.new_notebook();
                    else if(event.node.gistname)
                        that.load_notebook(event.node.gistname);
                }
            );
        },
        load_config: function(k) {
            var that = this;
            function defaults() {
                var ret = {currbook: null,
                           nextwork: 1,
                           interests: {},
                           all_books: {}};
                ret.interests[this_user] = {};
                return ret;
            }
            var my_config = load_all_configs(this_user, function(my_config) {
                that.config = my_config || defaults();
                populate_interests(that.config, this_user);
                k && k(that.config);
            });
        },
        save_config: function() {
            rcloud.save_user_config(this_user, this.config);
        },
        load_notebook: function(gistname) {
            shell.load_notebook(gistname, _.bind(result.notebook_loaded,this));
        },
        new_notebook: function() {
            if(isNaN(this.config.nextwork))
                this.config.nextwork = 1;
            var desc = "Notebook " + this.config.nextwork;
            ++this.config.nextwork;
            shell.new_notebook(desc, _.bind(result.notebook_loaded,this));
        },
        rename_notebook: function(gistname, newname) {
            rcloud.rename_notebook(gistname, newname, _.bind(result.notebook_loaded,this));
        },
        remove_notebook: function(node) {
            var $tree = $("#editor-book-tree");
            if(node.root === 'alls') {
                if(node.user === this_user)
                    delete this.config.all_books[node.gistname];
            }
            else {
                delete this.config.interests[node.user][node.gistname];
                if(node.user!==this_user && _.isEmpty(this.config.interests[node.user])) {
                    delete this.config.interests[node.user];
                    var id = '/interests/' + node.user;
                    node = $tree.tree('getNodeById', id);
                }
            }
            $tree.tree('removeNode', node);
            this.save_config();
        },
        set_visibility: function(node, visibility) {
            if(node.user !== this_user)
                throw "attempt to set visibility on notebook not mine";
            var $tree = $("#editor-book-tree");
            var entry = this.config.interests[this_user][node.gistname];
            entry.visibility = visibility;
            this.config.all_books[node.gistname] = entry;
            this.update_tree_entry(this_user, node.gistname, entry);
        },
        fork_notebook: function(gistname) {
            shell.fork_notebook(gistname, _.bind(result.notebook_loaded,this));
        },
        notebook_loaded: function(result) {
            this.config.currbook = result.id;
            this.update_notebook_status(result.user.login,
                                        result.id,
                                        {description: result.description,
                                         last_commit: result.updated_at || result.history[0].committed_at});
        },
        update_notebook_status: function(user, gistname, status) {
            // this is almost a task for d3 or mvc on its own
            var iu = this.config.interests[user], entry, upd, new_user;
            if(!iu) {
                iu = this.config.interests[user] = {};
                new_user = true;
            }
            if(iu[gistname]) {
                entry = iu[gistname];
                upd = true;
            }
            else {
                entry = iu[gistname] = {};
                upd = false;
            }
            entry.description = status.description;
            entry.last_commit = status.last_commit;
            entry.visibility = entry.visibility || 'public';

            // if we haven't seen this notebook and it belongs to
            // the logged-in user, save it to the all-books list
            if(!upd && user == this_user)
                this.config.all_books[gistname] = entry;

            var node = this.update_tree_entry(user, gistname, entry);
            // $tree.tree('selectNode', node); // currently disabled (tricky!)
        },
        update_tree_entry: function(user, gistname, entry) {
            var data = {label: entry.description,
                        last_commit: entry.last_commit,
                        sort_order: ordering.NOTEBOOK,
                        visibility: entry.visibility};

            var $tree = $("#editor-book-tree");
            var node = update_tree($tree, 'interests', user, gistname, data);
            update_tree($tree, 'alls', user, gistname, data);

            this.save_config();
            return node;
        },
        search: function(search_string) {
            var that = this;
            function split_source_search_lines(line) {
                var r = /:/g;
                var r2 = /\/([^/]+)\/([^/]+)/;
                var result = [];
                while (r.exec(line) !== null) {
                    result.push(r.lastIndex);
                    if (result.length === 2) {
                        var path = line.substring(0, result[0]-1);
                        var t = path.match(r2);
                        return [t[1], t[2],
                                line.substring(result[0], result[1]-1),
                                line.substring(result[1])];
                    }
                }
                throw "shouldn't get here";
            };
            function split_history_search_lines(line) {
                var t = line.indexOf(':');
                var r = /\|/g;
                var line_number = line.substring(0, t);
                line = line.substring(t+1);
                var result = [];
                while (r.exec(line) !== null) {
                    result.push(r.lastIndex);
                    if (result.length === 2) {
                        return [line_number,
                                line.substring(0, result[0]-1),
                                line.substring(result[0], result[1]-1),
                                line.substring(result[1])];
                    }
                }
                throw "shouldn't get here";
            };

            function update_source_search(result) {
                d3.select("#input-text-source-results-title")
                    .style("display", (result !== null && result.length >= 1)?null:"none");
                var data = _.map(result, split_source_search_lines);
                d3.select("#input-text-source-results-table")
                    .selectAll("tr").remove();
                var td_classes = ["user", "filename", "linenumber", "loc"];
                d3.select("#input-text-source-results-table")
                    .selectAll("tr")
                    .data(data)
                    .enter().append("tr")
                    .selectAll("td")
                    .data(function(d,i) {
                        return _.map(d, function(v, k) {
                            return [v, i];
                        });
                    })
                    .enter()
                    .append("td")
                    .text(function(d, i) {
                        if (i === 2) {
                            return d[0] + ":";
                        } else {
                            return d[0];
                        }
                    })
                    .attr("class", function(d, i) {
                        var j = d[1];
                        d = d[0];
                        if (j === 0 || data[j-1][i] !== d)
                            return "text-result-table-" + td_classes[i];
                        else
                            return "text-result-table-same-" + td_classes[i];
                    })
                    .on("click", function(d, i) {
                        if (i !== 1 && i !== 3)
                            return;
                        var j = d[1];
                        var user = data[j][0], notebook = data[j][1];
                        that.load_notebook(notebook);
                    })
                ;
            };
            function update_history_search(result) {
                d3.select("#input-text-history-results-title")
                    .style("display", (result !== null && result.length >= 1)?null:"none");
                var data = _.map(result, split_history_search_lines);
                d3.select("#input-text-history-results-table")
                    .selectAll("tr").remove();
                var td_classes = ["date", "user", "loc"];
                d3.select("#input-text-history-results-table")
                    .selectAll("tr")
                    .data(data)
                    .enter().append("tr")
                    .selectAll("td")
                    .data(function(d,i) {
                        return _.map(d.slice(1), function(v, k) {
                            return [v, i];
                        });
                    })
                    .enter()
                    .append("td")
                    .text(function(d) {
                        return d[0];
                    })
                    .attr("class", function(d, i) {
                        var j = d[1];
                        d = d[0];
                        if (j === 0 || data[j-1][i+1] !== d)
                            return "text-result-table-" + td_classes[i];
                        else
                            return "text-result-table-same-" + td_classes[i];
                    })
                    .on("click", function(d, i) {
                    })
                ;
            };
            rcloud.search(search_string, function(result) {
                update_source_search(result[0]);
                update_history_search(result[1]);
            });
        }
    };
    return result;
}();
