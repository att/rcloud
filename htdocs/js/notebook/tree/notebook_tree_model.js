function notebook_tree_model(username, show_terse_dates) {
    this.username_ = username;
    this.show_terse_dates_ = show_terse_dates;

    this.tree_data_;

    this.histories_ = {}; // cached notebook histories
    this.notebook_info_ = {}; // all notebooks we are aware of
    this.num_stars_ = {}; // number of stars for all known notebooks
    this.fork_count_ = {};
    this.my_stars_ = {}; // set of notebooks starred by me
    this.my_friends_ = {}; // people whose notebooks i've starred
    this.featured_ = []; // featured users - samples, intros, etc
    this.invalid_notebooks_ = {};
    this.current_ = null; // current notebook and version
    this.path_tips_ = false; // debugging tool: show path tips on tree
    this.lazy_load_ = {}; // which users need loading

    this.CONFIG_VERSION = 1;

    this.remove_tree_node = new event(this);
    this.initialise_tree = new event(this);
    this.load_by_user = new event(this);
    this.update_notebook = new event(this);
    this.open_and_select = new event(this);
    this.load_children = new event(this);
}

notebook_tree_model.prototype = function() {

    // major key is adsort_order and minor key is name (label)
    var order = {
        HEADER: 0, // at top (unused)
        NOTEBOOK: 1,
        MYFOLDER: 2,
        SUBFOLDER: 4
    };

    var username = function() {
        return this.username;
    },

    get_current_notebook_histories = function() {
        return this.histories_[current_.notebook];
    },

    get_current_notebook_history_index  = function() {
        return current_.version === null ?
            0 :
            find_index.call(this, get_current_notebook_histories.call(this), function(h) {
                return h.version === current_.version;
            });
    },

    get_history_by_index  = function(index) {
        return this.histories_[current_.notebook][index];
    },

    get_previous  = function() {
        // no version at latest:
        var current_index = current_.version === null ? 0 : get_current_notebook_history_index.call(this);

        if(current_index === get_current_notebook_histories.call(this).length - 1) {
            return undefined;   // already at first
        } else {
            return get_history_by_index.call(this, current_index + 1).version;
        }
    },

    get_next  = function() {
        var current_index = get_current_notebook_history_index.call(this);

        if(current_index === 0) {
            return undefined;
        } else {
            return current_index - 1 === 0 ? null : get_history_by_index.call(this, current_index - 1).version;
        }
    },

    // work around oddities of rserve.js
    each_r_list = function(list, f) {
        for(var key in list)
            if(key!=='r_attributes' && key!=='r_type')
                f(key);
    },

    r_vector = function(value) {
        return _.isArray(value) ? value : [value];
    },

    //  Model functions
    someone_elses = function(name) {
        return name + "'s Notebooks";
    },

    get_notebook_star_count = function(gistname) {
        return this.num_stars_[gistname] || 0;
    },

    set_notebook_star_count = function(gistname, count) {
        this.num_stars_[gistname] = count;
    },

    notebook_star_count_exists = function(notebook_id) {
        return _.has(this.num_stars_, notebook_id);
    },

    is_notebook_starred_by_current_user = function(gistname) {
        return this.my_stars_[gistname] || false;
    },

    get_notebook_info = function(gistname) {
        return this.notebook_info_[gistname] || {};
    },

    set_notebook_info = function(gistname, value) {
        this.notebook_info_[gistname] = value;
    },

    add_interest = function(user, gistname) {
        if(!this.my_stars_[gistname]) {
            this.my_stars_[gistname] = true;
            this.my_friends_[user] = (this.my_friends_[user] || 0) + 1;
        }
    },

    get_my_star_count_by_friend = function(user) {
        return this.my_friends_[user];
    },

    user_is_friend = function(user) {
        return this.my_friends_[user];
    },

    remove_interest = function(user, gistname) {
        if(this.my_stars_[gistname]) {
            delete this.my_stars_[gistname];
            if(--this.my_friends_[user] === 0)
                delete this.my_friends_[user];
        }
    },

    get_notebooks_by_user = function(username) {
        var that = this,
            already_know = _.pick(this.notebook_info_, _.filter(Object.keys(this.notebook_info_), function(id) {
                return that.notebook_info_[id].username === username && !that.notebook_info_[id].recent_only;
            }));

        return rcloud.config.all_user_notebooks(username)
            .then(get_infos_and_counts)
            .then(function(notebooks_stars) {
                // merge these notebooks and stars
                _.extend(that.notebook_info_, notebooks_stars.notebooks);
                _.extend(that.num_stars_, notebooks_stars.num_stars);
                // additionally, merge any notebooks we already knew about back into the list
                _.extend(notebooks_stars.notebooks, already_know);
                return notebooks_stars.notebooks;
            });
    },

    remove_notebook_view = function(user, gistname) {
        var that = this;
        // function do_remove(id) {
        //     var node = that.$tree_.tree('getNodeById', id);
        //     if(node)
        //         remove_node.call(that, node);
        //     else
        //         console.log("tried to remove node that doesn't exist: " + id);
        // }
        if(that.my_friends_[user]){
            this.remove_tree_node.notify({ 
                id: node_id('friends', user, gistname)
            });
        }

        this.remove_tree_node.notify({
            id: node_id('alls', user, gistname)
        });
    },

    populate_users = function(all_the_users) {
        var that = this;
        if(_.isString(all_the_users))
            all_the_users = [all_the_users];
        all_the_users.forEach(function(u) {
            that.lazy_load_[u] = true;
        });
        return {
            label: 'All Notebooks',
            id: '/alls',
            children: _.map(all_the_users, function(u) {
                return lazy_node.call(that, 'alls', u);
            }).sort(compare_nodes)
        };
    },

    populate_friends = function(all_the_users) {
        var that = this;
        return {
            label: 'People I Starred',
            id: '/friends',
            children: all_the_users.filter(function(u) {
                return that.my_friends_[u]>0;
            }).map(function(u) {
                return lazy_node('friends', u);
            }).sort(compare_nodes)
        };
    },

    compare_nodes = function(a, b) {
        var so = a.sort_order-b.sort_order;
        if(so) return so;
        else {
            var alab = a.name || a.label, blab = b.name || b.label;
            // cut trailing numbers and sort separately
            var amatch = RCloud.utils.split_number(alab), bmatch = RCloud.utils.split_number(blab);
            if(amatch && bmatch && amatch[0] == bmatch[0]) {
                var an = +amatch[1], bn = +bmatch[1];
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
    },

    lazy_node = function(root, user) {
        var mine = user === username_;
        var id = node_id(root, user);
        return {
            label: mine ? "My Notebooks" : someone_elses(user),
            id: id,
            sort_order: mine ? order.MYFOLDER : order.SUBFOLDER,
            children: [{ label : 'loading...' }],
            user: user,
            root: root
        };
    },

    populate_interests = function(my_stars_array) {
        var that = this;
        function create_user_book_entry_map(books) {
            var users = {};
            _.each(books,
                   function(book){
                       var entry = that.notebook_info_[book];
                       if(!entry) {
                           that.invalid_notebooks_[book] = null;
                           return users;
                       }
                       if(!entry.username || entry.username === "undefined" ||
                          !entry.description || !entry.last_commit) {
                           that.invalid_notebooks_[book] = entry;
                           return users;
                       }
                       var user = users[entry.username] = users[entry.username] || {};
                       user[book] = entry;
                       return users;
                   });
            return users;
        }

        var interests = create_user_book_entry_map(Object.keys(my_stars_array));
        var user_nodes = [];
        for (var username in interests) {
            var user_notebooks = interests[username];
            for(var gistname in user_notebooks) {
                that.add_interest(username, gistname);
                // sanitize... this shouldn't really happen...
                if(!user_notebooks[gistname].description)
                    user_notebooks[gistname].description = "(no description)";
            }

            var notebook_nodes = convert_notebook_set.call(that, 'interests', username, user_notebooks);
            var id = node_id('interests', username);
            var mine = username === username_;
            var node = {
                label: mine ? "My Notebooks" : this.someone_elses(username),
                id: id,
                sort_order: mine ? order.MYFOLDER : order.SUBFOLDER,
                children: as_folder_hierarchy(notebook_nodes, id).sort(that.compare_nodes)
            };
            user_nodes.push(node);
        }
        return {
            label: 'Notebooks I Starred',
            id: '/interests',
            children: user_nodes.sort(that.compare_nodes)
        };
    },

    as_folder_hierarchy = function(nodes, prefix, name_prefix) {
        function is_in_folder(v) { return v.label.match(/([^/]+)\/(.+)/); }
        var in_folders = nodes;
        var that = this;
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
                user: v[0].user,
                sort_order: order.NOTEBOOK,
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
    },

    convert_notebook_set = function(root, username, set) {
        var that = this;
        var notebook_nodes = [];
        for(var name in set) {
            var attrs = set[name];
            var result = {
                label: attrs.description,
                gistname: name,
                user: username,
                root: root,
                visible: attrs.visible,
                source: attrs.source,
                last_commit: attrs.last_commit ? new Date(attrs.last_commit) : 'none',
                id: node_id(root, username, name),
                sort_order: order.NOTEBOOK,
                fork_desc:attrs.fork_desc
            };
            notebook_nodes.push(result);
        }
        return notebook_nodes;
    },

    node_id = function(root, username, gistname, version) {
        var ret = '';
        for(var i=0; i < arguments.length; ++i)
            ret = ret + '/' + arguments[i];
        return ret;
    },

    load_user_notebooks = function(username) {
        var that = this;
        if(!this.lazy_load_[username])
            return Promise.resolve();

        return get_notebooks_by_user.call(this, username).then(function(notebooks) {
            // load "alls" tree for username, and duplicate to friends tree if needed
            var pid = node_id("alls", username);
            //var root = that.$tree_.tree('getNodeById', pid);

            var notebook_nodes = convert_notebook_set("alls", username, notebooks);
            var alls_data = as_folder_hierarchy(notebook_nodes, pid).sort(that.compare_nodes);
            
            
            delete that.lazy_load_[username];

/*

    // todo: duplicate:::::
            if(that.my_friends_[username]) {
                var ftree = duplicate_tree_data.call(that, root, transpose_notebook('friends'));
                var parent = that.$tree_.tree('getNodeById', node_id('friends', username));
                that.$tree_.tree('loadData', ftree.children, parent);
            }
*/



            that.load_by_user.notify.bind(that, { 
                pid: node_id('alls', username),
                data: [], // TODO: data,
                duplicate: that.my_friends_[username]
            });
        });
    },

    update_notebook/*_model*/ = function(user, gistname, description, time) {
        var that = this;
        return load_user_notebooks.call(this, user).then(function() {
            var entry = that.notebook_info_[gistname] || {};

            entry.username = user;
            entry.description = description;
            entry.last_commit = time;

            add_notebook_info.bind(that, user, gistname, entry);
            return entry; // note: let go of promise
        });
    },

    update_notebook_from_gist = function(result, history, selroot) {
        var user = result.user.login, gistname = result.id;
        var that = this;
        // we only receive history here if we're at HEAD, so use that if we get
        // it.  otherwise use the remembered history if any.  otherwise
        // update_history_nodes will do an async call to get the history.
        if(history)
            that.histories_[gistname] = history;

        return update_notebook/*_model*/.call(this, user, gistname,
                                     result.description,
                                     result.updated_at || result.history[0].committed_at)
            .then(function(entry) {
                return update_notebook_view.call(that, user, gistname, entry, selroot);
            });
    },

    // special case for #1867: skip user level of tree for featured users
    skip_user_level = function(root) {
        return root === 'featured' && featured_.length === 1;
    },

    update_notebook_view = function(user, gistname, entry, selroot) {

        console.log('model update_notebook_view called');

        var that = this;

        function open_and_select(node) {
            this.open_and_select.notify({ 
                isHistorical: this.current_.version,
                node: node,
                id: skip_user_level(node.root) ?
                    node_id(node.root, gistname, current_.version) :
                    node_id(node.root, user, gistname, current_.version),
            });
        }

        var p, i_starred = that.my_stars_[gistname] || false;
        var promises = [];
        if(selroot === true)
            selroot = that.featured_.indexOf(user) >=0 ? 'featured' :
                i_starred ? 'interests' :
                that.my_friends_[user] ? 'friends': 'alls';
        if(i_starred) {
            p = update_tree_entry.call(that, 'interests', user, gistname, entry, true);
            if(selroot==='interests')
                p = p.then(open_and_select);
            promises.push(p);
        }
        if(gistname === current_.notebook) {
            var starn = RCloud.UI.navbar.control('star_notebook');
            if(starn) {
                starn.set_fill(i_starred);
                starn.set_count(that.num_stars_[gistname]);
            }
        }
        if(that.my_friends_[user]) {
            p = update_tree_entry.call(that, 'friends', user, gistname, entry, true);
            if(selroot==='friends')
                p = p.then(open_and_select);
            promises.push(p);
        }
        if(that.featured_.indexOf(user)>=0) {
            p = update_tree_entry.call(that, 'featured', user, gistname, entry, true);
            if(selroot==='featured')
                p = p.then(open_and_select);
            promises.push(p);
        }

        p = update_tree_entry.call(that, 'alls', user, gistname, entry, true);
        if(selroot==='alls')
            p = p.then(open_and_select);
        promises.push(p);
        return Promise.all(promises);
    },

    update_tree = function(root, user, gistname, path, last_chance, create) {

        var that = this;
        if(!root)
            throw new Error("need root");
        if(!user)
            throw new Error("need user");
        if(!gistname)
            throw new Error("need gistname");

        var skip_user = skip_user_level(root); 

        // make sure parents exist
        var parid = skip_user ? node_id(root) : node_id(root, user),
            parent = that.$tree_.tree('getNodeById', parid),
            pdat = null,
            node = null;

        if(!parent) {

            var mine = user === username_; // yes it is possible I'm not my own friend
            parent = that.$tree_.tree('getNodeById', node_id(root));

            if(!parent) {
                throw new Error("root '" + root + "' of notebook tree not found!");
            }

            if(!skip_user) {
                pdat = {
                    label: mine ? "My Notebooks" : someone_elses(user),
                    id: node_id(root, user),
                    sort_order: mine ? order.MYFOLDER : order.SUBFOLDER
                };
                parent = insert_alpha(pdat, parent);
            }
        }

        if(parent.delay_children) {
            delete parent.delay_children;
            that.load_children.notify({ 
                node: parent
            });
        }

        while('children' in path) {
            node = that.$tree_.tree('getNodeById', path.id);
            if(!node) {
                pdat = _.omit(path, 'children');
                node = insert_alpha(pdat, parent);
            }
            parent = node;
            path = path.children[0];
        }

        var data = path;
        var id = skip_user ? node_id(root, gistname) : node_id(root, user, gistname);
        node = that.$tree_.tree('getNodeById', id);

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
                that.$tree_.tree('updateNode', node, data);
            else {
                that.$tree_.tree('removeNode', node);
                node = insert_alpha.call(that, data, parent);
                remove_empty_parents.call(that, dp);
            }
        } else {
            node = insert_alpha.call(that, data, parent);
        }

        return node;
    },

    update_tree_entry = function(root, user, gistname, entry, create) {
        var that = this;
        var data = {user: user,
                    label: entry.description,
                    last_commit: new Date(entry.last_commit),
                    sort_order: 1, // TODO: reinstate: order.NOTEBOOK,
                    source: entry.source,
                    visible: entry.visible};

        // always show the same number of history nodes as before
        var whither = 'hide', where = null;
        var inter_path = as_folder_hierarchy([data], skip_user_level(root) ? node_id(root) : node_id(root, user))[0];
        var node = update_tree.call(that, root, user, gistname, inter_path,
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
        return update_history_nodes.call(this, node, whither, where);
    },

    load_everything = function() {
    
        var that = this;
        return Promise.all([
            rcloud.get_users(),
            get_starred_info.call(that),
            get_recent_info.call(that),
            rcloud.get_gist_sources(),
            rcloud.config.get_user_option('notebook-path-tips')
        ]).spread(function(all_the_users, starred_info, recent_info, gist_sources, path_tips) {
            path_tips_ = path_tips;
            gist_sources_ = gist_sources;
            _.extend(that.notebook_info_, starred_info.notebooks);
            for(var r in recent_info.notebooks) {
                // add a special flag for notebooks that we only know about from recent list
                // we won't show them in the tree until they're opened
                if(!that.notebook_info_[r]) {
                    that.notebook_info_[r] = recent_info.notebooks[r];
                    that.notebook_info_[r].recent_only = true;
                }
            }
            _.extend(that.num_stars_, recent_info.num_stars); // (not currently needed)
            all_the_users = _.union(all_the_users, _.compact(_.pluck(starred_info.notebooks, 'username')));
            var root_data = [];
            var featured_tree;

            return Promise.all([rcloud.config.get_current_notebook(),
                                get_featured()
                                ])
                .spread(function(current, featured_notebooks) {
                    current_ = current;
                    that.num_stars_ = starred_info.num_stars;
                    featured_tree = featured_notebooks;

                })
                .then(function() {

                    var alls_root = populate_users.call(that, all_the_users);

                    return [
                        featured_tree,
                        populate_interests.call(that, starred_info.notebooks),
                        populate_friends.call(that, all_the_users),
                        alls_root
                    ].filter(function(t) { return !!t; });

                });
        })
        .then(function(data) {



            that.initialise_tree.notify({ 
                data: data
            });
        }.bind(that))
        .then(function() {
            for(var book in that.invalid_notebooks_) {
                var entry = that.invalid_notebooks_[book];
                if(!entry)
                    console.log("notebook metadata for " + book + " is missing.");
                else
                    console.log("notebook metadata for " + book + " has invalid entries: " + JSON.stringify(_.pick(entry, "username","description","last_commit","visible","source")));
            }
        })
        .catch(rclient.post_rejection);
    };

    return {
        username: username,
        get_notebooks_by_user: get_notebooks_by_user,
        remove_notebook_view: remove_notebook_view,
        load_everything: load_everything,
        add_interest: add_interest,
        someone_elses: someone_elses,
        get_previous: get_previous,
        get_next: get_next,
        get_notebook_star_count: get_notebook_star_count,
        set_notebook_star_count: set_notebook_star_count,
        notebook_star_count_exists: notebook_star_count_exists,
        is_notebook_starred_by_current_user: is_notebook_starred_by_current_user,
        get_notebook_info: get_notebook_info,
        set_notebook_info: set_notebook_info,
        add_interest: add_interest,
        get_my_star_count_by_friend: get_my_star_count_by_friend,
        user_is_friend: user_is_friend,

        update_notebook_from_gist: update_notebook_from_gist
    };
}();