var editor = function () {
    // major key is adsort_order and minor key is name (label)
    var ordering = {
        HEADER: 0, // at top (unused)
        NOTEBOOK: 1,
        MYFOLDER: 2,
        SUBFOLDER: 4
    };
    var CONFIG_VERSION = 1;

    /* "Model-Model-View-Controller"
     .. or something ..
     there are two models: the local state and the global rcs+github
     the local model is private data of this class

     E.g. an interest ("star") is reflected in 7 places:
     Global model
     - the star in rcs (logically in github but they don't have the necessary APIs)
     - the count in rcs
     Local model
     - the entry in notebook_info_[]
     - the bit in my_stars_[]
     View
     - the existence of the node under Notebooks I Starred in the notebook tree UI
     - the filling of the star icon next to the node under All Notebooks in the tree UI
     - the filling of the star icon in the navbar (if current notebook)
     */

    // local model (all caches of stuff stored in RCS/github)
    var username_ = null, // cache of rcloud.username() so we're not reading a cookie
        histories_ = {}, // cached notebook histories
        notebook_info_ = {}, // all notebooks we are aware of
        num_stars_ = {}, // number of stars for all known notebooks
        my_stars_ = {}, // set of notebooks starred by me
        my_friends_ = {}, // people whose notebooks i've starred
        invalid_notebooks_ = {},
        current_ = null; // current notebook and version

    // view
    var $tree_ = null,
        publish_notebook_checkbox_ = null,
        star_notebook_button_ = null;

    // work around oddities of rserve.js
    function each_r_list(list, f) {
        for(var key in list)
            if(key!=='r_attributes' && key!=='r_type')
                f(key);
    }
    function r_vector(value) {
        return _.isArray(value) ? value : [value];
    }

    //  Model functions
    function someone_elses(name) {
        return name + "'s Notebooks";
    }

    function get_notebook_info(gistname) {
        return notebook_info_[gistname] || {};
    }

    function add_interest(user, gistname) {
        if(!my_stars_[gistname]) {
            my_stars_[gistname] = true;
            my_friends_[user] = (my_friends_[user] || 0) + 1;
        }
    }

    function remove_interest(user, gistname) {
        if(my_stars_[gistname]) {
            delete my_stars_[gistname];
            if(--my_friends_[user] === 0)
                delete my_friends_[user];
        }
    }

    function set_visibility(gistname, visible) {
        var entry = get_notebook_info(gistname);
        entry.visible = visible;
        notebook_info_[gistname] = entry;
        return rcloud.set_notebook_visibility(gistname, visible);
    }

    function add_notebook_info(user, gistname, entry) {
        notebook_info_[gistname] = entry;
        var p = rcloud.set_notebook_info(gistname, entry);
        if(user === username_)
            p = p.then(function() { rcloud.config.add_notebook(gistname); });
        return p;
    }

    function remove_notebook_info(user, gistname) {
        return user === username_ ?
            rcloud.config.remove_notebook(gistname) :
            Promise.resolve();
    }

    function update_notebook_model(user, gistname, description, time) {
        var entry = get_notebook_info(gistname);

        entry.username = user;
        entry.description = description;
        entry.last_commit = time;

        add_notebook_info(user, gistname, entry);
        return entry; // note: let go of promise
    }


    // View (tree) functions

    function node_id(root, username, gistname, version) {
        var ret = '';
        for(var i=0; i < arguments.length; ++i)
            ret = ret + '/' + arguments[i];
        return ret;
    }

    var trnexp = /^(.*) ([0-9]+)$/;

    function compare_nodes(a, b) {
        var so = a.sort_order-b.sort_order;
        if(so) return so;
        else {
            var alab = a.name || a.label, blab = b.name || b.label;
            // cut trailing numbers and sort separately
            var amatch = trnexp.exec(alab), bmatch = trnexp.exec(blab);
            if(amatch && bmatch && amatch[1] == bmatch[1]) {
                var an = +amatch[2], bn = +bmatch[2];
                return an - bn;
            }
            var lc = alab.localeCompare(blab);
            if(lc === 0) {
                // put a folder with the same name as a notebook first
                if(a.children) {
                    if(b.children)
                        throw new Error("uh oh, parallel folders");
                    return -1;
                }
                else if(b.children)
                    return 1;
                // make sort stable on gist id (creation time would be better)
                lc = a.gistname.localeCompare(b.gistname);
            }
            return lc;
        }
    }

    // way too subtle. shamelessly copying OSX Finder behavior here (because they're right).
    function find_next_copy_name(username, description) {
        var pid = node_id("alls", username);
        var parent = $tree_.tree('getNodeById', pid);
        if(parent === undefined)
            return description;
        if(parent.delay_children)
            load_children(parent);
        var map = _.object(_.map(parent.children, function(c) { return [c.name, true]; }));
        if(!map[description])
            return description;
        var match, base, n;
        if((match = trnexp.exec(description))) {
            base = match[1];
            n = +match[2];
        }
        else {
            base = description;
            n = 1;
        }
        var copy_name;
        do
            copy_name = base + " " + (++n);
        while(map[copy_name]);
        return copy_name;
    }


    function as_folder_hierarchy(nodes, prefix, name_prefix) {
        function is_in_folder(v) { return v.label.match(/([^/]+)\/(.+)/); }
        var in_folders = nodes;
        // tired of seeing the "method 'match' of undefined" error
        if(_.some(in_folders, function(entry) {
            return entry.label === undefined || entry.label === null;
        }))
           throw new Error("incomplete notebook entry (has it been shown yet?)");
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
            var id = prefix + '/' + k,
                full_name = (name_prefix ? name_prefix + '/' : '')  + k;
            return {
                label: k,
                full_name: full_name,
                sort_order: ordering.NOTEBOOK,
                id: id,
                children: as_folder_hierarchy(children, id, full_name)
            };
        });
        var outside_folders = _.filter(nodes, function(v) {
            return !is_in_folder(v);
        });
        outside_folders.forEach(function(v) {
            v.full_name = (name_prefix ? name_prefix + '/' : '')  + v.label;
        });
        return outside_folders.concat(in_folders).sort(compare_nodes);
    }

    function convert_notebook_set(root, username, set) {
        var notebook_nodes = [];
        for(var name in set) {
            var attrs = set[name];
            var result = {
                label: attrs.description,
                gistname: name,
                user: username,
                root: root,
                visible: attrs.visible,
                last_commit: attrs.last_commit || 'none',
                id: node_id(root, username, name),
                sort_order: ordering.NOTEBOOK
            };
            notebook_nodes.push(result);
        }
        return notebook_nodes;
    }

    function populate_interests(my_stars_array) {
        function create_user_book_entry_map(books) {
            var users = {};
            _.each(books,
                   function(book){
                       var entry = notebook_info_[book];
                       if(!entry) {
                           invalid_notebooks_[book] = null;
                           return users;
                       }
                       if(!entry.username || entry.username === "undefined" ||
                          !entry.description || !entry.last_commit) {
                           invalid_notebooks_[book] = entry;
                           return users;
                       }
                       var user = users[entry.username] = users[entry.username] || {};
                       user[book] = entry;
                       return users;
                   });
            return users;
        }

        var interests = create_user_book_entry_map(my_stars_array);
        var user_nodes = [];
        for (var username in interests) {
            var user_notebooks = interests[username];
            for(var gistname in user_notebooks) {
                add_interest(username, gistname);
                // sanitize... this shouldn't really happen...
                if(!user_notebooks[gistname].description)
                    user_notebooks[gistname].description = "(no description)";
            }

            var notebook_nodes = convert_notebook_set('interests', username, user_notebooks);
            var id = node_id('interests', username);
            var mine = username === username_;
            var node = {
                label: mine ? "My Notebooks" : someone_elses(username),
                id: id,
                sort_order: mine ? ordering.MYFOLDER : ordering.SUBFOLDER,
                children: as_folder_hierarchy(notebook_nodes, id).sort(compare_nodes)
            };
            user_nodes.push(node);
        }
        return {
            label: 'Notebooks I Starred',
            id: '/interests',
            children: user_nodes.sort(compare_nodes)
        };
    }

    function populate_all_notebooks(user_notebooks) {
        function create_book_entry_map(books) {
            return _.chain(books)
                .filter(function(book) {
                    var entry = notebook_info_[book];
                    if(!entry) {
                        invalid_notebooks_[book] = null;
                        return false;
                    }
                    if(!entry.username || entry.username === "undefined" ||
                       !entry.description || !entry.last_commit) {
                        invalid_notebooks_[book] = entry;
                        return false;
                    }
                    return true;
                })
                .map(function(book) {
                    var entry = notebook_info_[book];
                    return [book, entry];
                })
                .object().value();
        }

        var user_nodes = [], my_config = null;
        each_r_list(user_notebooks, function(username) {
            var notebook_nodes =
                    convert_notebook_set('alls', username,
                                         create_book_entry_map(r_vector(user_notebooks[username])));
            var mine = username===username_;
            var id = node_id('alls', username);
            var node = {
                label: mine ? "My Notebooks" : someone_elses(username),
                id: id,
                sort_order: mine ? ordering.MYFOLDER : ordering.SUBFOLDER,
                children: as_folder_hierarchy(notebook_nodes, id).sort(compare_nodes)
            };
            user_nodes.push(node);
        });
        return {
            label: 'All Notebooks',
            id: '/alls',
            children: user_nodes.sort(compare_nodes)
        };
    }

    function duplicate_tree_data(tree, f) {
        var t2 = f(tree);
        if(tree.children) {
            var ch2 = [];
            for(var i=0; i<tree.children.length; ++i)
                ch2.push(duplicate_tree_data(tree.children[i], f));
            t2.children = ch2;
        }
        return t2;
    }

    function friend_from_all(datum) {
        if(datum.delay_children)
            load_children(datum);
        var d2 = _.pick(datum, "label", "name", "gistname", "user", "visible", "last_commit", "sort_order");
        d2.id = datum.id.replace("/alls/", "/friends/");
        d2.root = "friends";
        return d2;
    }

    function populate_friends(alls_root) {
        var friend_subtrees = alls_root.children.filter(function(subtree) {
            return my_friends_[subtree.id.replace("/alls/","")]>0;
        }).map(function(subtree) {
            return duplicate_tree_data(subtree, friend_from_all);
        });
        return [
            {
                label: 'People I Starred',
                id: '/friends',
                children: friend_subtrees
            },
            alls_root
        ];
    }

    function load_tree(root_data) {
        // delay construction of dom elements for Alls
        var alls = _.find(root_data, function(root) { return root.id === "/alls"; }).children;
        for(var i = 0; i < alls.length; ++i)
            if(alls[i].children && alls[i].children.length) {
                alls[i].delay_children = alls[i].children;
                alls[i].children = [{label: 'loading...'}];
            }
        result.create_book_tree_widget(root_data);
        var interests = $tree_.tree('getNodeById', "/interests");
        $tree_.tree('openNode', interests);
    }

    function load_children(n) {
        $tree_.tree('loadData', n.delay_children, n);
        delete n.delay_children;
    }

    function load_everything() {
        return Promise.all([
            rcloud.get_users().then(rcloud.config.all_notebooks_multiple_users),
            rcloud.stars.get_my_starred_notebooks()
        ])
            .spread(function(user_notebook_set, my_stars_array) {
                my_stars_array = r_vector(my_stars_array);
                var all_notebooks = [];
                each_r_list(user_notebook_set, function(username) {
                    all_notebooks = all_notebooks.concat(r_vector(user_notebook_set[username]));
                });
                all_notebooks = all_notebooks.concat(my_stars_array);
                all_notebooks = _.uniq(all_notebooks.sort(), true);
                var root_data = [];
                return Promise.all([rcloud.config.get_current_notebook()
                                    .then(function(current) {
                                        current_ = current;
                                    }),
                                    rcloud.stars.get_multiple_notebook_star_counts(all_notebooks)
                                    .then(function(counts) {
                                        num_stars_ = counts;
                                    }),
                                    rcloud.get_multiple_notebook_infos(all_notebooks)
                                    .then(function(notebook_entries) {
                                        notebook_info_ = notebook_entries;
                                    })])
                    .then(populate_interests.bind(null, my_stars_array))
                    .then(function(interests) { root_data.push(interests); })
                    .then(populate_all_notebooks.bind(null, user_notebook_set))
                    .then(populate_friends)
                    .spread(function(friends, alls) { root_data.push(friends, alls); })
                    .return(root_data);
            })
            .then(load_tree)
            .then(function() {
                for(var book in invalid_notebooks_) {
                    var entry = invalid_notebooks_[book];
                    if(!entry)
                        console.log("notebook metadata for " + book + " is missing.");
                    else
                        console.log("notebook metadata for " + book + " has invalid entries: " + JSON.stringify(_.pick(entry, "username","description","last_commit","visible")));
                }
            })
            .catch(rclient.post_rejection);
    }

    function find_sort_point(data, parent) {
        // this could be a binary search but linear is probably fast enough
        // for a single insert, and it also could be out of order
        for(var i = 0; i < parent.children.length; ++i) {
            var child = parent.children[i];
            var so = compare_nodes(data, child);
            if(so<0)
                return child;
        }
        return 0;
    }
    function insert_alpha(data, parent) {
        var before = find_sort_point(data, parent);
        if(before)
            return $tree_.tree('addNodeBefore', data, before);
        else
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
        if(!root)
            throw new Error("need root");
        if(!user)
            throw new Error("need user");
        if(!gistname)
            throw new Error("need gistname");
        // make sure parents exist
        var parid = node_id(root, user),
            parent = $tree_.tree('getNodeById', parid),
            pdat = null,
            node = null;
        if(!parent) {
            var mine = user === username_; // yes it is possible I'm not my own friend
            parent = $tree_.tree('getNodeById', node_id(root));
            if(!parent) {
                throw new Error("root '" + root + "' of notebook tree not found!");
            }
            pdat = {
                label: mine ? "My Notebooks" : someone_elses(user),
                id: node_id(root, user),
                sort_order: mine ? ordering.MYFOLDER : ordering.SUBFOLDER
            };
            parent = insert_alpha(pdat, parent);
        }
        if(parent.delay_children)
            load_children(parent);
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
        var id = node_id(root, user, gistname);
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
            if(dp===parent && node.name===data.label)
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

    function find_index(collection, filter) {
        for (var i = 0; i < collection.length; i++) {
            if(filter(collection[i], i, collection))
                return i;
        }
        return -1;
    }


    // add_history_nodes
    // whither is 'hide' - erase all, 'index' - show thru index, 'sha' - show thru sha, 'more' - show INCR more
    function add_history_nodes(node, whither, where) {
        var INCR = 5;
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
                throw new Error("didn't find sha " + where + " in history");
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
        var nshow;
        if(whither==='hide') {
            for(var i = node.children.length-1; i >= 0; --i)
                $tree_.tree('removeNode', node.children[i]);
            return Promise.resolve(node);
        }
        else if(whither==='index')
            nshow = Math.max(where, INCR);
        else if(whither==='more')
            nshow = curr_count() + INCR;
        else if(whither==='sha') {
            if(histories_[node.gistname])
                nshow = show_sha(histories_[node.gistname], where);
        }
        else throw new Error("add_history_nodes don't understand how to seek '" + whither + "'");

        if(histories_[node.gistname]) {
            process_history(nshow);
            return Promise.resolve(node);
        }
        else
            return rcloud.load_notebook(node.gistname, null).then(function(notebook) {
                histories_[node.gistname] = notebook.history;
                if(whither==='sha')
                    nshow = show_sha(histories_[node.gistname], where);
                process_history(nshow);
                return node;
        });
    }

    function scroll_into_view(node) {
        var height = $tree_.parent().css("height").replace("px","");
        var p = node.parent;
        while(p.sort_order===ordering.NOTEBOOK) {
            $tree_.tree('openNode', p);
            p = p.parent;
        }
        if($(node.element).position().top > height)
            $tree_.parent().scrollTo(null, $tree_.parent().scrollTop() +
                                     $(node.element).position().top - height + 50);
        else if($(node.element).position().top < 0)
            $tree_.parent().scrollTo(null, $tree_.parent().scrollTop() +
                                     $(node.element).position().top - 100);
    }

    function select_node(node) {
        $tree_.tree('selectNode', node);
        scroll_into_view(node);
        if(!node.version)
            RCloud.UI.notebook_title.make_editable(
                node,
                !shell.notebook.model.read_only());
        else RCloud.UI.notebook_title.make_editable(null);
    }

    function update_tree_entry(root, user, gistname, entry, create) {
        var data = {label: entry.description,
                    last_commit: entry.last_commit,
                    sort_order: ordering.NOTEBOOK,
                    visible: entry.visible};

        // always show the same number of history nodes as before
        var whither = 'hide', where = null;
        var inter_path = as_folder_hierarchy([data], node_id(root, user))[0];
        var node = update_tree(root, user, gistname, inter_path,
                               function(node) {
                                   if(node.children.length) {
                                       whither = 'index';
                                       where = node.children.length;
                                       if(node.children[where-1].id==='showmore')
                                           --where;
                                   }
                               }, create);
        if(!node)
            return Promise.resolve(null); // !create

        // if we're looking at an old version, make sure it's shown
        if(gistname===current_.notebook && current_.version) {
            whither = 'sha';
            where = current_.version;
        }
        return add_history_nodes(node, whither, where);
    }

    function update_notebook_view(user, gistname, entry, selroot) {
        function open_and_select(node) {
            if(current_.version) {
                $tree_.tree('openNode', node);
                var n2 = $tree_.tree('getNodeById',
                                     node_id(node.root, user, gistname, current_.version));
                if(!n2)
                    throw new Error('tree node was not created for current history');
                node = n2;
            }
            select_node(node);
        }
        var p;
        if(selroot === true)
            selroot = my_stars_[gistname] ? 'interests' :
                my_friends_[user] ? 'friends' : 'alls';
        if(my_stars_[gistname]) {
            p = update_tree_entry('interests', user, gistname, entry, true);
            if(selroot==='interests')
                p.then(open_and_select);
        }
        if(gistname === current_.notebook) {
            if(!_.isUndefined(star_notebook_button_) && !_.isNull(star_notebook_button_))
                star_notebook_button_.set_state(my_stars_[gistname]);
            $('#curr-star-count').text(num_stars_[gistname] || 0);
        }
        if(my_friends_[user]) {
            p = update_tree_entry('friends', user, gistname, entry, true);
            if(selroot==='friends')
                p.then(open_and_select);
        }

        p = update_tree_entry('alls', user, gistname, entry, true);
        if(selroot==='alls')
            p.then(open_and_select);
    }

    // hack to fake a hover over a node (or the next one if it's deleted)
    // because jqTree rebuilds DOM elements and events get lost
    function fake_hover(node) {
        var parent = node.parent;
        var index = $('.notebook-commands.appear', node.element).css('display') !== 'none' ?
                parent.children.indexOf(node) : undefined;
        setTimeout(function() {
            if(index>=0 && index < parent.children.length) {
                var next = parent.children[index];
                $(next.element).mouseover();
            }
        }, 0);
    }

    function remove_node(node) {
        var parent = node.parent;
        fake_hover(node);
        $tree_.tree('removeNode', node);
        remove_empty_parents(parent);
        if(node.root === 'interests' && node.user !== username_ && parent.children.length === 0)
            $tree_.tree('removeNode', parent);
    }

    function remove_notebook_view(user, gistname) {
        function do_remove(id) {
            var node = $tree_.tree('getNodeById', id);
            if(node)
                remove_node(node);
            else
                console.log("tried to remove node that doesn't exist: " + id);
        }
        if(my_friends_[user])
            do_remove(node_id('friends', user, gistname));
        do_remove(node_id('alls', user, gistname));
    }

    function unstar_notebook_view(user, gistname, selroot) {
        var inter_id = node_id('interests', user, gistname);
        var node = $tree_.tree('getNodeById', inter_id);
        if(!node) {
            console.log("attempt to unstar notebook we didn't know was starred", inter_id);
            return;
        }
        remove_node(node);
        update_notebook_view(user, gistname, get_notebook_info(gistname), selroot);
    }

    function update_notebook_from_gist(result, history, selroot) {
        document.title = result.description+" - RCloud";
        var user = result.user.login, gistname = result.id;
        // we only receive history here if we're at HEAD, so use that if we get
        // it.  otherwise use the remembered history if any.  otherwise
        // add_history_nodes will do an async call to get the history.
        if(history)
            histories_[gistname] = history;

        var entry = update_notebook_model(user, gistname,
                                          result.description,
                                          result.updated_at || result.history[0].committed_at);

        update_notebook_view(user, gistname, entry, selroot);
    }

    function change_folder_friendness(user) {
        if(my_friends_[user]) {
            var anode = $tree_.tree('getNodeById', node_id('alls', user));
            var ftree;
            if(anode)
                ftree = duplicate_tree_data(anode, friend_from_all);
            else {
                // note: check what this case is really for
                var mine = user === username_; // yes it is possible I'm not my own friend
                ftree = {
                    label: mine ? "My Notebooks" : someone_elses(user),
                    id: node_id('friends', user),
                    sort_order: mine ? ordering.MYFOLDER : ordering.SUBFOLDER
                };
            }
            var parent = $tree_.tree('getNodeById', node_id('friends'));
            var node = insert_alpha(ftree, parent);
            $tree_.tree('loadData', ftree.children, node);
        }
        else {
            var n2 = $tree_.tree('getNodeById', node_id('friends', user));
            $tree_.tree('removeNode', n2);
        }
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

    function populate_comments(comments) {
        try {
            comments = JSON.parse(comments);
        } catch (e) {
            RCloud.UI.session_pane.post_error("populate comments: " + e.message);
            return;
        }
        var is_editable=false;
        d3.select("#comment-count").text(String(comments.length));
        // no update logic, clearing/rebuilding is easier
        d3.select("#comments-container").selectAll("div").remove();
        var comment_div = d3.select("#comments-container")
            .selectAll("div")
            .data(comments)
            .enter()
            .append("div")
            .attr("class", "comment-container")
            .on("mouseover",function(d){
                if(d.user.login===username_) {
                    $('.comment-header-close', this).show();
                }
            })
            .on("mouseout",function(d){
                $('.comment-header-close', this).hide();
            })
            .attr("comment_id",function(d) { return d.id; });
        comment_div
            .append("div")
            .attr("class", "comment-header")
            .style({"max-width":"30%"})
            .text(function(d) { return d.user.login; });

        comment_div
            .append("div")
            .attr("class", "comment-body")
            .style({"max-width":"70%"})
            .append("div")
            .attr("class", "comment-body-text")
            .style({"max-width":"95%","min-width":"5%"})
            .text(function(d) { return d.body; })
            .each(function(d){
                var comment_element = $(this);
                var edit_comment = function(v){
                    var comment_text = comment_element.html();
                    editor.modify_comment(d.id, comment_text);
                };
                var editable_opts = {
                    change: edit_comment,
                    allow_multiline: true,
                    validate: function(name) { return editor.validate_name(name); }
                };
                var is_editable = d.user.login===username_;
                ui_utils.editable(comment_element, $.extend({allow_edit: is_editable,inactive_text: comment_element.text(),active_text: comment_element.text()},editable_opts));
            });
        var text_div = d3.selectAll(".comment-body",this);
        text_div
            .append("i")
            .attr("class", "icon-remove comment-header-close")
            .style({"max-width":"5%"})
            .on("click", function (d) {
                if(d.user.login===username_)
                    editor.delete_comment(d.id).then(function(v){console.log(v);});
            });
        $('#collapse-comments').trigger('size-changed');
        ui_utils.on_next_tick(function() {
            ui_utils.scroll_to_after($("#comments-qux"));
        });
    }

    var icon_style = {'line-height': '90%'};
    function on_create_tree_li(node, $li) {
        var element = $li.find('.jqtree-element'),
            title = element.find('.jqtree-title');
        title.css('color', node.color);
        if(node.gistname && !node.visible)
            title.addClass('private');
        if(node.version || node.id === 'showmore')
            title.addClass('history');
        var right = $($.el.span({'class': 'notebook-right'}));
        if(node.last_commit && (!node.version ||
                                display_date(node.last_commit) != display_date(node.parent.last_commit))) {
            right[0].appendChild($.el.span({'id': 'date',
                                            'class': 'notebook-date'},
                                           display_date(node.last_commit)));
        }
        if(node.gistname && !node.version) {
            if($tree_.tree('isNodeSelected', node))
                RCloud.UI.notebook_title.make_editable(
                    node, !shell.notebook.model.read_only());
            var adder = function(target) {
                var count = 0;
                var lst = [];
                function add(items) {
                    lst.push(document.createTextNode(String.fromCharCode(160)));
                    lst.push.apply(lst, arguments);
                    ++count;
                }
                add.width = function() {
                    return count*15;
                };
                add.commit = function() {
                    target.append.apply(target, lst);
                };
                return add;
            };
            // commands for the right column, always shown
            var always = $($.el.span({'class': 'notebook-commands-right'}));
            var add_buttons = adder(always);
            var star_style = _.extend({'font-size': '80%'}, icon_style);
            var states = {true: {'class': 'icon-star', title: 'unstar'},
                          false: {'class': 'icon-star-empty', title: 'star'}};
            var state = my_stars_[node.gistname] || false;
            var star_unstar = ui_utils.fa_button(states[state]['class'],
                                                 function(e) { return states[state].title; },
                                                 'star',
                                                 star_style,
                                                 true);
            // sigh, ui_utils.twostate_icon should be a mixin or something
            // ... why does this code exist?
            star_unstar.click(function(e) {
                e.preventDefault();
                e.stopPropagation(); // whatever you do, don't let this event percolate
                var new_state = !state;
                result.star_notebook(new_state, {gistname: node.gistname, user: node.user});
            });
            star_unstar[0].set_state = function(val) {
                state = !!val;
                $(this).find('i').attr('class', states[state].class);
            };
            star_unstar[0].appendChild($.el.sub(String(num_stars_[node.gistname] || 0)));
            add_buttons(star_unstar);

            add_buttons.commit();
            right[0].appendChild(always[0]);

            // commands that appear
            var appear = $($.el.span({'class': 'notebook-commands appear'}));
            add_buttons = adder(appear);
            if(true) { // all notebooks have history - should it always be accessible?
                var disable = current_.notebook===node.gistname && current_.version;
                var history = ui_utils.fa_button('icon-time', 'history', 'history', icon_style, true);
                // jqtree recreates large portions of the tree whenever anything changes
                // so far this seems safe but might need revisiting if that improves
                if(disable)
                    history.addClass('button-disabled');
                history.click(function() {
                    fake_hover(node);
                    if(!disable) {
                        result.show_history(node, true);
                    }
                    return false;
                });

                add_buttons(history);
            }
            if(node.user===username_) {
                var make_private = ui_utils.fa_button('icon-eye-close', 'make private', 'private', icon_style, true),
                    make_public = ui_utils.fa_button('icon-eye-open', 'make public', 'public', icon_style, true);
                if(node.visible)
                    make_public.hide();
                else
                    make_private.hide();
                make_private.click(function() {
                    fake_hover(node);
                    if(node.user !== username_)
                        throw new Error("attempt to set visibility on notebook not mine");
                    else
                        result.set_notebook_visibility(node.gistname, false);
                });
                make_public.click(function() {
                    fake_hover(node);
                    if(node.user !== username_)
                        throw new Error("attempt to set visibility on notebook not mine");
                    else
                        result.set_notebook_visibility(node.gistname, true);
                    return false;
                });
                add_buttons(make_private, make_public);
            }
            if(node.user===username_) {
                var remove = ui_utils.fa_button('icon-remove', 'remove', 'remove', icon_style, true);
                remove.click(function(e) {
                   var yn = confirm("Do you want to remove '"+node.full_name+"'?");
                   if (yn) {
                       e.stopPropagation();
                       e.preventDefault();
                       result.remove_notebook(node.user, node.gistname);
                       return false;
                   } else {
                       return false;
                   }
                });
                add_buttons(remove);
            }
            var wid = add_buttons.width()+'px';
            add_buttons.commit();
            appear.css({left: '-'+wid, width: wid});
            appear.hide();
            always[0].appendChild(appear[0]);
            $li.hover(
                function() {
                    $('.notebook-commands.appear', this).show();
                },
                function() {
                    $('.notebook-commands.appear', this).hide();
                });
        }
        element[0].appendChild(right[0]);
    }

    function make_edit_url(opts) {
        opts = opts || {};
        var url = window.location.protocol + '//' + window.location.host + '/edit.html';
        if(opts.notebook) {
            url += '?notebook=' + opts.notebook;
            if(opts.version)
                url = url + '&version='+opts.version;
        }
        else if(opts.new_notebook)
            url += '?new_notebook=true';
        return url;
    }
    function tree_click(event) {
        if(event.node.id === 'showmore')
            result.show_history(event.node.parent, false);
        else if(event.node.gistname) {
            if(event.click_event.metaKey || event.click_event.ctrlKey)
                result.open_notebook(event.node.gistname, event.node.version, true, true);
            else {
                // it's weird that a notebook exists in two trees but only one is selected (#220)
                // just select - and this enables editability
                if(event.node.gistname === current_.notebook &&
                   event.node.version == current_.version) // nulliness ok here
                    select_node(event.node);
                else
                    result.open_notebook(event.node.gistname, event.node.version || null, event.node.root, false);
            }
        }
        else
            $tree_.tree('toggle', event.node);
        return false;
    }
    function tree_open(event) {
        var n = event.node;
        if(n.delay_children)
            load_children(n);
        $('#collapse-notebook-tree').trigger('size-changed');
    }
    function open_last_loadable() {
        return rcloud.config.get_recent_notebooks()
            .then(function(recent) {
                var sorted = _.chain(recent)
                        .pairs()
                        .filter(function(kv) { return kv[0] != 'r_attributes' && kv[0] != 'r_type'; })
                        .map(function(kv) { return [kv[0], Date.parse(kv[1])]; })
                        .sortBy(function(kv) { return kv[1]; })
                        .value();
                // a recursive error handler
                function try_last() {
                    var last = sorted.pop();
                    if(!last)
                        return result.new_notebook();
                    else
                        return result.load_notebook(last[0], null)
                        .catch(function(err) {
                            if(/Not Found/.test(err))
                                rcloud.config.clear_recent_notebook(last);
                            // if loading fails for a reason that is not actually a loading problem
                            // then don't keep trying.
                            if(err.from_load)
                                return try_last();
                            else
                                return Promise.resolve(false);
                        });
                }
                return try_last();
            });
    }

    var result = {
        init: function(opts) {
            var that = this;
            username_ = rcloud.username();
            var promise = load_everything().then(function() {
                if(opts.notebook) { // notebook specified in url
                    return that.load_notebook(opts.notebook, opts.version)
                        .catch(function(xep) {
                            var message = "Could not open notebook " + opts.notebook;
                            if(opts.version)
                                message += "(version " + opts.version + ")";
                            RCloud.UI.fatal_dialog(message, "Continue", make_edit_url());
                            throw xep;
                        });
                } else if(!opts.new_notebook && current_.notebook) {
                    return that.load_notebook(current_.notebook, current_.version)
                        .catch(function(xep) {
                            // if loading fails for a reason that is not actually a loading problem
                            // then don't keep trying.
                            if(xep.from_load)
                                open_last_loadable();
                            else throw xep;
                        });
                }
                else
                    return that.new_notebook();
            });
            $('#new-notebook').click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                if(e.metaKey || e.ctrlKey) {
                    var url = make_edit_url({new_notebook: true});
                    window.open(url, "_blank");
                }
                else
                    that.new_notebook();
            });
            function publish_success(gistname, un) {
                return function(val) {
                    if(!val)
                        console.log("Failed to " + (un ? "un" : "") + "publish notebook " + gistname);
                };
            }
            publish_notebook_checkbox_ = ui_utils.checkbox_menu_item($("#publish-notebook"),
               function() {
                   rcloud.publish_notebook(current_.notebook).then(publish_success(current_.notebook, false));
               },
               function() {
                   rcloud.unpublish_notebook(current_.notebook).then(publish_success(current_.notebook, true));
               });
            var snf = result.star_notebook;
            star_notebook_button_ =
                ui_utils.twostate_icon($("#star-notebook"),
                                       snf.bind(this, true), snf.bind(this, false),
                                       'icon-star', 'icon-star-empty');
            return promise;
        },
        fatal_reload: function(message) {
            var url = make_edit_url({notebook: current_.notebook, version: current_.version});
            message = "<p>Sorry, RCloud's internal state has become inconsistent.  Please reload to return to a working state.</p><p>" + message + "</p>";
            RCloud.UI.fatal_dialog(message, "Reload", url);
        },
        create_book_tree_widget: function(data) {
            var that = this;

            $tree_ = $("#editor-book-tree");
            $tree_.tree({
                data: data,
                onCreateLi: on_create_tree_li,
                selectable: true
            });
            $tree_.bind('tree.click', tree_click);
            $tree_.bind('tree.open', tree_open);
        },
        find_next_copy_name: function(name) {
            return find_next_copy_name(username_, name);
        },
        load_notebook: function(gistname, version, selroot, push_history) {
            var that = this;
            selroot = selroot || true;
            return shell.load_notebook(gistname, version)
                .catch(function(xep) {
                    xep.from_load = true;
                    throw xep;
                })
                .then(this.load_callback({version: version,
                                          selroot: selroot,
                                          push_history: push_history}));
        },
        open_notebook: function(gistname, version, selroot, new_window) {
            // really just load_notebook except possibly in a new window
            if(new_window) {
                var url = make_edit_url({notebook: gistname, version: version});
                window.open(url, "_blank");
            }
            else
                this.load_notebook(gistname, version, selroot);
        },
        new_notebook: function() {
            var that = this;
            return Promise.cast(find_next_copy_name(username_,"Notebook 1"))
                .then(shell.new_notebook.bind(shell))
                .then(function(notebook) {
                    set_visibility(notebook.id, true);
                    that.star_notebook(true, {notebook: notebook, make_current: true, version: null});
                });
        },
        validate_name: function(newname) {
            return newname && !Notebook.empty_for_github(newname); // not null and not empty or just whitespace
        },
        rename_notebook: function(desc) {
            return shell.rename_notebook(desc);
        },
        star_notebook: function(star, opts) {
            var that = this;
            // if opts has user and gistname use those
            // else if opts has notebook, use notebook id & user
            // else use current notebook & user
            opts = opts || {};
            var gistname = opts.gistname ||
                    opts.notebook&&opts.notebook.id ||
                    current_.notebook;
            var user = opts.user ||
                    opts.notebook&&opts.notebook.user&&opts.notebook.user.login ||
                    notebook_info_[gistname].username;
            // keep selected if was
            if(gistname === current_.notebook)
                opts.selroot = opts.selroot || true;
            if(star) {
                return rcloud.stars.star_notebook(gistname).then(function(count) {
                    num_stars_[gistname] = count;
                    var entry = get_notebook_info(gistname);
                    if(!entry.description && !opts.notebook) {
                        console.log("attempt to star notebook we have no record of",
                                    node_id('interests', user, gistname));
                        throw new Error("attempt to star notebook we have no record of",
                                        node_id('interests', user, gistname));
                    }
                    add_interest(user, gistname);
                    if(my_friends_[user]===1)
                        change_folder_friendness(user);

                    if(opts.notebook) {
                        if(opts.make_current)
                            that.load_callback({version: opts.version,
                                                is_change: opts.is_change || false,
                                                selroot: 'interests'}) (opts.notebook);
                        else
                            update_notebook_from_gist(opts.notebook, opts.notebook.history, opts.selroot);
                    }
                    else {
                        update_notebook_view(user, gistname, entry, opts.selroot);
                    }
                });
            } else {
                return rcloud.stars.unstar_notebook(gistname).then(function(count) {
                    num_stars_[gistname] = count;
                    remove_interest(user, gistname);
                    if(!my_friends_[user])
                        change_folder_friendness(user);
                    unstar_notebook_view(user, gistname, opts.selroot);
                });
            }
        },
        remove_notebook: function(user, gistname) {
            var that = this;
            return (!my_stars_[gistname] ? Promise.resolve() :
                    this.star_notebook(false, {user: user, gistname: gistname}))
                .then(function() {
                    remove_notebook_info(user, gistname);
                    remove_notebook_view(user, gistname);
                    var promise = rcloud.config.clear_recent_notebook(gistname);
                    if(gistname === current_.notebook)
                        promise = promise.then(open_last_loadable);
                    return promise;
                });
        },
        set_notebook_visibility: function(gistname, visible) {
            set_visibility(gistname, visible);
            update_notebook_view(username_, gistname, get_notebook_info(gistname), false);
        },
        fork_notebook: function(is_mine, gistname, version) {
            return shell.fork_notebook(is_mine, gistname, version)
                .bind(this)
                .then(function(notebook) {
                    return this.star_notebook(true, {notebook: notebook,
                                                     make_current: true,
                                                     is_change: !!version,
                                                     version: null})
                        .return(notebook.id);
                }).then(function(gistname) {
                    this.set_notebook_visibility(gistname, true);
                });
        },
        revert_notebook: function(is_mine, gistname, version) {
            if(!is_mine)
                return Promise.reject(new Error("attempted to revert notebook not mine"));
            if(!version)
                return Promise.reject(new Error("attempted to revert current version"));
            return shell.revert_notebook(gistname, version)
                .then(this.load_callback({is_change: true, selroot: true}));
        },
        show_history: function(node, toggle) {
            var whither = 'more';
            if(node.children.length) {
                if(!node.is_open) {
                    $tree_.tree('openNode', node);
                    return;
                }
                if(toggle) whither = 'hide';
            }
            add_history_nodes(node, whither, null)
                .then(function(node) {
                    var history_len = 0;
                    if(histories_[node.gistname]) {
                        history_len = histories_[node.gistname].length;
                    }
                    if(history_len==1) {
                        $(".history i",$(node.element)).addClass("button-disabled");
                    }
                    $tree_.tree('openNode', node);
                });
        },
        load_callback: function(opts) {
            var that = this;
            var options = $.extend(
                {version: null,
                 is_change: false,
                 selroot: null,
                 push_history: true}, opts);
            return function(result) {
                current_ = {notebook: result.id, version: options.version};
                rcloud.config.set_current_notebook(current_);
                rcloud.config.set_recent_notebook(result.id, (new Date()).toString());
                RCloud.UI.share_button.set_link(result);

                /*
                // disabling inter-notebook navigation for now - concurrency issues
                options.push_history = false;
                if(options.push_history)
                    (window.location.search ?
                     window.history.pushState :
                     window.history.replaceState)
                    .bind(window.history)
                 */
                var url = make_edit_url({notebook: result.id, version: options.version});
                window.history.replaceState("rcloud.notebook", null, url);
                rcloud.api.set_url(url);

                var history;
                // when loading an old version you get truncated history
                // we don't want that, even if it means an extra fetch
                if(options.version)
                    history = null;
                else
                    history = result.history;

                var stars_promise = (_.has(num_stars_, result.id) ? Promise.resolve(undefined)
                               : rcloud.stars.get_notebook_star_count(result.id).then(function(count) {
                                   num_stars_[result.id] = count;
                               })).then(function() {
                                   update_notebook_from_gist(result, history, options.selroot);
                               });

                var comments_promise = rcloud.get_all_comments(result.id).then(function(data) {
                    populate_comments(data);
                });
                var publish_promise = rcloud.is_notebook_published(result.id).then(function(p) {
                    publish_notebook_checkbox_.set_state(p);
                    publish_notebook_checkbox_.enable(result.user.login === username_);
                });
                return Promise.all([stars_promise, comments_promise, publish_promise]).return(result);
            };
        },
        post_comment: function(comment) {
            comment = JSON.stringify({"body":comment});
            return rcloud.post_comment(current_.notebook, comment)
                .then(function() {
                    return rcloud.get_all_comments(current_.notebook)
                        .then(function(data) {
                            populate_comments(data);
                            $('#comment-entry-body').val('');
                        });
                });
        },
        modify_comment: function (cid,comment) {
            comment = JSON.stringify({
                "body": comment
            });
            return rcloud.modify_comment(current_.notebook,cid, comment).then(function (result) {
                if (!result)
                    return null;
                return rcloud.get_all_comments(current_.notebook).then(function (data) {
                    populate_comments(data);
                    $('#comment-entry-body').val('');
                });
            });
        },
        delete_comment: function (cid) {            
            return rcloud.delete_comment(current_.notebook,cid).then(function (result) {
                if (!result)
                    return null;
                return rcloud.get_all_comments(current_.notebook).then(function (data) {
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
                throw new Error("shouldn't get here");
            }
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
                throw new Error("shouldn't get here");
            }

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
            }
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
            }
            rcloud.search(search_string).then(function(result) {
                update_source_search(result[0]);
                update_history_search(result[1]);
            });
        }
    };
    return result;
}();
