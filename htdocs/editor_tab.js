var editor = function () {
    // major key is sort_order and minor key is name (label)
    var ordering = {
        HEADER: 0, // at top (unused)
        NOTEBOOK: 1,
        SUBFOLDER: 2
    };
    var CONFIG_VERSION = 1;

    // "private members"
    var username_ = null,
        $tree_ = undefined,
        config_ = undefined,
        publish_notebook_checkbox_ = null,
        star_notebook_button_ = null,
        histories_ = {},
        other_alls_ = {}; // notebooks of other users we have browsed (not persisted)

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

    // do a depth-first search to find a migration path from one version to another,
    // then apply all the migration functions.  obviously results will be unpredictable
    // if there is more than one path.
    function migrate_config() {
        var old_version = config_.config_version || 0;
        if(old_version === CONFIG_VERSION)
            return false;
        // upgrade from version M to N
        var migration_graph = {
            '0': {
                '1': function(config) {
                    // star all notebooks in interests
                    for(var u in config.interests)
                        for(var n in config.interests[u])
                            rcloud.stars.star_notebook(n);
                }
            }
        };
        function find_path(a, b) {
            if(a === b)
                return [];
            var links = migration_graph[a];
            if(!links)
                return null;
            if(links[b])
                return [{version: b, f: links[b]}];
            var path;
            for(var l in links)
                if((path = find_path(l, b))) {
                    path.unshift({version: l, f: links[l]});
                    return path;
                }
            return null;
        }
        var migration_path = find_path(old_version, CONFIG_VERSION);
        for(var i = 0; i < migration_path.length; ++i)
            migration_path[i].f(config_);
        config_.config_version = CONFIG_VERSION;
        return true;
    }

    function get_notebook_status(user, gistname) {
        var iu = config_.interests[user];
        return (iu && iu[gistname]) || config_.all_books[gistname] || other_alls_[gistname] || {};
    }

    function add_interest(user, gistname, entry) {
        var iu = config_.interests[user];
        if(!iu)
            iu = config_.interests[user] = {};
        iu[gistname] = entry;
    }

    function remove_interest(user, gistname) {
        delete config_.interests[user][gistname];
        if(user!==username_ && _.isEmpty(config_.interests[user])) {
            delete config_.interests[user];
            var id = '/interests/' + user;
            $tree_.tree('removeNode', $tree_.tree('getNodeById', id));
        }
    }

    function add_all(user, gistname, entry) {
        if(user === username_)
            config_.all_books[gistname] = entry;
        else
            other_alls_[gistname] = entry;
    }

    function remove_all(user, gistname) {
        if(user === username_)
            delete config_.all_books[gistname];
    }

    function remove_node(node) {
        if(!node)
            throw "removing non-existent node (star inconsistency?)";
        if(node.root === 'alls')
            remove_all(node.user, node.gistname);
        else if(node.root === 'interests')
            remove_interest(node.user, node.gistname);
        var dp = node.parent;
        $tree_.tree('removeNode', node);
        remove_empty_parents(dp);
        result.save_config();
    }

    function node_id(root, username, gistname, version) {
        var ret = '';
        for(var i=0; i < arguments.length; ++i)
            ret = ret + '/' + arguments[i];
        return ret;
    }

    function as_folder_hierarchy(nodes, prefix) {
        function is_in_folder(v) { return v.label.match(/([^/]+)\/(.+)/); }
        var in_folders = nodes;
        in_folders = _.filter(in_folders, is_in_folder);
        in_folders = _.map(in_folders, function(v) {
            var m = v.label.match(/([^/]+)\/(.+)/);
            var r = _.clone(v);
            r.folder_name = m[1];
            r.label = m[2];
            return r;
        });
        in_folders = _.groupBy(in_folders, function(v) {
            return v.folder_name;
        });
        in_folders = _.map(in_folders, function(v, k) {
            var children = _.map(v, function(o) {
                return _.omit(o, "folder_name");
            });
            var id = prefix + '/' + k;
            return {
                label: k,
                sort_order: ordering.NOTEBOOK,
                id: id,
                children: as_folder_hierarchy(children, id)
            };
        });
        var outside_folders = _.filter(nodes, function(v) {
            return !is_in_folder(v);
        });
        return outside_folders.concat(in_folders).sort(compare_nodes);
    }

    function convert_notebook_set(root, username, set) {
        var notebook_nodes = [];
        for(var name in set) {
            var attrs = set[name];
            if(username!==username_ && root==='alls' && attrs.visibility==='private')
                continue;
            var result = {
                label: attrs.description,
                gistname: name,
                user: username,
                root: root,
                visibility: attrs.visibility || 'public',
                last_commit: attrs.last_commit || 'none',
                id: node_id(root, username, name),
                sort_order: ordering.NOTEBOOK
            };
            notebook_nodes.push(result);
        }
        return notebook_nodes;
    }

    function populate_interests(root_data) {
        var my_notebooks, user_nodes = [];
        if(!config_.interests[username_])
            config_.interests[username_] = {};
        for (var username in config_.interests) {
            var user_notebooks = config_.interests[username];
            var notebook_nodes = [];
            notebook_nodes = notebook_nodes.concat(convert_notebook_set('interests', username, user_notebooks));

            if(username === username_)
                my_notebooks = notebook_nodes;
            else {
                var id = node_id('interests', username);
                var node = {
                    label: someone_elses(username),
                    id: id,
                    sort_order: ordering.SUBFOLDER,
                    children: as_folder_hierarchy(notebook_nodes, id).sort(compare_nodes)
                };
                user_nodes.push(node);
            }
        }
        var children = as_folder_hierarchy(my_notebooks, node_id('interests', username_));
        children = children.concat(user_nodes).sort(compare_nodes);
        root_data[0].children = children;
        result.create_book_tree_widget(root_data);
        var interests = $tree_.tree('getNodeById', "/interests");
        $tree_.tree('openNode', interests);
    }

    function load_all_configs(k) {
        rcloud.get_users(username_, function(users) {
            rcloud.load_multiple_user_configs(users, function(configset) {
                var my_alls = [], user_nodes = [], my_config = null;
                for(var username in configset) {
                    var user_config = configset[username];
                    if(!user_config)
                        continue;
                    var notebook_nodes = convert_notebook_set('alls', username, user_config.all_books);
                    if(username === username_) {
                        my_config = user_config;
                        my_alls = notebook_nodes;
                    }
                    else {
                        var id = node_id('alls', username);
                        var node = {
                            label: someone_elses(username),
                            id: id,
                            sort_order: ordering.SUBFOLDER,
                            children: as_folder_hierarchy(notebook_nodes, id).sort(compare_nodes)
                        };
                        user_nodes.push(node);
                    }
                }

                // start creating the tree data and pass it forward
                // populate_interests will create the tree
                var children = as_folder_hierarchy(my_alls, node_id('alls', username_));
                children = children.concat(user_nodes).sort(compare_nodes);
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
                k && k(my_config, root_data);
            });
        });
    }

    function insert_alpha(data, parent) {
        // this could be a binary search but linear is probably fast enough
        // for a single insert, and it also could be out of order
        for(var i = 0; i < parent.children.length; ++i) {
            var child = parent.children[i];
            var so = compare_nodes(data, child);
            if(so<0)
                return $tree_.tree('addNodeBefore', data, child);
        }
        return $tree_.tree('appendNode', data, parent);
    }

    function remove_empty_parents(dp) {
        // remove any empty notebook hierarchy
        while(dp.children.length===0 && dp.sort_order===ordering.NOTEBOOK) {
            var dp2 = dp.parent;
            $tree_.tree('removeNode', dp);
            dp = dp2;
        }
    }

    function update_tree(root, user, gistname, path, last_chance, create) {
        // make sure parents exist
        var id = user===username_ ? node_id(root) : node_id(root, user),
            parent = $tree_.tree('getNodeById', id),
            pdat = null,
            node = null;
        if(!parent) {
            if(user===username_)
                throw "my folder should be there at least";
            parent = $tree_.tree('getNodeById', node_id(root));
            if(!parent)
                throw "root '" + root + "' of notebook tree not found!";
            pdat = {
                label: someone_elses(user),
                id: node_id(root, user),
                sort_order: ordering.SUBFOLDER
            };
            parent = insert_alpha(pdat, parent);
        }
        while('children' in path) {
            node = $tree_.tree('getNodeById', path.id);
            if(!node) {
                pdat = _.omit(path, 'children');
                node = insert_alpha(pdat, parent);
            }
            parent = node;
            path = path.children[0];
        }
        var data = path;
        id = node_id(root, user, gistname);
        node = $tree_.tree('getNodeById', id);
        if(!node && !create)
            return null;
        var children;
        data.gistname = gistname;
        data.id = id;
        data.root = root;
        data.user = user;
        if(node) {
            children = node.children;
            if(last_chance)
                last_chance(node); // hacky
            var dp = node.parent;
            if(dp===parent && node.label===data.label)
                $tree_.tree('updateNode', node, data);
            else {
                $tree_.tree('removeNode', node);
                node = insert_alpha(data, parent);
                remove_empty_parents(dp);
            }
        }
        else
            node = insert_alpha(data, parent);
        return node;
    }

    function scroll_into_view(node) {
        var height = $tree_.parent().css("height").replace("px","");
        var p = node.parent;
        while(p.sort_order===ordering.NOTEBOOK) {
            $tree_.tree('openNode', p);
            p = p.parent;
        }
        if($(node.element).position().top > height)
            $tree_.parent().scrollTo(null, $tree_.parent().scrollTop()
                                     + $(node.element).position().top - height + 50);
        else if($(node.element).position().top < 0)
            $tree_.parent().scrollTo(null, $tree_.parent().scrollTop()
                                     + $(node.element).position().top - 100);
    }

    function find_index(collection, filter) {
        for (var i = 0; i < collection.length; i++) {
            if(filter(collection[i], i, collection))
                return i;
        }
        return -1;
    }


    // add_history_nodes
    // whither is 'hide' - erase all, 'index' - show thru index, 'sha' - show thru sha, 'more' - show INCR more
    function add_history_nodes(node, whither, where, k) {
        const INCR = 5;
        var debug_colors = false;
        var ellipsis = null;
        if(node.children.length && node.children[node.children.length-1].id == 'showmore')
            ellipsis = node.children[node.children.length-1];
        function curr_count() {
            var n = node.children.length;
            return ellipsis ? n-1 : n;
        }
        function show_sha(history, sha) {
            var sha_ind = find_index(history, function(hist) { return hist.version===sha; });
            if(sha_ind<0)
                throw "didn't find sha " + where + " in history";
            return sha_ind + INCR - 1; // show this many including curr (?)
        }


        function process_history(nshow) {
            function do_color(dat, color) {
                if(debug_colors)
                    dat.color = color;
            }
            function add_hist_node(hist, insf, color) {
                var hdat = _.clone(node);
                var sha = hist.version.substring(0, 10);
                hdat.label = sha;
                hdat.version = hist.version;
                hdat.last_commit = hist.committed_at;
                hdat.id = node.id + '/' + hdat.version;
                do_color(hdat, color);
                var nn = insf(hdat);
            }
            var history = histories_[node.gistname].slice(1); // first item is current version
            if(!history)
                return;
            var children = [];
            nshow = Math.min(nshow, history.length);

            if(debug_colors)
                for(var ii = 0, ee = curr_count(); ii<ee; ++ii)
                    $tree_.tree('updateNode', node.children[ii], {color: ''});

            // insert at top
            var nins, insf = null;
            if(node.children.length) {
                var first = node.children[0];
                nins = find_index(history, function(h) { return h.version==first.version; });
                insf = function(dat) { return $tree_.tree('addNodeBefore', dat, first); };
            }
            else {
                nins = nshow;
                insf = function(dat) { return $tree_.tree('appendNode', dat, node); };
            }
            for(var i=0; i<nins; ++i)
                add_hist_node(history[i], insf, 'green');

            var count = curr_count();
            if(count < nshow) { // top up
                if(ellipsis)
                    insf = function(dat) { return $tree_.tree('addNodeBefore', dat, ellipsis); };
                else
                    insf = function(dat) { return $tree_.tree('appendNode', dat, node); };
                for(i=count; i<nshow; ++i)
                    add_hist_node(history[i], insf, 'mediumpurple');
            }
            else if(count > nshow) // trim any excess
                for(i=count-1; i>=nshow; --i)
                    $tree_.tree('removeNode', node.children[i]);

            // hide or show ellipsis
            if(ellipsis) {
                if(nshow === history.length)
                    $tree_.tree('removeNode', ellipsis);
            }
            else {
                if(nshow < history.length) {
                    var data = {
                        label: '...',
                        id: 'showmore'
                    };
                    $tree_.tree('appendNode', data, node);
                }
            }
        }
        var nshow = undefined;
        if(whither==='hide') {
            for(var i = node.children.length-1; i >= 0; --i)
                $tree_.tree('removeNode', node.children[i]);
            return;
        }
        else if(whither==='index')
            nshow = Math.max(where, INCR);
        else if(whither==='more')
            nshow = curr_count() + INCR;
        else if(whither==='sha') {
            if(histories_[node.gistname])
                nshow = show_sha(histories_[node.gistname], where);
        }
        else throw "add_history_nodes don't understand how to seek '" + whither + "'";

        if(histories_[node.gistname]) {
            process_history(nshow);
            k && k(node);
        }
        else
            rcloud.load_notebook(node.gistname, null, function(notebook) {
                histories_[node.gistname] = notebook.history;
                if(whither==='sha')
                    nshow = show_sha(histories_[node.gistname], where);
                process_history(nshow);
                k && k(node);
            });
    }

    function update_tree_entry(tree, user, gistname, entry, history, do_select, create) {
        var data = {label: entry.description,
                    last_commit: entry.last_commit,
                    sort_order: ordering.NOTEBOOK,
                    visibility: entry.visibility};

        // we only receive history here if we're at HEAD, so use that if we get
        // it.  otherwise use the remembered history if any.  otherwise
        // add_history_nodes will do an async call to get the history.
        if(history)
            histories_[gistname] = history;

        // always show the same number of history nodes as before
        var whither = 'hide', where = null;
        var inter_path = as_folder_hierarchy([data], node_id(tree, user))[0];
        var node = update_tree(tree, user, gistname, inter_path,
                               function(node) {
                                   if(node.children.length) {
                                       whither = 'index';
                                       where = node.children.length;
                                       if(node.children[where-1].id==='showmore')
                                           --where;
                                   }
                               }, create);
        if(!node) // not created
            return null;
        // if we're looking at an old version, make sure it's visible
        if(gistname===config_.currbook && config_.currversion) {
            whither = 'sha';
            where = config_.currversion;
        }
        var k = null;
        if(config_.currversion)
            k = function(node) {
                $tree_.tree('openNode', node);
                if(do_select) {
                    var n2 = $tree_.tree('getNodeById',
                                         node_id('interests', user, gistname, config_.currversion));
                    if(!n2)
                        throw 'tree node was not created for current history';
                    $tree_.tree('selectNode', n2);
                    scroll_into_view(n2);
                }
            };
        add_history_nodes(node, whither, where, k);
        if(config_.currversion)
            node = null; // don't select

        if(node && do_select) {
            $tree_.tree('selectNode', node);
            scroll_into_view(node);
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

    function populate_comments(comments) {
        try {
            comments = JSON.parse(comments);
        } catch (e) {
            rclient.post_error("populate comments: " + e.message);
            return;
        }
        d3.select("#comment-count")
            .text(String(comments.length));
        // no update logic, clearing/rebuilding is easier
        d3.select("#comments-container").selectAll("div").remove();
        var comment_div = d3.select("#comments-container")
            .selectAll("div")
            .data(comments)
            .enter()
            .append("div")
            .attr("class", "comment-container");

        comment_div
            .append("div")
            .attr("class", "comment-header")
            .text(function(d) { return d.user.login; });
        comment_div
            .append("div")
            .attr("class", "comment-body")
            .text(function(d) { return d.body; });
    }

    var result = {
        init: function(gistname, version, k) {
            var that = this;
            username_ = rcloud.username();
            $("#input-text-source-results-title").css("display", "none");
            $("#input-text-history-results-title").css("display", "none");
            this.load_config(function() {
                if(gistname) // notebook specified in url
                    that.load_notebook(gistname, version);
                else if(config_.currbook)
                    that.load_notebook(config_.currbook, config_.currversion);
                else // brand new config
                    that.new_notebook();
                k && k();
            });
            var old_text = "";
            window.setInterval(function() {
                var new_text = $("#input-text-search").val();
                if (new_text !== old_text) {
                    old_text = new_text;
                    that.search(new_text);
                }
            }, 500);
            $('#new-notebook').click(function() {
                that.new_notebook();
            });
            publish_notebook_checkbox_ = ui_utils.checkbox_menu_item($("#publish-notebook"),
               function() { rcloud.publish_notebook(config_.currbook); },
               function() { rcloud.unpublish_notebook(config_.currbook); });
            var snf = result.star_notebook;
            star_notebook_button_ =
                ui_utils.twostate_icon($("#star-notebook"),
                                       snf.bind(this, true), snf.bind(this, false),
                                       'icon-star', 'icon-star-empty');
        },
        create_book_tree_widget: function(data) {
            var that = this;
            const icon_style = {'line-height': '90%'};

            function onCreateLiHandler(node, $li) {
                var title = $li.find('.jqtree-title');
                title.css('color', node.color);
                if(node.visibility==='private')
                    title.wrap('<i/>');
                if(node.last_commit && (!node.version ||
                                        display_date(node.last_commit) != display_date(node.parent.last_commit))) {
                    title.after('<span style="float: right" id="date">'
                                             + display_date(node.last_commit) + '</span>');
                }
                if(node.version)
                    title.addClass('history');
                if(node.gistname && !node.version) {
                    var add_buttons = function() {
                        add_buttons.target.append('&nbsp;');
                        add_buttons.target.append.apply(add_buttons.target, arguments);
                    };
                    // commands that are always there
                    var always = $('<span/>', {class: 'notebook-commands'});
                    add_buttons.target = always;
                    if(node.root==='interests') {
                        var star_style = {'font-size': '80%'};
                        var unstar = ui_utils.fa_button('icon-star', 'unstar', 'unstar', star_style);
                        unstar.click(function() {
                            that.star_notebook(false, {gistname: node.gistname, user: node.user});
                        });
                        add_buttons(unstar);
                    }

                    // commands that appear
                    var commands = $('<span/>', {class: 'notebook-commands appear'});
                    add_buttons.target = commands;
                    if(true) { // all notebooks have history - should it always be accessible?
                        var disable = config_.currbook===node.gistname && config_.currversion;
                        var history = ui_utils.fa_button('icon-time', 'history', 'history', icon_style);
                        // jqtree recreates large portions of the tree whenever anything changes
                        // so far this seems safe but might need revisiting if that improves
                        if(disable)
                           history.addClass('button-disabled');
                        history.click(function() {
                            if(!disable) {
                                that.show_history(node, true);
                            }
                            return false;
                        });

                        add_buttons(history);
                    }
                    if(node.user===username_) {
                        var make_private = ui_utils.fa_button('icon-eye-close', 'make private', 'private', icon_style),
                            make_public = ui_utils.fa_button('icon-eye-open', 'make public', 'public', icon_style);
                        if(node.visibility=='public')
                            make_public.hide();
                        else
                            make_private.hide();
                        make_private.click(function() {
                            that.set_visibility(node, 'private');
                        });
                        make_public.click(function() {
                            that.set_visibility(node, 'public');
                        });
                        add_buttons(make_private, make_public);
                    }
                    if(node.root != 'interests' && node.user===username_) {
                        var remove = ui_utils.fa_button('icon-remove', 'remove', 'remove', icon_style);
                        remove.click(function() {
                            that.remove_notebook(node);
                        });
                        add_buttons(remove);
                    };
                    commands.hide();
                    title.append('&nbsp;', always, commands);
                    $li.hover(
                        function() {
                            $('.notebook-commands.appear', this).show();
                        },
                        function() {
                            $('.notebook-commands.appear', this).hide();
                        });
                }
            }
            $tree_ = $("#editor-book-tree");
            $tree_.tree({
                data: data,
                onCreateLi: onCreateLiHandler,
                selectable: true
            });
            $tree_.bind(
                'tree.click', function(event) {
                    if(event.node.id === 'showmore')
                        that.show_history(event.node.parent, false);
                    else if(event.node.gistname) {
                        if(event.click_event.metaKey || event.click_event.ctrlKey) {
                            var url = window.location.protocol + '//' + window.location.host + '/main.html?notebook=' + event.node.gistname;
                            window.open(url, "_blank");
                        }
                        else
                            that.load_notebook(event.node.gistname, event.node.version || null, event.node.root);
                    }
                    return false;
                }
            );
        },
        load_config: function(k) {
            var that = this;
            function defaults() {
                return ret;
            }
            load_all_configs(function(my_config, root_data) {
                // build up config incrementally & allow user to just
                // remove parts of it if they're broken
                config_ = my_config || {};
                config_.currbook = config_.currbook || null;
                config_.currversion = config_.currversion || null;
                config_.bookuser = config_.bookuser || null;
                config_.nextwork = config_.nextwork || 1;
                config_.interests = config_.interests || {};
                config_.interests[username_] = config_.interests[username_] || {};
                config_.all_books = config_.all_books || {};
                if(migrate_config())
                    that.save_config();
                populate_interests(root_data);
                k && k();
            });
        },
        save_config: function() {
            rcloud.save_user_config(username_, config_);
        },
        load_notebook: function(gistname, version, selroot) {
            var that = this;
            if(selroot)
                shell.load_notebook(gistname, version, this.load_callback(version, false, selroot));
            else {
                rcloud.stars.is_notebook_starred(gistname, function(b) {
                    selroot = b ? 'interests' : 'alls';
                    shell.load_notebook(gistname, version, that.load_callback(version, false, selroot));
                });
            }
        },
        new_notebook: function() {
            var that = this;
            if(isNaN(config_.nextwork))
                config_.nextwork = 1;
            var desc = "Notebook " + config_.nextwork;
            ++config_.nextwork;
            shell.new_notebook(desc, function(notebook) {
                var k = that.load_callback(null, false, 'interests', true);
                rcloud.stars.star_notebook(notebook.id);
                k(notebook);
            });
        },
        rename_notebook: function(gistname, newname) {
            rcloud.rename_notebook(gistname, newname, this.load_callback(null, true));
        },
        star_notebook: function(star, opts) {
            // if opts has user and gistname use those
            // else if opts has notebook, use notebook id & user
            // else use current notebook & user
            opts = opts || {};
            var user = opts.user
                    || opts.notebook&&opts.notebook.user&&opts.notebook.user.login
                    || config_.bookuser;
            var gistname = opts.gistname
                    || opts.notebook&&opts.notebook.id
                    || config_.currbook;
            if(config_.currbook === gistname)
                star_notebook_button_(star); // redundant if it came from button but ok
            if(star) {
                rcloud.stars.star_notebook(gistname);
                if(opts.notebook)
                    editor.update_notebook_from_gist(opts.notebook, opts.notebook.history, null, true);
                else {
                    var entry = get_notebook_status(user, gistname);
                    add_interest(user, gistname, entry);
                    update_tree_entry('interests', user, gistname, entry, null, null, true);
                    this.save_config();
                }
            }
            else {
                rcloud.stars.unstar_notebook(gistname);
                var node = $tree_.tree('getNodeById', node_id('interests', user, gistname));
                remove_node(node);
            }
        },
        remove_notebook: function(node) {
            if(node.root === 'interests')
                rcloud.stars.unstar_notebook(node.gistname);
            remove_node(node);
            if(node.gistname === config_.currbook)
                this.new_notebook();
        },
        set_visibility: function(node, visibility) {
            if(node.user !== username_)
                throw "attempt to set visibility on notebook not mine";
            var entry = config_.interests[username_][node.gistname];
            entry.visibility = visibility;
            config_.all_books[node.gistname] = entry;
            update_tree_entry(node.root, username_, node.gistname, entry, false, false);
            this.save_config();
        },
        fork_or_revert_notebook: function(is_mine, gistname, version) {
            shell.fork_or_revert_notebook(is_mine, gistname, version, this.load_callback(null, is_mine, 'interests', true));
        },
        show_history: function(node, toggle) {
            var whither = node.children.length && toggle ? 'hide' : 'more';
            add_history_nodes(node, whither, null, function(node) {
                $tree_.tree('openNode', node);
            });
        },
        load_callback: function(version, is_change, selroot, create_interest, k) {
            var that = this;
            return function(result) {
                if(!result.description)
                    throw "Invalid notebook (must have description)";
                config_.currbook = result.id;
                config_.currversion = version;
                config_.bookuser = result.user.login;
                var history;
                // when loading an old version you get truncated history
                // we don't want that, even if it means an extra fetch
                if(version)
                    history = null;
                else
                    history = result.history;
                // there is a bug in old github where if you make a change you only
                // get the old history and not the current
                if(is_change && shell.is_old_github())
                    history.unshift({version:'blah'});
                that.update_notebook_from_gist(result, history, selroot, create_interest);
                that.update_notebook_file_list(result.files);
                rcloud.get_all_comments(result.id, function(data) {
                    populate_comments(data);
                });
                $("#github-notebook-id").text(result.id).click(false);
                rcloud.is_notebook_published(result.id, function(p) {
                    publish_notebook_checkbox_(p);
                });
                rcloud.stars.is_notebook_starred(result.id, function(b) {
                    star_notebook_button_(b);
                });
                k && k();
            };
        },
        update_notebook_from_gist: function(result, history, selroot, create_interest) {
            this.update_notebook_status(result.user.login,
                                        result.id,
                                        {description: result.description,
                                         last_commit: result.updated_at || result.history[0].committed_at,
                                         history: history},
                                        selroot,
                                        create_interest);
        },
        update_notebook_status: function(user, gistname, status, selroot, create_interest) {
            var entry = get_notebook_status(user, gistname);

            entry.description = status.description;
            entry.last_commit = status.last_commit;
            entry.visibility = entry.visibility || 'public';

            if(create_interest)
                add_interest(user, gistname, entry);
            update_tree_entry('interests', user, gistname, entry, status.history,
                              selroot==='interests', create_interest);

            add_all(user, gistname, entry);
            update_tree_entry('alls', user, gistname, entry, status.history,
                              selroot==='alls', true);
            this.save_config();
        },
        update_notebook_file_list: function(files) {
            // FIXME natural sort!
            var files_out = _(files).pairs().filter(function(v) {
                var k = v[0];
                return !k.match(/\.([rR]|[mM][dD])$/) && k !== "r_type" && k !== "r_attributes";
            });
            if(files_out.length)
                $("#notebook-assets-header").show();
            else
                $("#notebook-assets-header").hide();

            d3.select("#advanced-menu")
                .selectAll("li .notebook-assets")
                .remove();
            var s = d3.select("#advanced-menu")
                .selectAll("li .notebook-assets")
                .data(files_out)
                .enter()
                .append("li")
                .classed("notebook-assets", true)
                .append("a")
                .attr("tabindex", "-1")
                .attr("href", "#");
            s.append("a")
                .text(function(d) { return d[0]; })
                .attr("href", function(d) { return d[1].raw_url; })
                .attr("target", "_blank");

                // .text(function(d, i) { return String(i); });
        },
        post_comment: function(comment) {
            comment = JSON.stringify({"body":comment});
            rcloud.post_comment(config_.currbook, comment, function(result) {
                if (!result)
                    return;
                rcloud.get_all_comments(config_.currbook, function(data) {
                    populate_comments(data);
                    $('#comment-entry-body').val('');
                });
            });
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
                        that.load_notebook(notebook, null);
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
