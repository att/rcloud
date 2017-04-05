var notebook_tree_model = function(username, show_terse_dates) {
    
    "use strict";

    this.username_ = username;
    this.show_terse_dates_ = show_terse_dates;
    this.path_tips_ = false; // debugging tool: show path tips on tree

    this.tree_data_ = [];
    this.histories_ = {}; // cached notebook histories
    this.notebook_info_ = {}; // all notebooks we are aware of
    this.num_stars_ = {}; // number of stars for all known notebooks
    this.fork_count_ = {};
    this.my_stars_ = {}; // set of notebooks starred by me
    this.my_friends_ = {}; // people whose notebooks i've starred
    this.featured_ = []; // featured users - samples, intros, etc
    this.invalid_notebooks_ = {};
    this.current_ = null; // current notebook and version
    this.gist_sources_ = null; // valid gist sources on server
    this.lazy_load_ = {}; // which users need loading

    this.CONFIG_VERSION = 1;

    this.on_initialise_tree = new event(this);
    this.on_load_by_user = new event(this);
    this.on_open_and_select = new event(this);
    this.on_load_children = new event(this);
    this.on_add_node_before = new event(this);
    this.on_append_node = new event(this);
    this.on_update_node = new event(this);
    this.on_remove_node = new event(this);
    this.on_fake_hover = new event(this);
    this.on_select_node = new event(this);
    this.on_load_data = new event(this);
    this.on_show_history = new event(this);
    this.on_open_node = new event(this);
    this.remove_history_nodes = new event(this);

    // major key is adsort_order and minor key is name (label)
    this.order = {
        HEADER: 0, // at top (unused)
        NOTEBOOK: 1,
        MYFOLDER: 2,
        SUBFOLDER: 4
    };
};

notebook_tree_model.prototype = {
        
    username: function() {
        return this.username_;
    },

    show_terse_dates: function(show_terse_dates) {
        if(arguments.length) {
            this.show_terse_dates_ = show_terse_dates;
        } else { 
            return this.show_terse_dates_;
        }
    },

    path_tips: function() {
        return this.path_tips_;
    },

    set_current: function(current) {
        this.current_ = current;
    },

    get_current: function() {
        return this.current_;
    },

    get_current_notebook_histories: function() {
        return this.histories_[this.current_.notebook];
    },

    get_current_notebook_history_index: function() {
        return this.current_.version === null ?
            0 :
            this.find_index(this.get_current_notebook_histories(), function(h) {
                return h.version === this.current_.version;
            });
    },

    get_history_by_index: function(index) {
        return this.histories_[this.current_.notebook][index];
    },

    get_previous: function() {
        // no version at latest:
        var current_index = this.current_.version === null ? 0 : this.get_current_notebook_history_index.call(this);

        if(current_index === this.get_current_notebook_histories(length - 1)) {
            return undefined;   // already at first
        } else {
            return this.get_history_by_index(current_index + 1).version;
        }
    },

    get_next: function(){
        var current_index = this.get_current_notebook_history_index();

        if(current_index === 0) {
            return undefined;
        } else {
            return current_index - 1 === 0 ? null : this.get_history_by_index(current_index - 1).version;
        }
    },

    // work around oddities of rserve.js
    each_r_list: function(list, f) {
        for(var key in list)
            if(key!=='r_attributes' && key!=='r_type')
                f(key);
    },

    r_vector: function(value) {
        return _.isArray(value) ? value : [value];
    },

    //  Model functions
    someone_elses: function(name) {
        return name + "'s Notebooks";
    },

    get_notebook_star_count: function(gistname) {
        return this.num_stars_[gistname] || 0;
    },

    set_notebook_star_count: function(gistname, count) {
        this.num_stars_[gistname] = count;
    },

    notebook_star_count_exists: function(notebook_id) {
        return _.has(this.num_stars_, notebook_id);
    },

    is_notebook_starred_by_current_user: function(gistname) {
        return this.my_stars_[gistname] || false;
    },

    has_notebook_info: function(gistname) {
        return this.notebook_info_[gistname];
    },

    get_notebook_info: function(gistname) {
        return this.notebook_info_[gistname] || {};
    },

    set_notebook_info: function(gistname, value) {
        this.notebook_info_[gistname] = value;
    },

    set_visibility: function(gistname, visible) {
        var entry = this.notebook_info_[gistname] || {};
        entry.visible = visible;
        this.notebook_info_[gistname] = entry;
        return rcloud.set_notebook_visibility(gistname, visible);
    },

    add_interest: function(user, gistname) {
        if(!this.my_stars_[gistname]) {
            this.my_stars_[gistname] = true;
            this.my_friends_[user] = (this.my_friends_[user] || 0) + 1;
        }
    },

    remove_interest: function(user, gistname) {
        if(this.my_stars_[gistname]) {
            delete this.my_stars_[gistname];
            if(--this.my_friends_[user] === 0)
                delete this.my_friends_[user];
        }
    },

    get_my_star_count_by_friend:function(user) {
        return this.my_friends_[user];
    },

    user_is_friend: function(user) {
        return this.my_friends_[user];
    },

    get_notebooks_by_user: function(username) {
        var that = this;
        var already_know = _.pick(that.notebook_info_, _.filter(Object.keys(that.notebook_info_), function(id) {
                return that.notebook_info_[id].username === username && !that.notebook_info_[id].recent_only;
            }));

        return rcloud.config.all_user_notebooks(username)
            .then(that.get_infos_and_counts)
            .then(function(notebooks_stars) {
                // merge these notebooks and stars
                _.extend(that.notebook_info_, notebooks_stars.notebooks);
                _.extend(that.num_stars_, notebooks_stars.num_stars);
                // additionally, merge any notebooks we already knew about back into the list
                _.extend(notebooks_stars.notebooks, already_know);
                return notebooks_stars.notebooks;
            });
    },

    remove_notebook_view: function(user, gistname) {

        var that = this;

        function do_remove(id) {
            //var node = $tree_.tree('getNodeById', id);
            var node = that.get_node_by_id(id);
            if(node) {
                that.remove_node(node);
            } else {
                console.log("tried to remove node that doesn't exist: " + id);
            }
        }

        if(this.my_friends_[user]) {
            do_remove(this.node_id('friends', user, gistname));
        }

        do_remove(this.node_id('alls', user, gistname));
    },

    populate_users: function(all_the_users) {
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
                return that.lazy_node('alls', u);
            }).sort(this.compare_nodes)
        };
    },

    populate_friends: function(all_the_users) {
        var that = this;
        return {
            label: 'People I Starred',
            id: '/friends',
            children: all_the_users.filter(function(u) {
                return that.my_friends_[u]>0;
            }).map(function(u) {
                return that.lazy_node('friends', u);
            }).sort(this.compare_nodes)
        };
    },

    compare_nodes: function(a, b) {
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

    lazy_node: function(root, user) {
        var mine = user === this.username_;
        var id = this.node_id(root, user);
        return {
            label: mine ? "My Notebooks" : this.someone_elses(user),
            id: id,
            sort_order: mine ? this.order.MYFOLDER : this.order.SUBFOLDER,
            children: [{ label : 'loading...' }],
            user: user,
            root: root
        };
    },

    populate_interests: function(my_stars_array) {

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
                this.add_interest(username, gistname);
                // sanitize... this shouldn't really happen...
                if(!user_notebooks[gistname].description)
                    user_notebooks[gistname].description = "(no description)";
            }

            var notebook_nodes = this.convert_notebook_set('interests', username, user_notebooks);
            var id = this.node_id('interests', username);
            var mine = username === this.username_;
            var node = {
                label: mine ? "My Notebooks" : this.someone_elses(username),
                id: id,
                sort_order: mine ? this.order.MYFOLDER : this.order.SUBFOLDER,
                children: this.as_folder_hierarchy(notebook_nodes, id).sort(this.compare_nodes)
            };
            user_nodes.push(node);
        }
        return {
            label: 'Notebooks I Starred',
            id: '/interests',
            children: user_nodes.sort(this.compare_nodes)
        };
    },

    as_folder_hierarchy: function(nodes, prefix, name_prefix) {
        var that = this;
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
                user: v[0].user,
                sort_order: that.order.NOTEBOOK,
                id: id,
                children: that.as_folder_hierarchy(children, id, full_name)
            };
        });
        var outside_folders = _.filter(nodes, function(v) {
            return !is_in_folder(v);
        });
        outside_folders.forEach(function(v) {
            v.full_name = (name_prefix ? name_prefix + '/' : '')  + v.label;
        });
        return outside_folders.concat(in_folders).sort(this.compare_nodes);
    },

    convert_notebook_set: function(root, username, set) {
        var notebook_nodes = [];
        var that = this;
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
                id: that.node_id(root, username, name),
                sort_order: that.order.NOTEBOOK,
                fork_desc:attrs.fork_desc
            };
            notebook_nodes.push(result);
        }
        return notebook_nodes;
    },

    node_id: function(root, username, gistname, version) {
        var ret = '';
        for(var i=0; i < arguments.length; ++i)
            ret = ret + '/' + arguments[i];
        return ret;
    },

    load_user_notebooks: function(username) {
        var that = this;
        if(!that.lazy_load_[username])
            return Promise.resolve();

        return that.get_notebooks_by_user(username).then(function(notebooks) {
            // load "alls" tree for username, and duplicate to friends tree if needed
            var pid = that.node_id("alls", username);
            var root = that.get_node_by_id(pid);

            var notebook_nodes = that.convert_notebook_set("alls", username, notebooks);
            var alls_data = that.as_folder_hierarchy(notebook_nodes, pid).sort(that.compare_nodes);
                        
            delete that.lazy_load_[username];

            // add nodes to the model:
            that.load_tree_data(alls_data, pid);

            var duplicate_data;
            if(that.my_friends_[username]) {
                // update model for friend's notebooks:
                var ftree = that.duplicate_tree_data(root, that.transpose_notebook('friends'));

                // add nodes to the model:
                that.load_tree_data(ftree.children, that.node_id('friends', username));

                // for the view:
                duplicate_data = ftree.children;
            }

            that.on_load_by_user.notify({ 
                pid: that.node_id('alls', username),
                data: alls_data,
                duplicate_data: duplicate_data,
                duplicate_parent_id: that.node_id('friends', username)
            });
        });
    },

    add_notebook_info: function(user, gistname, entry) {
        if(!this.notebook_info_[gistname])
            this.notebook_info_[gistname] = {};
        _.extend(this.notebook_info_[gistname], entry);
        var p = rcloud.set_notebook_info(gistname, entry);
        if(user === this.username())
            p = p.then(function() { rcloud.config.add_notebook(gistname); });
        return p;
    },

    tag_notebook_version: function(id, version, tag) {
        var history = this.histories_[id];
        
        for(var i=0; i<history.length; ++i) {
            if (history[i].version === version) {
                history[i].tag = tag;
            }
            if(history[i].tag === tag && history[i].version != version) {
                history[i].tag = undefined;
            }
        }
    },

    update_notebook/*_model*/: function(user, gistname, description, time) {
        var that = this;
        return that.load_user_notebooks(user).then(function() {
            var entry = that.notebook_info_[gistname] || {};

            entry.username = user;
            entry.description = description;
            entry.last_commit = time;

            that.add_notebook_info(user, gistname, entry);
            return entry; // note: let go of promise
        });
    },

    update_notebook_from_gist: function(result, history, selroot) {
        var user = result.user.login, gistname = result.id;
        var that = this;
        // we only receive history here if we're at HEAD, so use that if we get
        // it.  otherwise use the remembered history if any.  otherwise
        // update_history_nodes will do an async call to get the history.
        if(history)
            that.histories_[gistname] = history;

        return that.update_notebook/*_model*/(user, gistname,
                                     result.description,
                                     result.updated_at || result.history[0].committed_at)
            .then(function(entry) {
                return that.update_notebook_view(user, gistname, entry, selroot);
            });
    },

    // special case for #1867: skip user level of tree for featured users
    skip_user_level: function(root) {
        return root === 'featured' && this.featured_.length === 1;
    },

    update_tree_node: function(node, data) {
        
        _.extend(node, data);

        this.on_update_node.notify({
            node: node,
            data: data
        });
    },

    set_node_open_status: function(node, is_open) {
        var tree_node = this.get_node_by_id(node.id);
        tree_node.is_open = is_open;
    },

    remove_node: function(node) {

        var parent = this.get_parent(node.id);

        this.on_fake_hover.notify({
            node: node
        });

        // remove node from model:
        parent.children = _.without(parent.children, _.findWhere(parent.children, {
            id: node.id
        }));

        this.on_remove_node.notify({
            node: node
        });

        this.remove_empty_parents(parent);

        if(node.root === 'interests' && node.user !== this.username_ && parent.children.length === 0){
            // remove node from model:
            var interests_node = this.get_node_by_id('/interests');
            interests_node.children = _.without(interests_node.children, _.findWhere(interests_node.children, {
                id: parent.id
            }));
            
            // remove from tree:
            this.on_remove_node.notify({
                node: parent
            });

        }
    },

    unstar_notebook_view: function(user, gistname, selroot) {
        var inter_id = this.node_id('interests', user, gistname);
        var node = this.get_node_by_id(inter_id); // that.$tree_.tree('getNodeById', inter_id);
        if(!node) {
            console.log("attempt to unstar notebook we didn't know was starred", inter_id);
            return;
        }
        //this.remove_tree_node(node);
        this.remove_node(node);
        return this.update_notebook_view(user, gistname, this.get_notebook_info(gistname), selroot);
    },

    update_notebook_view: function(user, gistname, entry, selroot) {

        var that = this;

        function open_and_select(node) {
            if(that.current_.version) {
                //$tree_.tree('openNode', node);
                var id = that.skip_user_level(node.root) ?
                        that.node_id(node.root, gistname, that.current_.version) :
                        that.node_id(node.root, user, gistname, that.current_.version);
                //var n2 = $tree_.tree('getNodeById', id);

                var n2 = that.get_node_by_id(id);

                if(!n2)
                    throw new Error('tree node was not created for current history');
                node = n2;
            }
            that.on_select_node.notify({
                node: node
            });
        }

        var p, i_starred = that.my_stars_[gistname] || false;
        var promises = [];

        if(selroot === true)
            selroot = that.featured_.indexOf(user) >=0 ? 'featured' :
                i_starred ? 'interests' :
                that.my_friends_[user] ? 'friends': 'alls';

        if(i_starred) {
            p = that.update_tree_entry('interests', user, gistname, entry, true);
            if(selroot==='interests')
                p = p.then(open_and_select);
            promises.push(p);
        }

        if(gistname === that.current_.notebook) {
            var starn = RCloud.UI.navbar.control('star_notebook');
            if(starn) {
                starn.set_fill(i_starred);
                starn.set_count(that.num_stars_[gistname]);
            }
        }

        if(that.my_friends_[user]) {
            p = that.update_tree_entry('friends', user, gistname, entry, true);
            if(selroot==='friends')
                p = p.then(open_and_select);
            promises.push(p);
        }

        if(that.featured_.indexOf(user)>=0) {
            p = that.update_tree_entry('featured', user, gistname, entry, true);
            if(selroot==='featured')
                p = p.then(open_and_select);
            promises.push(p);
        }

        p = that.update_tree_entry('alls', user, gistname, entry, true);
        if(selroot==='alls')
            p = p.then(open_and_select);
        promises.push(p);

        return Promise.all(promises);
    },

    find_sort_point: function(data, parent) {
        // this could be a binary search but linear is probably fast enough
        // for a single insert, and it also could be out of order
        if(parent.children) {        
            for(var i = 0; i < parent.children.length; ++i) {
                var child = parent.children[i];

                var so = this.compare_nodes(data, child);
                if(so < 0) {
                    return {
                        child: child,
                        position: i
                    };
                }
            }
        }

        return undefined;
    },

    insert_alpha: function(node_to_insert, parent) {

        if(typeof parent === 'string') {
            parent = this.get_node_by_id(parent);
        }

        var before = this.find_sort_point(node_to_insert, parent);

        if(before) {
            // splice children:
            parent.children.splice(before.position, 0, node_to_insert);

            this.on_add_node_before.notify({ 
                node_to_insert: node_to_insert,
                existing_node: before.child
            });

            return node_to_insert;

        } else {
            // add node to model:
            if(!parent.children) {
                parent.children = [];
            }

            parent.children.push(node_to_insert);

            this.on_append_node.notify({
                node_to_insert: node_to_insert,
                parent_id: parent.id
            });
            
            return node_to_insert;
        }
    },

    get_node_by_id: function(id) {

        var found;

        function traverse(o) {
            for (var i in o) {
                if (!!o[i] && typeof(o[i])=="object") {
                    if(o[i].id === id) {
                        found = o[i];
                        break;
                    }
                    traverse(o[i] );
                }
            }
        }  

        traverse(this.tree_data_);
        return found;
    },

    get_parent: function(id) {

        function find_child_by_id(node) {
            return _.find(node.children, function(c) {
                return c.id === id;
            });
        }

        function getObject(theObject, id) {
            var found_parent = null;
            if(theObject instanceof Array) {
                for(var i = 0; i < theObject.length; i++) {
                    found_parent = getObject(theObject[i], id);
                    if (found_parent) {
                        break;
                    }   
                }
            } else {
                for(var prop in theObject) {
                    if(prop === 'id' && theObject.hasOwnProperty('children')) {
                        var child = find_child_by_id(theObject);

                        if(child) 
                            return theObject;
                    }
                    if(theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
                        found_parent = getObject(theObject[prop], id);
                        if (found_parent) {
                            break;
                        }
                    } 
                }
            }
            return found_parent;
        }

        return getObject(this.tree_data_, id);
    },

    load_tree_data: function(data, parent) {
        var parent_node = this.get_node_by_id(parent);
        
        if(parent_node) {
            parent_node.children = data;
        }
    },

    duplicate_tree_data: function(tree, f) {
        console.assert(!tree.user || !this.lazy_load_[tree.user]);
        var t2 = f(tree);
        if(tree.children) {
            var ch2 = [];
            for(var i=0; i<tree.children.length; ++i)
                ch2.push(this.duplicate_tree_data(tree.children[i], f));
            t2.children = ch2;
        }
        return t2;
    },

    transpose_notebook: function(destroot, splice_user) {
        var srcroot = '/alls/';
        if(splice_user)
            srcroot += splice_user + '/';
        return function(datum) {
            //if(datum.delay_children)
            //   load_children(datum);
            var d2 = _.pick(datum, "label", "name", "full_name", "gistname", "user", "visible", "source", "last_commit", "sort_order", "version");
            d2.id = datum.id.replace(srcroot, '/'+destroot+'/');
            d2.root = destroot;
            return d2;
        };
    },

    update_tree: function(root, user, gistname, path, last_chance, create) {

        var that = this;
        if(!root)
            throw new Error("need root");
        if(!user)
            throw new Error("need user");
        if(!gistname)
            throw new Error("need gistname");

        var skip_user = this.skip_user_level(root); 

        // make sure parents exist
        var parid = skip_user ? this.node_id(root) : this.node_id(root, user),
            parent = this.get_node_by_id(parid), //that.$tree_.tree('getNodeById', parid),
            pdat = null,
            node = null;

        if(!parent) {

            var mine = user === this.username_; // yes it is possible I'm not my own friend
            parent = this.get_node_by_id(this.node_id(root)); // that.$tree_.tree('getNodeById', node_id(root));

            if(!parent) {
                throw new Error("root '" + root + "' of notebook tree not found!");
            }

            if(!skip_user) {
                pdat = {
                    label: mine ? "My Notebooks" : this.someone_elses(user),
                    id: this.node_id(root, user),
                    sort_order: mine ? this.order.MYFOLDER : this.order.SUBFOLDER
                };
                parent = this.insert_alpha(pdat, parent);
            }
        }

        if(parent.delay_children) {
            delete parent.delay_children;
            this.on_load_children.notify({ 
                node: parent
            });
        }

        while('children' in path) {
            node = this.get_node_by_id(path.id); // that.$tree_.tree('getNodeById', path.id);
            if(!node) {
                pdat = _.omit(path, 'children');
                node = this.insert_alpha(pdat, parent);
            }
            parent = node;
            path = path.children[0];
        }

        var data = path;
        var id = skip_user ? that.node_id(root, gistname) : that.node_id(root, user, gistname);
        node = that.get_node_by_id(id); // that.$tree_.tree('getNodeById', id);

        if(!node && !create) {
            return null;
        }

        var children;
        data.gistname = gistname;
        data.id = id;
        data.root = root;
        data.user = user;

        if(node) {
            children = node.children;

            if(last_chance) {
                last_chance(node); // hacky
            }

            //var dp = node.parent;
            var dp = this.get_parent(node.id);

            if(dp === parent && node./*name*/label === data.label) {
                this.update_tree_node(node, data);
            } else {
                // remove from model:
                dp.children = _.without(dp.children, _.findWhere(dp.children, {
                    id: node.id
                }));

                this.on_remove_node.notify({
                    node: node
                });

                node = this.insert_alpha(data, parent);

                this.remove_empty_parents(dp);
            }

        } else {
            node = that.insert_alpha(data, parent);
        }

        return node;
    },

    remove_empty_parents: function(dp) {

        if(dp) {
            // remove any empty notebook hierarchy
            while(!dp.children.length && dp.sort_order === this.order.NOTEBOOK) {
                var dp2 = this.get_parent(dp.id);

                // remove from model:
                dp2.children = _.without(dp2.children, _.findWhere(dp2.children, {
                    id: dp.id
                }));

                this.on_remove_node.notify({
                    node: dp,
                    fake_hover: false
                });

                dp = dp2;
            }
        }
    },

    update_tree_entry: function(root, user, gistname, entry, create) {
        var that = this;
        var data = {user: user,
                    label: entry.description,
                    last_commit: new Date(entry.last_commit),
                    sort_order: this.order.NOTEBOOK,
                    source: entry.source,
                    visible: entry.visible};

        // always show the same number of history nodes as before
        var whither = 'hide', where = null;
        var inter_path = that.as_folder_hierarchy([data], 
            that.skip_user_level(root) ? that.node_id(root) : that.node_id(root, user))[0];
        
        var node = that.update_tree(root, user, gistname, inter_path,
                               function(node) {
                                   if(node.children && node.children.length) {
                                       whither = 'index';
                                       where = node.children.length;
                                       if(node.children[where-1].id.startsWith('showmore'))
                                           --where;
                                   }
                               }, create);
        
        if(!node){
            return Promise.resolve(null); // !create
        }

        // if we're looking at an old version, make sure it's shown
        if(gistname === this.current_.notebook && this.current_.version) {
            whither = 'sha';
            where = this.current_.version;
        }

        return this.update_history_nodes(node, whither, where);
    },

     toggle_folder_friendness: function(user) {
         var parent;
        if(this.my_friends_[user]) {
            var anode = this.get_node_by_id(this.node_id('alls', user));
            var ftree;
            if(anode)
                ftree = this.duplicate_tree_data(anode, this.transpose_notebook('friends'));
            else { // this is a first-time load case
                var mine = user === this.username_;
                ftree = {
                    label: mine ? "My Notebooks" : this.someone_elses(user),
                    id: this.node_id('friends', user),
                    sort_order: mine ? this.order.MYFOLDER : this.order.SUBFOLDER
                };
            }
            parent = this.get_node_by_id(this.node_id('friends'));
            var node = this.insert_alpha(ftree, parent);

            this.on_load_data.notify({
                children: ftree.children,
                node: node
            });
        }
        else {
            var n2 = this.get_node_by_id(this.node_id('friends', user));

            // remove this node from the model:
            parent = this.get_parent(n2.id);
            parent.children = _.without(parent.children, _.findWhere(parent.children, {
                id: n2.id
            }));

            this.on_remove_node.notify({
                node: n2
            });
        }
    },

    find_index: function(collection, filter) {
        for (var i = 0; i < collection.length; i++) {
            if(filter(collection[i], i, collection))
                return i;
        }
        return -1;
    },

    find_next_copy_name: function (username, description) {
        var that = this;
        return this.load_user_notebooks(username)
            .then(function() {
                
                // get folder parent or user trunk
                var pid = description.indexOf('/') === -1 ?
                        that.node_id("alls", username) :
                        that.node_id("alls", username, description.replace(/\/[^\/]*$/,''));

                var parent = that.get_node_by_id(pid);// $tree_.tree('getNodeById', pid);

                if(parent === undefined) {
                    return description;
                }

                var map = _.object(_.map(parent.children, function(c) { 
                    return [c.full_name, true]; 
                }));

                if(!map[description]) {
                    return description;
                }

                var match, base, n;

                if((match = RCloud.utils.split_number(description))) {
                    base = match[0];
                    n = +match[1];
                } else {
                    base = description + ' ';
                    n = 1;
                }

                var copy_name;
                do
                    copy_name = base + (++n);
                while(map[copy_name]);

                return copy_name;
            });
    },

    // add_history_nodes
    // whither is 'hide' - erase all, 
    // 'index' - show thru index, 
    // 'sha' - show thru sha, 
    // 'more' - show INCR more
    update_history_nodes: function(node, whither, where) {
        var INCR = 5;
        var debug_colors = false;
        var ellipsis = null;
        var that = this;

        function curr_count() {
            var n = node.children.length;
            return ellipsis ? n-1 : n;
        }

        var show_sha = function(history, sha) {
            var sha_ind = that.find_index(history, function(hist) { 
                return hist.version===sha; 
            });
            
            if(sha_ind < 0) {
                throw new Error("didn't find sha " + where + " in history");
            }

            return sha_ind + INCR - 1; // show this many including curr (?)
        };

        if(!node.children) {
            node.children = [];
        }

        if(node.children && node.children.length && node.children[node.children.length-1].id.startsWith('showmore')) {
            ellipsis = node.children[node.children.length-1];
        }

        function process_history(nshow) {

            function do_color(dat, color) {
                if(debug_colors)
                    dat.color = color;
            }

            function get_date_diff(d1,d2) {
                d1 = new Date(d1);
                d2 = new Date(d2);
                var diff = d1 - d2;
                var min_same = d1.getMinutes() === d2.getMinutes();
                var hour_same = d1.getHours() === d2.getHours();
                var isDateSame = d1.toLocaleDateString() === d2.toLocaleDateString();
                if(diff <= 60*1000 && hour_same && min_same && this.show_terse_dates_)
                    return null;
                else
                    return RCloud.utils.format_date_time_stamp(d1, diff, isDateSame, true, this.show_terse_dates_);
            }

            function display_date_for_entry(i) {
                var hist = history[i];
                var d;
                if(i+1 < history.length) {
                    d = get_date_diff.call(this, hist.committed_at, history[i + 1].committed_at);
                }
                else
                    d = new Date(hist.committed_at);
                return d || 'none';
            }

            function make_hist_node(color, i, force_date) {
                var hist = history[i];
                var hdat = {};
                _.extend(hdat, node);
                delete hdat.children;
                var sha = hist.version.substring(0, 10);
                hdat.committed_at = new Date(hist.committed_at);
                hdat.last_commit = force_date ? hdat.committed_at : display_date_for_entry.call(this, i);
                hdat.label = hist.tag ? hist.tag : sha;
                hdat.version = hist.version;
                hdat.id = node.id + '/' + hdat.version;
                do_color(hdat, color);
                return hdat;
            }

            function update_hist_node(node, i) {
                var hist = history[i];
                var sha = hist.version.substring(0, 10);
                var attrs = {
                    label: hist.tag ? hist.tag : sha
                };

                this.on_update_node.notify({
                    node: node,
                    data: attrs
                });
            }

            var history = that.histories_[node.gistname].slice(1); // first item is current version

            if(!history) {
                return;
            }

            nshow = Math.min(nshow, history.length);

            if(debug_colors) {
                for(var ii = 0, ee = curr_count(); ii<ee; ++ii) {
                    this.on_update_node.notify({
                        node: node.children[i],
                        data: {
                            color: ''
                        }
                    });
                }
            }

            // remove forced date on version above ellipsis, if any
            if(ellipsis) {
                this.on_update_node.notify({
                    node: node.children[node.children.length - 2],
                    data: {
                        last_commit: display_date_for_entry(node.children.length-2)
                    }
                });
            }

            // insert at top
            var nins, 
                insf = null, 
                history_node,
                starting = node.children.length === 0;

            if(!starting) {
                var first = node.children[0];
                nins = that.find_index(history, function(h) { return h.version==first.version; });
                insf = function(dat) {

                    parent.children.splice(nins, 0, dat);

                    this.on_add_node_before.notify({
                        node_to_insert: dat,
                        existing_node: first
                    });
                };
            } else {
                nins = nshow;
                insf = function(dat) {

                    if(!node.children) {
                        node.children = [];
                    }

                    node.children.push(dat);

                    this.on_append_node.notify({
                        node_to_insert: dat,
                        parent_id: node.id
                    });
                };
            }

            for(var i=0; i<nins; ++i){
                history_node = make_hist_node.call(this, 'green', i, starting && i==nins-1);
                insf.call(that, history_node);
            }

            var count = curr_count();

            // updates
            for(i = nins; i<count; ++i){
                update_hist_node.call(that, node.children[i], i);
            }

            // add or trim bottom
            if(count < nshow) { // top up
                if(ellipsis) {
                    insf = function(dat) {
                        node.children.splice(node.children.length - 1, 0, dat);

                        this.on_add_node_before.notify({
                            node_to_insert: dat, 
                            existing_node: ellipsis
                        });
                    };
                } else {
                    insf = function(dat) {

                        if(!node.children) {
                            node.children = [];
                        }

                        node.children.push(dat);

                        this.on_append_node.notify({
                            node_to_insert: dat,
                            parent_id: node.id
                        });
                    };
                }

                for(i=count; i<nshow; ++i) {
                    history_node = make_hist_node('mediumpurple', i, i==nshow-1);
                    insf.call(that, history_node);
                }
            } else if(count > nshow) { // trim any excess
                node.children = node.children.splice(0, nshow);

                this.remove_history_nodes.notify({
                    node: node,
                    from_index: nshow
                });
            }

            // hide or show ellipsis
            if(ellipsis) {
                if(nshow === history.length) {
                    //that.$tree_.tree('removeNode', ellipsis);

                    var parent = this.get_parent(ellipsis.id);

                    parent.children = _.without(parent.children, _.findWhere(parent.children, {
                        id: ellipsis.id
                    }));

                    this.on_remove_node.notify({
                        node: ellipsis
                    });

                    ellipsis = null;
                }
            } else {
                if(nshow < history.length) {
                    var data = {
                        label: '...',
                        id: 'showmore-' + node.id    // unique name
                    };
                    //ellipsis = that.$tree_.tree('appendNode', data, node);

                    node.children.push(data);

                    this.on_append_node.notify({
                        node_to_insert: data,
                        parent_id: node.id
                    });
                }
            }
        }

        var nshow;
        if(whither==='hide') {
            // reset:
            node.children = [];
            this.remove_history_nodes.notify({
               node: node 
            });
            return Promise.resolve(node);
        } else if(whither==='index') {
            nshow = Math.max(where, INCR);
        } else if(whither==='same') {
            nshow = curr_count();
        } else if(whither==='more') {
            nshow = curr_count() + INCR;
        } else if(whither==='sha') {
            if(that.histories_[node.gistname]) {
                nshow = show_sha(that.histories_[node.gistname], where);
            }
        } else {
            throw new Error("update_history_nodes don't understand how to seek '" + whither + "'");
        }

        if(that.histories_[node.gistname]) {
            process_history.call(that, nshow);
            return Promise.resolve(node);
        } else {
            return rcloud.load_notebook(node.gistname, null).then(function(notebook) {
                that.histories_[node.gistname] = notebook.history;

                if(whither === 'sha') {
                    nshow = show_sha(that.histories_[node.gistname], where);
                }

                process_history.call(that, nshow);
                return node;
            }.bind(that));
        }
    },

    get_infos_and_counts: function(ids) {
        return Promise.all([
            rcloud.stars.get_multiple_notebook_star_counts(ids),
            rcloud.get_multiple_notebook_infos(ids)
        ]).spread(function(counts, infos) {
            return {
                notebooks: RCloud.utils.clean_r(infos),
                num_stars: RCloud.utils.clean_r(counts)
            };
        });
    },

    get_starred_info: function() {
        var that = this;
        return rcloud.stars.get_my_starred_notebooks()
            .then(that.get_infos_and_counts);
    },

    get_recent_info: function() {
        var that = this;
        return rcloud.config.get_recent_notebooks()
            .then(function(recents) {
                return that.get_infos_and_counts(Object.keys(recents));
            });
    },

    get_featured: function() {
        var that = this;
        return rcloud.config.get_alluser_option('featured_users').then(function(featured) {
            that.featured_ = featured || [];

            if(_.isString(that.featured_))
                that.featured_ = [that.featured_];

            if(!that.featured_.length)
                return null;

            return that.get_notebooks_by_user(that.featured_[0]).then(function(notebooks) {
                var notebook_nodes = that.convert_notebook_set('featured', that.featured_[0], notebooks).map(function(notebook) {
                    notebook.id = '/featured/' + notebook.gistname;
                    return notebook;
                });

                return {
                    label: 'RCloud Sample Notebooks',
                    id: '/featured',
                    children: that.as_folder_hierarchy(notebook_nodes, that.node_id('featured')).sort(that.compare_nodes)
                };
            });

        });
    },

    update_history: function(tree_node, opts) {

        var that = this;

        if(_.isBoolean(opts)) {
            opts = {
                toggle: opts
            };
        }

        var whither = opts.update ? 'same' : 'more',
            node = that.get_node_by_id(tree_node.id);

        if(node.children && node.children.length) {
            if(!node.is_open) {
                that.on_open_node.notify({
                    node: node
                });

                return Promise.resolve(undefined);
            }

            if(opts.toggle) { 
               whither = 'hide';
            }
        }

        return that.update_history_nodes(node, whither, null)
            .then(function(node) {
                
                var history_len = 0;
                if(that.histories_[node.gistname]) {
                    history_len = that.histories_[node.gistname].length;
                }

                that.on_show_history.notify({
                    node: node,
                    history_len: history_len
                });

                node.is_open = true;
            });
    },

    load_everything: function() {
    
        var that = this;
        return Promise.all([
            rcloud.get_users(),
            that.get_starred_info(),
            that.get_recent_info(),
            rcloud.get_gist_sources(),
            rcloud.config.get_user_option('notebook-path-tips')
        ]).spread(function(all_the_users, starred_info, recent_info, gist_sources, path_tips) {
            that.path_tips_ = path_tips;
            that.gist_sources_ = gist_sources;
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

            var featured_tree;

            return Promise.all([rcloud.config.get_current_notebook(),
                                that.get_featured()
                                ])
                .spread(function(current, featured_notebooks) {
                    that.current_ = current;
                    that.num_stars_ = starred_info.num_stars;
                    featured_tree = featured_notebooks;

                })
                .then(function() {

                    var alls_root = that.populate_users(all_the_users);

                    return [
                        featured_tree,
                        that.populate_interests(starred_info.notebooks),
                        that.populate_friends(all_the_users),
                        alls_root
                    ].filter(function(t) { return !!t; });

                });
        })
        .then(function(data) {

            // initial assignment: 
            this.tree_data_ = data;
            this.on_initialise_tree.notify({ 
                data: data
            });

        }.bind(that))
        .then(function() {
            for(var book in this.invalid_notebooks_) {
                var entry = this.invalid_notebooks_[book];
                if(!entry)
                    console.log("notebook metadata for " + book + " is missing.");
                else
                    console.log("notebook metadata for " + book + " has invalid entries: " + JSON.stringify(_.pick(entry, "username","description","last_commit","visible","source")));
            }
        }.bind(that))
        .catch(rclient.post_rejection);
    }
};
