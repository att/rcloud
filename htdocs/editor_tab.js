var editor = function () {
    function convert_notebook_set(root, username, set) {
        var notebook_nodes = [];
        for(var name in set) {
            var attrs = set[name];
            var result = {
                label: attrs.description,
                gist_name: name,
                last_commit: attrs.last_commit || 'none',
                id: '/' + root + '/' + username + '/' + name
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
                    id: "newbook"
                });
            }
            notebook_nodes = notebook_nodes.concat(convert_notebook_set('interests', username, notebooks_config));

            if(username === this_user)
                my_notebooks = notebook_nodes;
            else {
                var node = {
                    label: someone_elses(username),
                    id: '/interests/' + username,
                    children: notebook_nodes
                };
                user_nodes.push(node);
            }
        }
        var children =  my_notebooks.concat(user_nodes);
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
                            children: notebook_nodes
                        };
                        user_nodes.push(node);
                    }
                }

                // create both root folders now but only load /alls now
                // populate_interests will load /interests
                var children = my_alls.concat(user_nodes);
                var root_data = [
                    { 
                        label: 'My Interests',
                        id: '/interests',
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

    function update_tree($tree, root, user, notebook, data) {
        var id = '/' + root + '/' + user + '/' + notebook;
        var node = $tree.tree('getNodeById', id);
        if(node) {
            // updateNode not available in the version of jqTree we're using
            // $tree.tree("updateNode", node, data); 
            // (and the newer versions don't look right?)
            node.setData(data);
            $(node.element).find('.title').text(data.label);
            $(node.element).find('#date').text(display_date(data.last_commit));
        }
        else {
            data.gist_name = notebook;
            data.id = '/' + root + '/' + user + '/' + notebook;
            if(user == rcloud.username()) {
                if(root === 'interests') {
                    var newnode = $tree.tree('getNodeById', "newbook");
                    node = $tree.tree("addNodeAfter", data, newnode);
                }
                else {
                    var parent = $tree.tree('getNodeById', '/' + root);
                    node = $tree.tree('appendNode', data, parent);
                }
            }
            else {
                var usernode = $tree.tree('getNodeById', '/' + root + '/' + user);
                if(usernode) 
                    $tree.tree('appendNode', data, usernode);
                else {
                    var parent = $tree.tree('getNodeById', '/' + root);
                    var pdat = [{
                        label: someone_elses(user),
                        id: '/' + root + '/' + user,
                        children: [data]
                    }];
                    // appendNode doesn't seem to work properly with subtrees
                    $tree.tree('loadData', pdat, parent);
                    var user_folder = $tree.tree('getNodeById', '/' + root + '/' + user);
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

    var result = {
        widget: undefined,
        config: undefined,
        init: function() {
            var that = this;
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
                if (node.last_commit) {
                    $li.find('.title').after('<span style="float: right" id="date">' 
                                             + display_date(node.last_commit) + '</span>');
                }
            }
            $tree.tree({
                onCreateLi: onCreateLiHandler
            });
            $tree.bind(
                'tree.click', function(event) {
                    if (event.node.id === "newbook") 
                        that.new_notebook();
                    else if(event.node.gist_name)
                        that.load_notebook(event.node.gist_name);
                }
            );
        },
        load_config: function(k) {
            var that = this;
            var this_user = rcloud.username();
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
            var this_user = rcloud.username();
            rcloud.save_user_config(this_user, this.config);
        },
        new_notebook: function() {
            if(isNaN(this.config.nextwork))
                this.config.nextwork = 1;
            var desc = "Notebook " + this.config.nextwork;
            ++this.config.nextwork;
            shell.new_notebook(desc, _.bind(result.notebook_loaded,this));
        },
        load_notebook: function(notebook) {
            var that = this;
            shell.load_notebook(notebook, _.bind(result.notebook_loaded,this));
        },
        notebook_loaded: function(result) {
            this.config.currbook = result.id;
            this.update_notebook_status(result.user.login, 
                                        result.id, 
                                        {description: result.description,
                                         last_commit: result.updated_at || result.history[0].committed_at});
        },
        update_notebook_status: function(user, notebook, status) {
            // this is almost a task for d3 or mvc on its own
            var iu = this.config.interests[user], entry, upd, new_user;
            if(!iu) {
                iu = this.config.interests[user] = {};
                new_user = true;
            }
            if(iu[notebook]) {
                entry = iu[notebook];
                upd = true;
            }
            else {
                entry = iu[notebook] = {};
                upd = false;
            }
            entry.description = status.description;
            entry.last_commit = status.last_commit;

            // if we haven't seen this notebook and it belongs to 
            // the logged-in user, sqve it to the all-books list
            if(!upd && user == rcloud.username())
                this.config.all_books[notebook] = entry;

            var data = {label: entry.description,
                        last_commit: entry.last_commit};

            var $tree = $("#editor-book-tree");
            var node = update_tree($tree, 'interests', user, notebook, data);
            // $tree.tree('selectNode', node); // currently disabled (tricky!)
            update_tree($tree, 'alls', user, notebook, data);

            this.save_config();
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
