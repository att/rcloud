function notebook_tree_controller(model, view) {

    "use strict";

    this.model_ = model;
    this.view_ = view;
    this.notebook_open = new event(this);

    // major key is adsort_order and minor key is name (label)
    // order = {
    //     HEADER: 0, // at top (unused)
    //     NOTEBOOK: 1,
    //     MYFOLDER: 2,
    //     SUBFOLDER: 4
    // };
    // this.CONFIG_VERSION = 1;

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
    //this.username_ = null; // cache of rcloud.username() so we're not reading a cookie
    // this.histories_ = {}; // cached notebook histories
    // this.notebook_info_ = {}; // all notebooks we are aware of
    // this.num_stars_ = {}; // number of stars for all known notebooks
    // this.fork_count_ = {};
    // this.my_stars_ = {}; // set of notebooks starred by me
    // this.my_friends_ = {}; // people whose notebooks i've starred
    // this.featured_ = []; // featured users - samples, intros, etc
    // this.invalid_notebooks_ = {};
    // this.current_ = null; // current notebook and version
    // this.path_tips_ = false; // debugging tool: show path tips on tree
    // this.lazy_load_ = {}; // which users need loading

    this.show_terse_dates_ = false;

    // configuration stuff
    // gist_sources_ = null, // valid gist sources on server

    // var get_current_notebook_histories = function() {
    //     return this.histories_[current_.notebook];
    // },

    // get_current_notebook_history_index  = function() {
    //     return current_.version === null ?
    //         0 :
    //         find_index.call(this, get_current_notebook_histories.call(this), function(h) {
    //             return h.version === current_.version;
    //         });
    // },

    // get_history_by_index  = function(index) {
    //     return this.histories_[current_.notebook][index];
    // },

    // get_previous  = function() {
    //     // no version at latest:
    //     var current_index = current_.version === null ? 0 : get_current_notebook_history_index.call(this);

    //     if(current_index === get_current_notebook_histories.call(this).length - 1) {
    //         return undefined;   // already at first
    //     } else {
    //         return get_history_by_index.call(this, current_index + 1).version;
    //     }
    // },}

}

notebook_tree_controller.prototype = {
    
    get_previous: function() {
        return this.model_.get_previous();
    },

    get_next: function() {
        return this.model_.get_next();
    },

    // get_next : function(() {
    //     var current_index = get_current_notebook_history_index.call(this);

    //     if(current_index === 0) {
    //         return undefined;
    //     } else {
    //         return current_index - 1 === 0 ? null : get_history_by_index.call(this, current_index - 1).version;
    //     }
    // },

    // // work around oddities of rserve.js
    // each_r_list: function((list, f) {
    //     for(var key in list)
    //         if(key!=='r_attributes' && key!=='r_type')
    //             f(key);
    // },

    // r_vector: function((value) {
    //     return _.isArray(value) ? value : [value];
    // },

    // //  Model functions
    // someone_elses: function((name) {
    //     return name + "'s Notebooks";
    // },

    // get_notebook_star_count: function((gistname) {
    //     return this.num_stars_[gistname] || 0;
    // },

    get_notebook_star_count: function(gistname) {
        return this.model_.get_notebook_star_count(gistname);
    },

    // set_notebook_star_count: function((gistname, count) {
    //     this.num_stars_[gistname] = count;
    // },

    set_notebook_star_count: function(gistname, count) {
        this.model_.set_notebook_star_count(gistname, count);
    },

    // notebook_star_count_exists: function((notebook_id) {
    //     return _.has(this.num_stars_, notebook_id);
    // },

    notebook_star_count_exists: function(notebook_id) {
        return this.model_.notebook_star_count_exists(notebook_id);
    },

    // is_notebook_starred_by_current_user: function((gistname) {
    //     return this.my_stars_[gistname] || false;
    // },

    is_notebook_starred_by_current_user: function(gistname) {
        return this.model_.is_notebook_starred_by_current_user(gistname);
    },

    // get_notebook_info: function((gistname) {
    //     return this.notebook_info_[gistname] || {};
    // },

    get_notebook_info: function(gistname) {
        return this.model_.get_notebook_info(gistname);
    },

    // set_notebook_info: function((gistname, value) {
    //     this.notebook_info_[gistname] = value;
    // },

    set_notebook_info: function(gistname, value) {
        this.model_.set_notebook_info(gistname, value);
    },

    // add_interest: function((user, gistname) {
    //     if(!this.my_stars_[gistname]) {
    //         this.my_stars_[gistname] = true;
    //         this.my_friends_[user] = (this.my_friends_[user] || 0) + 1;
    //     }
    // },

    add_interest: function(user, gistname) {
        this.model_.add_interest(user, gistname);
    },

    // get_my_star_count_by_friend: function((user) {
    //     return this.my_friends_[user];
    // },

    get_my_star_count_by_friend: function(user) {
        return this.model_.get_my_star_count_by_friend(user);
    },

    // user_is_friend: function((user) {
    //     return this.my_friends_[user];
    // },

    user_is_friend: function(user) {
        return this.model_.user_is_friend(user);
    },

    // remove_interest: function((user, gistname) {
    //     if(this.my_stars_[gistname]) {
    //         delete this.my_stars_[gistname];
    //         if(--this.my_friends_[user] === 0)
    //             delete this.my_friends_[user];
    //     }
    // },

    remove_interest: function(user, gistname) {
        this.model_.remove_interest(user, gistname);
    },

    show_terse_dates: function(show_terse_dates) {
        this.show_terse_dates_ = show_terse_dates;
    },    

    set_visibility: function(gistname, visible) {
        var entry = notebook_info_[gistname] || {};
        entry.visible = visible;
        notebook_info_[gistname] = entry;
        return rcloud.set_notebook_visibility(gistname, visible);
    },

    // add_notebook_info: function(user, gistname, entry) {
    //     if(!notebook_info_[gistname])
    //         notebook_info_[gistname] = {};
    //     _.extend(notebook_info_[gistname], entry);
    //     var p = rcloud.set_notebook_info(gistname, entry);
    //     if(user === model_.username())
    //         p = p.then(function() { rcloud.config.add_notebook(gistname); });
    //     return p;
    // },

    // update_notebook_model: function((user, gistname, description, time) {
    //     var that = this;
    //     return load_user_notebooks.call(this, user).then(function() {
    //         var entry = that.notebook_info_[gistname] || {};

    //         entry.username = user;
    //         entry.description = description;
    //         entry.last_commit = time;

    //         add_notebook_info.bind(that, user, gistname, entry);
    //         return entry; // note: let go of promise
    //     });
    // },

    // View (tree) functions
    node_id: function(root, username, gistname, version) {
        return model_.node_id(root, username, gistname, version);
    },
 
    // way too subtle. shamelessly copying OSX Finder behavior here (because they're right).
    find_next_copy_name: function(username, description) {
        var that = this;
        return load_user_notebooks(username)
            .then(function() {
                // get folder parent or user trunk
                var pid = description.indexOf('/') === -1 ?
                        node_id("alls", username) :
                        node_id("alls", username, description.replace(/\/[^\/]*$/,''));
                var parent = that.$tree_.tree('getNodeById', pid);
                if(parent === undefined)
                    return description;

                var map = _.object(_.map(parent.children, function(c) { return [c.full_name, true]; }));
                if(!map[description])
                    return description;
                var match, base, n;
                if((match = RCloud.utils.split_number(description))) {
                    base = match[0];
                    n = +match[1];
                }
                else {
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

    // as_folder_hierarchy: function((nodes, prefix, name_prefix) {
    //     function is_in_folder(v) { return v.label.match(/([^/]+)\/(.+)/); }
    //     var in_folders = nodes;
    //     var that = this;
    //     // tired of seeing the "method 'match' of undefined" error
    //     if(_.some(in_folders, function(entry) {
    //         return entry.label === undefined || entry.label === null;
    //     }))
    //        throw new Error("incomplete notebook entry (has it been shown yet?)");
    //     in_folders = _.filter(in_folders, is_in_folder);
    //     in_folders = _.map(in_folders, function(v) {
    //         var m = v.label.match(/([^/]+)\/(.+)/);
    //         var r = _.clone(v);
    //         r.folder_name = m[1];
    //         r.label = m[2];
    //         return r;
    //     });
    //     in_folders = _.groupBy(in_folders, function(v) {
    //         return v.folder_name;
    //     });
    //     in_folders = _.map(in_folders, function(v, k) {
    //         var children = _.map(v, function(o) {
    //             return _.omit(o, "folder_name");
    //         });
    //         var id = prefix + '/' + k,
    //             full_name = (name_prefix ? name_prefix + '/' : '')  + k;
    //         return {
    //             label: k,
    //             full_name: full_name,
    //             user: v[0].user,
    //             sort_order: order.NOTEBOOK,
    //             id: id,
    //             children: as_folder_hierarchy(children, id, full_name)
    //         };
    //     });
    //     var outside_folders = _.filter(nodes, function(v) {
    //         return !is_in_folder(v);
    //     });
    //     outside_folders.forEach(function(v) {
    //         v.full_name = (name_prefix ? name_prefix + '/' : '')  + v.label;
    //     });
    //     return outside_folders.concat(in_folders).sort(compare_nodes);
    // },

    // get_infos_and_counts: function((ids) {
    //     return Promise.all([
    //         rcloud.stars.get_multiple_notebook_star_counts(ids),
    //         rcloud.get_multiple_notebook_infos(ids)
    //     ]).spread(function(counts, infos) {
    //         return {
    //             notebooks: RCloud.utils.clean_r(infos),
    //             num_stars: RCloud.utils.clean_r(counts)
    //         };
    //     });
    // },

    // get_starred_info: function(() {
    //     return rcloud.stars.get_my_starred_notebooks()
    //         .then(get_infos_and_counts);
    // },

    // get_recent_info: function(() {
    //     return rcloud.config.get_recent_notebooks()
    //         .then(function(recents) {
    //             return get_infos_and_counts(Object.keys(recents));
    //         });
    // },

    get_notebooks_by_user: function(username) {
            already_know = _.pick(notebook_info_, _.filter(Object.keys(notebook_info_), function(id) {
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

    

    duplicate_tree_data: function(tree, f) {
        console.assert(!tree.user || !lazy_load_[tree.user]);
        var t2 = f(tree);
        if(tree.children) {
            var ch2 = [];
            for(var i=0; i<tree.children.length; ++i)
                ch2.push(duplicate_tree_data.call( tree.children[i], f));
            t2.children = ch2;
        }
        return t2;
    },

    transpose_notebook: function(destroot, splice_user) {
        var srcroot = '/alls/';
        if(splice_user)
            srcroot += splice_user + '/';
        return function(datum) {
            if(datum.delay_children)
                load_children(datum);
            var d2 = _.pick(datum, "label", "name", "full_name", "gistname", "user", "visible", "source", "last_commit", "sort_order", "version");
            d2.id = datum.id.replace(srcroot, '/'+destroot+'/');
            d2.root = destroot;
            return d2;
        };
    },

    create_notebook_root: function(src_trees, root, title, splice_user) {
        var reroot = transpose_notebook(root, splice_user);
        if(splice_user)
            src_trees = src_trees[0].children;
        var subtrees = src_trees.map(function(subtree) {
            return duplicate_tree_data(subtree, reroot);
        });
        return {
            label: title,
            id: '/'+root,
            children: subtrees
        };
    },

    alls_name: function(subtree) {
        return subtree.id.replace("/alls/","");
    },

    // get_featured: function(() {
    //     var that = this;
    //     return rcloud.config.get_alluser_option('featured_users').then(function(featured) {
    //         featured_ = featured || [];

    //         if(_.isString(featured_))
    //             featured_ = [featured_];

    //         if(!featured_.length)
    //             return null;

    //         return get_notebooks_by_user(featured_[0]).then(function(notebooks) {
    //             var notebook_nodes = convert_notebook_set('featured', featured_[0], notebooks).map(function(notebook) {
    //                 notebook.id = '/featured/' + notebook.gistname;
    //                 return notebook;
    //             });

    //             return {
    //                 label: 'RCloud Sample Notebooks',
    //                 id: '/featured',
    //                 children: as_folder_hierarchy(notebook_nodes, node_id('featured')).sort(compare_nodes)
    //             };
    //         });

    //     });
    // },

    // load_children: function((n) {
    //     console.warn('redundant code?');
    //     this.$tree_.tree('loadData', n.delay_children, n);
    //     delete n.delay_children;
    // },

    load_everything: function() {
        return this.model_.load_everything();
    },

    // find_sort_point: function((data, parent) {
    //     // this could be a binary search but linear is probably fast enough
    //     // for a single insert, and it also could be out of order
    //     for(var i = 0; i < parent.children.length; ++i) {
    //         var child = parent.children[i];
    //         var so = compare_nodes.call(this, data, child);
    //         if(so<0)
    //             return child;
    //     }
    //     return 0;
    // },

    // insert_alpha: function((data, parent) {
    //     var before = find_sort_point.call(this, data, parent);
    //     if(before)
    //         return this.$tree_.tree('addNodeBefore', data, before);
    //     else
    //         return this.$tree_.tree('appendNode', data, parent);
    // },

    // remove_empty_parents: function((dp) {
    //     // remove any empty notebook hierarchy
    //     while(dp.children.length===0 && dp.sort_order===order.NOTEBOOK) {
    //         var dp2 = dp.parent;
    //         this.$tree_.tree('removeNode', dp);
    //         dp = dp2;
    //     }
    // },

    // special case for #1867: skip user level of tree for featured users
    skip_user_level: function(root) {
        return root === 'featured' && featured_.length === 1;
    },

    // update_tree: function((root, user, gistname, path, last_chance, create) {
    //     var that = this;
    //     if(!root)
    //         throw new Error("need root");
    //     if(!user)
    //         throw new Error("need user");
    //     if(!gistname)
    //         throw new Error("need gistname");

    //     var skip_user = skip_user_level(root);
    //     // make sure parents exist
    //     var parid = skip_user ? node_id(root) : node_id(root, user),
    //         parent = that.$tree_.tree('getNodeById', parid),
    //         pdat = null,
    //         node = null;
    //     if(!parent) {
    //         var mine = user === username_; // yes it is possible I'm not my own friend
    //         parent = that.$tree_.tree('getNodeById', node_id(root));
    //         if(!parent) {
    //             throw new Error("root '" + root + "' of notebook tree not found!");
    //         }
    //         if(!skip_user) {
    //             pdat = {
    //                 label: mine ? "My Notebooks" : someone_elses(user),
    //                 id: node_id(root, user),
    //                 sort_order: mine ? order.MYFOLDER : order.SUBFOLDER
    //             };
    //             parent = insert_alpha(pdat, parent);
    //         }
    //     }
    //     if(parent.delay_children)
    //         load_children(parent);
    //     while('children' in path) {
    //         node = that.$tree_.tree('getNodeById', path.id);
    //         if(!node) {
    //             pdat = _.omit(path, 'children');
    //             node = insert_alpha(pdat, parent);
    //         }
    //         parent = node;
    //         path = path.children[0];
    //     }
    //     var data = path;
    //     var id = skip_user ? node_id(root, gistname) : node_id(root, user, gistname);
    //     node = that.$tree_.tree('getNodeById', id);
    //     if(!node && !create)
    //         return null;
    //     var children;
    //     data.gistname = gistname;
    //     data.id = id;
    //     data.root = root;
    //     data.user = user;
    //     if(node) {
    //         children = node.children;
    //         if(last_chance)
    //             last_chance(node); // hacky
    //         var dp = node.parent;
    //         if(dp===parent && node.name===data.label)
    //             that.$tree_.tree('updateNode', node, data);
    //         else {
    //             that.$tree_.tree('removeNode', node);
    //             node = insert_alpha.call(that, data, parent);
    //             remove_empty_parents.call(that, dp);
    //         }
    //     }
    //     else
    //         node = insert_alpha.call(that, data, parent);
    //     return node;
    // },

    find_index: function(collection, filter) {
        for (var i = 0; i < collection.length; i++) {
            if(filter(collection[i], i, collection))
                return i;
        }
        return -1;
    },

    // // add_history_nodes
    // // whither is 'hide' - erase all, 'index' - show thru index, 'sha' - show thru sha, 'more' - show INCR more
    // update_history_nodes: function(node, whither, where) {
    //     var INCR = 5;
    //     var debug_colors = false;
    //     var ellipsis = null;
    //     var that = this;
    //     if(node.children.length && node.children[node.children.length-1].id == 'showmore')
    //         ellipsis = node.children[node.children.length-1];
    //     function curr_count() {
    //         var n = node.children.length;
    //         return ellipsis ? n-1 : n;
    //     }
    //     function show_sha(history, sha) {
    //         var sha_ind = find_index(history, function(hist) { return hist.version===sha; });
    //         if(sha_ind<0)
    //             throw new Error("didn't find sha " + where + " in history");
    //         return sha_ind + INCR - 1; // show this many including curr (?)
    //     }

    //     function process_history(nshow) {
    //         function do_color(dat, color) {
    //             if(debug_colors)
    //                 dat.color = color;
    //         }

    //         function get_date_diff(d1,d2) {
    //             var now = new Date();
    //             d1 = new Date(d1);
    //             d2 = new Date(d2);
    //             var diff = d1 - d2;
    //             var min_same = d1.getMinutes() === d2.getMinutes();
    //             var hour_same = d1.getHours() === d2.getHours();
    //             var isDateSame = d1.toLocaleDateString() === d2.toLocaleDateString();
    //             if(diff <= 60*1000 && hour_same && min_same && this.show_terse_dates_)
    //                 return null;
    //             else
    //                 return format_date_time_stamp(d1, diff, isDateSame, true);
    //         }

    //         function display_date_for_entry(i) {
    //             var hist = history[i];
    //             var d;
    //             if(i+1 < history.length) {
    //                 d = get_date_diff(hist.committed_at, history[i + 1].committed_at);
    //             }
    //             else
    //                 d = new Date(hist.committed_at);
    //             return d || 'none';
    //         }
    //         function make_hist_node(color, i, force_date) {
    //             var hist = history[i];
    //             var hdat = _.clone(node);
    //             var sha = hist.version.substring(0, 10);
    //             var d;
    //             hdat.committed_at = new Date(hist.committed_at);
    //             hdat.last_commit = force_date ? hdat.committed_at : display_date_for_entry(i);
    //             hdat.label = (hist.tag?hist.tag:sha);
    //             hdat.version = hist.version;
    //             hdat.id = node.id + '/' + hdat.version;
    //             do_color(hdat, color);
    //             return hdat;
    //         }
    //         function update_hist_node(node, i) {
    //             var hist = history[i];
    //             var sha = hist.version.substring(0, 10);
    //             var attrs = {
    //                 label: (hist.tag?hist.tag:sha)
    //             };
    //             that.$tree_.tree('updateNode', node, attrs);
    //         }
    //         var history = that.histories_[node.gistname].slice(1); // first item is current version
    //         if(!history)
    //             return;
    //         var children = [];
    //         nshow = Math.min(nshow, history.length);

    //         if(debug_colors)
    //             for(var ii = 0, ee = curr_count(); ii<ee; ++ii)
    //                 $tree_.tree('updateNode', node.children[ii], {color: ''});

    //         // remove forced date on version above ellipsis, if any
    //         if(ellipsis) {
    //             that.$tree_.tree('updateNode',
    //                         node.children[node.children.length-2],
    //                         {
    //                             last_commit: display_date_for_entry(node.children.length-2)
    //                         });
    //         }

    //         // insert at top
    //         var nins, insf = null, starting = node.children.length===0;
    //         if(!starting) {
    //             var first = node.children[0];
    //             nins = find_index(history, function(h) { return h.version==first.version; });
    //             insf = function(dat) { return that.$tree_.tree('addNodeBefore', dat, first); };
    //         }
    //         else {
    //             nins = nshow;
    //             insf = function(dat) { return that.$tree_.tree('appendNode', dat, node); };
    //         }
    //         for(var i=0; i<nins; ++i)

    //         var count = curr_count();
    //         // updates
    //         for(i = nins; i<count; ++i)
    //             update_hist_node(node.children[i], i);

    //         // add or trim bottom
    //         if(count < nshow) { // top up
    //             if(ellipsis)
    //                 insf = function(dat) { return that.$tree_.tree('addNodeBefore', dat, ellipsis); };
    //             else
    //                 insf = function(dat) { return that.$tree_.tree('appendNode', dat, node); };
    //             for(i=count; i<nshow; ++i)
    //                 insf(make_hist_node('mediumpurple', i, i==nshow-1));
    //         }
    //         else if(count > nshow) // trim any excess
    //             for(i=count-1; i>=nshow; --i)
    //                 that.$tree_.tree('removeNode', node.children[i]);


    //         // hide or show ellipsis
    //         if(ellipsis) {
    //             if(nshow === history.length) {
    //                 that.$tree_.tree('removeNode', ellipsis);
    //                 ellipsis = null;
    //             }
    //         }
    //         else {
    //             if(nshow < history.length) {
    //                 var data = {
    //                     label: '...',
    //                     id: 'showmore'
    //                 };
    //                 ellipsis = that.$tree_.tree('appendNode', data, node);
    //             }
    //         }
    //     }
    //     var nshow;
    //     if(whither==='hide') {
    //         for(var i = node.children.length-1; i >= 0; --i)
    //             that.$tree_.tree('removeNode', node.children[i]);
    //         return Promise.resolve(node);
    //     }
    //     else if(whither==='index')
    //         nshow = Math.max(where, INCR);
    //     else if(whither==='same')
    //         nshow = curr_count();
    //     else if(whither==='more')
    //         nshow = curr_count() + INCR;
    //     else if(whither==='sha') {
    //         if(that.histories_[node.gistname])
    //             nshow = show_sha(that.histories_[node.gistname], where);
    //     }
    //     else throw new Error("update_history_nodes don't understand how to seek '" + whither + "'");

    //     if(that.histories_[node.gistname]) {
    //         process_history(nshow);
    //         return Promise.resolve(node);
    //     }
    //     else
    //         return rcloud.load_notebook(node.gistname, null).then(function(notebook) {
    //             that.histories_[node.gistname] = notebook.history;
    //             if(whither==='sha')
    //                 nshow = show_sha(that.histories_[node.gistname], where);
    //             process_history(nshow);
    //             return node;
    //     });
    // },

    // scroll_into_view = function(node) {
    //     var p = node.parent;
    //     while(p.sort_order===order.NOTEBOOK) {
    //         this.$tree_.tree('openNode', p);
    //         p = p.parent;
    //     }
    //     ui_utils.scroll_into_view(this.$tree_.parent(), 50, 100, null, $(node.element));
    // },

    // highlight_node = function(node) {
    //     var that = this;
    //     return function() {
    //         return new Promise(function(resolve) {
    //             var p = node.parent;
    //             while(p.sort_order===order.NOTEBOOK) {
    //                 that.$tree_.tree('openNode', p);
    //                 p = p.parent;
    //             }
    //             ui_utils.scroll_into_view(that.$tree_.parent(), 150, 150, function() {
    //                 $(node.element).closest('.jqtree_common').effect('highlight', { color: '#fd0' }, 1500, function() {
    //                     resolve();
    //                 });
    //             }, $(node.element));
    //         });
    //     };
    // }, 

    highlight_notebooks: function(notebooks) {
        this.view_.highlight_notebooks(notebooks);

        // var that = this;

        // var nodes = _.map(_.isArray(notebooks) ? notebooks : [notebooks], function(notebook) {
        //     return that.$tree_.tree('getNodeById', node_id('interests', username_, notebook.id));
        // });

        // // get promises:
        // nodes.map(function(node) {
        //     return highlight_node(node);
        // }).reduce(function(cur, next) {
        //     return cur.then(next);
        // }, Promise.resolve()).then(function() {});
    },

    // select_node = function(node) {
    //     this.$tree_.tree('selectNode', node);
    //     scroll_into_view.call(this, node);
    //     if(node.user === username_)
    //         RCloud.UI.notebook_title.make_editable(node, node.element, true);
    //     else
    //         RCloud.UI.notebook_title.make_editable(null);
    // },

    select_history_node: function(node) {
        this.select_node(node);
        $(node.element).find('.jqtree-element:eq(0)').trigger('click');
    },

    // update_tree_entry = function(root, user, gistname, entry, create) {
    //     var that = this;
    //     var data = {user: user,
    //                 label: entry.description,
    //                 last_commit: new Date(entry.last_commit),
    //                 sort_order: 1, // TODO: reinstate: order.NOTEBOOK,
    //                 source: entry.source,
    //                 visible: entry.visible};

    //     // always show the same number of history nodes as before
    //     var whither = 'hide', where = null;
    //     var inter_path = as_folder_hierarchy([data], skip_user_level(root) ? node_id(root) : node_id(root, user))[0];
    //     var node = update_tree.call(that, root, user, gistname, inter_path,
    //                            function(node) {
    //                                if(node.children.length) {
    //                                    whither = 'index';
    //                                    where = node.children.length;
    //                                    if(node.children[where-1].id==='showmore')
    //                                        --where;
    //                                }
    //                            }, create);
    //     if(!node)
    //         return Promise.resolve(null); // !create

    //     // if we're looking at an old version, make sure it's shown
    //     if(gistname===current_.notebook && current_.version) {
    //         whither = 'sha';
    //         where = current_.version;
    //     }
    //     return update_history_nodes.call(this, node, whither, where);
    // },
    
    update_notebook_view: function(user, gistname, entry, selroot) {
        this.model_.update_notebook_view(user, gistname, entry, selroot);
    },

    // update_notebook_view = function(user, gistname, entry, selroot) {

    //     console.log('controller update_notebook_view called');

    //     var that = this;
    //     function open_and_select(node) {
    //         if(current_.version) {
    //             that.$tree_.tree('openNode', node);
    //             var id = skip_user_level(node.root) ?
    //                     node_id(node.root, gistname, current_.version) :
    //                     node_id(node.root, user, gistname, current_.version);
    //             var n2 = that.$tree_.tree('getNodeById', id);
    //             if(!n2)
    //                 throw new Error('tree node was not created for current history');
    //             node = n2;
    //         }
    //         select_node.call(that, node);
    //     }
    //     var p, i_starred = that.my_stars_[gistname] || false;
    //     var promises = [];
    //     if(selroot === true)
    //         selroot = that.featured_.indexOf(user) >=0 ? 'featured' :
    //             i_starred ? 'interests' :
    //             that.my_friends_[user] ? 'friends': 'alls';
    //     if(i_starred) {
    //         p = update_tree_entry.call(that, 'interests', user, gistname, entry, true);
    //         if(selroot==='interests')
    //             p = p.then(open_and_select);
    //         promises.push(p);
    //     }
    //     if(gistname === current_.notebook) {
    //         var starn = RCloud.UI.navbar.control('star_notebook');
    //         if(starn) {
    //             starn.set_fill(i_starred);
    //             starn.set_count(that.num_stars_[gistname]);
    //         }
    //     }
    //     if(that.my_friends_[user]) {
    //         p = update_tree_entry.call(that, 'friends', user, gistname, entry, true);
    //         if(selroot==='friends')
    //             p = p.then(open_and_select);
    //         promises.push(p);
    //     }
    //     if(that.featured_.indexOf(user)>=0) {
    //         p = update_tree_entry.call(that, 'featured', user, gistname, entry, true);
    //         if(selroot==='featured')
    //             p = p.then(open_and_select);
    //         promises.push(p);
    //     }

    //     p = update_tree_entry.call(that, 'alls', user, gistname, entry, true);
    //     if(selroot==='alls')
    //         p = p.then(open_and_select);
    //     promises.push(p);
    //     return Promise.all(promises);
    // },

    // remove_node = function(node) {
    //     var parent = node.parent;
    //     ui_utils.fake_hover(node);
    //     this.$tree_.tree('removeNode', node);
    //     remove_empty_parents(parent);
    //     if(node.root === 'interests' && node.user !== username_ && parent.children.length === 0)
    //         this.$tree_.tree('removeNode', parent);
    // },

    // remove_notebook_view = function(user, gistname) {
    //     var that = this;
    //     function do_remove(id) {
    //         var node = that.$tree_.tree('getNodeById', id);
    //         if(node)
    //             remove_node.call(that, node);
    //         else
    //             console.log("tried to remove node that doesn't exist: " + id);
    //     }
    //     if(that.my_friends_[user])
    //         do_remove(node_id('friends', user, gistname));

    //     do_remove(node_id('alls', user, gistname));
    // },

    remove_notebook_view: function(user, gistname) {
        
    },

    unstar_notebook_view: function(user, gistname, selroot) {
        var that = this;
        var inter_id = node_id('interests', user, gistname);
        var node = that.$tree_.tree('getNodeById', inter_id);
        if(!node) {
            console.log("attempt to unstar notebook we didn't know was starred", inter_id);
            return;
        }
        remove_node.call(that, node);
        update_notebook_view.call(that, user, gistname, get_notebook_info.call(that, gistname), selroot);
    },

    update_notebook_from_gist: function(result, history, selroot) {

        return this.model_.update_notebook_from_gist(result, history, selroot);

        // var user = result.user.login, gistname = result.id;
        // var that = this;
        // // we only receive history here if we're at HEAD, so use that if we get
        // // it.  otherwise use the remembered history if any.  otherwise
        // // update_history_nodes will do an async call to get the history.
        // if(history)
        //     that.histories_[gistname] = history;

        // return update_notebook_model.call(this, user, gistname,
        //                              result.description,
        //                              result.updated_at || result.history[0].committed_at)
        //     .then(function(entry) {
        //         return update_notebook_view.call(that, user, gistname, entry, selroot);
        //     });
    },

    toggle_folder_friendness: function(user) {
        var that = this;
        if(that.my_friends_[user]) {
            var anode = that.$tree_.tree('getNodeById', node_id('alls', user));
            var ftree;
            if(anode)
                ftree = duplicate_tree_data(anode, transpose_notebook('friends'));
            else { // this is a first-time load case
                var mine = user === username_;
                ftree = {
                    label: mine ? "My Notebooks" : someone_elses(user),
                    id: node_id('friends', user),
                    sort_order: mine ? order.MYFOLDER : order.SUBFOLDER
                };
            }
            var parent = that.$tree_.tree('getNodeById', node_id('friends'));
            var node = insert_alpha(ftree, parent);
            that.$tree_.tree('loadData', ftree.children, node);
        }
        else {
            var n2 = that.$tree_.tree('getNodeById', node_id('friends', user));
            that.$tree_.tree('removeNode', n2);
        }
    },

    // format_date_time_stamp = function(date, diff, isDateSame, for_version) {
    //     function pad(n) { return n<10 ? '0'+n : n; }
    //     var now = new Date();
    //     var time_part = '<span class="notebook-time">' + date.getHours() + ':' + pad(date.getMinutes()) + '</span>';
    //     var date_part = (date.getMonth()+1) + '/' + date.getDate();
    //     var year_part = date.getFullYear().toString().substr(2,2);
    //     if(diff < 24*60*60*1000 && isDateSame && this.show_terse_dates_ && for_version)
    //         return time_part;
    //     else if(date.getFullYear() === now.getFullYear())
    //         return '<span>' + date_part + ' ' + time_part + '</span>';
    //     else
    //         return '<span>' + date_part + '/' + year_part + ' ' + time_part + '</span>';
    // },

    // display_date_html = function(ds) {
    //     if(ds==='none')
    //         return '';
    //     if(typeof ds==='string')
    //         return ds;
    //     var date = new Date(ds);
    //     var now = new Date();
    //     var diff = now - date;
    //     return format_date_time_stamp(date, diff, true, false);
    // },

    // display_date = function(ds) {
    //     // return an element
    //     return $(display_date_html(ds))[0];
    // },

    // on_create_tree_li = function(node, $li) {
    //     $li.css("min-height","15px");
    //     var element = $li.find('.jqtree-element'),
    //         title = element.find('.jqtree-title');
    //     title.css('color', node.color);

    //     if(path_tips_)
    //         element.attr('title', node.id);

    //     if(node.gistname) {
    //         if(node.source)
    //             title.addClass('foreign-notebook');
    //         else if(!node.visible)
    //             title.addClass('hidden-notebook');
    //     }
    //     if(node.version || node.id === 'showmore')
    //         title.addClass('history');
    //     var date;
    //     if(node.last_commit) {
    //         date = $.el.span({'class': 'notebook-date'},
    //                                display_date(node.last_commit));
    //     }
    //     var right = $.el.span({'class': 'notebook-right'}, date);
    //     // if it was editable before, we need to restore that - either selected or open folder tree node
    //     if(node.user === username_ && (this.$tree_.tree('isNodeSelected', node) ||
    //                                    !node.gistname && node.full_name && node.is_open)){
    //         RCloud.UI.notebook_title.make_editable(node, $li, true);
    //     }   
    //     RCloud.UI.notebook_commands.decorate($li, node, right);
    //     element.append(right);
    // },

    // tree_click = function(event) {

    //     if(event.node.id === 'showmore')
    //         this.show_history(event.node.parent, false);
    //     else if(event.node.gistname) {
    //         if(event.click_event.metaKey || event.click_event.ctrlKey)
    //             this.notebook_open.notify({ 
    //                 // gistname, version, source, selroot, new_window
    //                 gistname: event.node.gistname, 
    //                 version: event.node.version,
    //                 source: event.node.source, 
    //                 selroot: true,
    //                 new_window: true
    //             });
    //             //this.open_notebook(event.node.gistname, event.node.version, event.node.source, true, true);
    //         else {
    //             // it's weird that a notebook exists in two trees but only one is selected (#220)
    //             // just select - and this enables editability
    //             /*jshint eqnull:true */
    //             if(event.node.gistname === current_.notebook &&
    //                 event.node.version == current_.version && event.node.version == null) // deliberately null-vague here
    //                 this.select_node(event.node).bind(this);
    //             else
    //                 this.notebook_open.notify({ 
    //                     // gistname, version, source, selroot, new_window
    //                     gistname: event.node.gistname, 
    //                     version: event.node.version || null,
    //                     source: event.node.source, 
    //                     selroot: event.node.root,
    //                     new_window: false
    //                 });

    //                 //this.open_notebook(event.node.gistname, event.node.version || null, event.node.source, event.node.root, false);
    //             /*jshint eqnull:false */
    //         }
    //     }
    //     else {
    //         if(!event.node.is_open) {
    //             $tree_.tree('openNode', event.node);
    //             ui_utils.fake_hover(event.node);
    //         }
    //     }
    //     return false;
    // },

    // reselect_node = function(f) {
    //     var selected_node = $tree_.tree('getSelectedNode');
    //     var that = this;
    //     return f().then(function() {
    //         var node_to_select = $tree_.tree('getNodeById', selected_node.id);

    //         if(node_to_select)
    //             select_node(node_to_select);
    //         else console.log('sorry, neglected to highlight ' + selected_node.id);
    //     });
    // },

    // tree_open = function(event) {
    //     var n = event.node;

    //     // notebook folder name only editable when open
    //     if(n.full_name && n.user === username_ && !n.gistname)
    //         RCloud.UI.notebook_title.make_editable(n, n.element, true);
    //     $('#collapse-notebook-tree').trigger('size-changed');

    //     if(n.user && this.lazy_load_[n.user])
    //         load_user_notebooks(n.user);
    // },

    // tree_close = function(event) {
    //     var n = event.node;
    //     // notebook folder name only editable when open
    //     if(n.full_name && !n.gistname)
    //         RCloud.UI.notebook_title.make_editable(n, n.element, false);
    // },

    show_history: function(node, opts) {
        this.view_.show_history(node, opts);
    }

    // show_history = function(node, opts) {
    //     var that = this;
    //     if(_.isBoolean(opts))
    //         opts = {toggle: opts};
    //     var whither = opts.update ? 'same' : 'more';
    //     if(node.children.length) {
    //         if(!node.is_open) {
    //             $tree_.tree('openNode', node);
    //             return Promise.resolve(undefined);
    //         }
    //         if(opts.toggle) whither = 'hide';
    //     }
    //     return update_history_nodes.call(that, node, whither, null)
    //         .then(function(node) {
    //             var history_len = 0;
    //             if(that.histories_[node.gistname]) {
    //                 history_len = that.histories_[node.gistname].length;
    //             }
    //             if(history_len==1) { // FIXME: should be via UI.notebook_commands
    //                 $(".history i",$(node.element)).addClass("button-disabled");
    //             }
    //             that.$tree_.tree('openNode', node);
    //         });
    // } 
 
};
