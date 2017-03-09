function notebook_tree_view(model) {
    this.model_ = model;

    var that = this;

    this.$tree_ = null;

    // attach model listeners
    this.model_.remove_tree_node.attach(function(sender, args) {
        var node = this.$tree_.tree('getNodeById', args.id);
        if(node) {
            this.remove_node.call(that, node);
        } else {
            console.log("tried to remove node that doesn't exist: " + args.id);
        }
    });

    this.model_.initialise_tree.attach(function(sender, args) {
        var that = this;

        var start_widget_time = window.performance ? window.performance.now() : 0;
        that.$tree_ = $("#editor-book-tree");
        that.$tree_.tree({
            data: args.data,
            onCreateLi: on_create_tree_li.bind(this),
            selectable: true,
            useContextMenu: false,
            keyboardSupport: false
        });

        that.$tree_.bind('tree.click', tree_click.bind(this));
        that.$tree_.bind('tree.open', tree_open.bind(this));
        that.$tree_.bind('tree.close', tree_close.bind(this));

        if(start_widget_time)
            console.log('load tree took ' + (window.performance.now() - start_widget_time));

        var interests = this.$tree_.tree('getNodeById', "/interests");
        this.$tree_.tree('openNode', interests);
    });

    this.model_.update_notebook.attach(function(sender, args) {

    });

    this.model_.load_by_user.attach(function(sender, args) {
        
        var root = this.$tree_.tree('getNodeById', args.pid);
        that.$tree_.tree('loadData', args.data, root);

/*
        // TODO: duplicate logic, though I think it should be in the model, and the
        // duplciated data should be passed in:

        if(args.duplicate) {
            var ftree = duplicate_tree_data.call(that, root, transpose_notebook('friends'));
            var parent = that.$tree_.tree('getNodeById', node_id('friends', username));
            that.$tree_.tree('loadData', ftree.children, parent);
        }
*/
    });

    this.model_.open_and_select.attach(function(sender, args) {
        var node = args.node;
        if(args.isHistorical) {
            that.$tree_.tree('openNode', args.node);
            var n2 = that.$tree_.tree('getNodeById', id);

            if(!n2)
                throw new Error('tree node was not created for current history');
                    
            node = n2;
        }

        select_node(node);
    });

    this.model_.load_children.attach(function(sender, args) {
        console.warn('redundant code?');
        this.$tree_.tree('loadData', n.delay_children, n);
    });

    this.model_.add_node_before.attach(function(sender, args) {
        var that = this;
        that.$tree_.tree('addNodeBefore', args.node_to_insert, args.parent); 
    });

    this.model_.append_node.attach(function(sender, args) {
        var that = this;
        that.$tree_.tree('appendNode', args.node_to_insert, args.parent);
    });
}

notebook_tree_view.prototype = function() {

    var getView = function() {
        var _this = this; 
        var getThis = function() {
            return _this;
        }
        return getThis();
    };

    // this.model_.initialise_tree.attach(function(sender, args) {
    //     var start_widget_time = window.performance ? window.performance.now() : 0;
    //     that.$tree_ = $("#editor-book-tree");
    //     that.$tree_.tree({
    //         data: args.data,
    //         onCreateLi: on_create_tree_li.bind(this),
    //         selectable: true,
    //         useContextMenu: false,
    //         keyboardSupport: false
    //     });

    //     that.$tree_.bind('tree.click', tree_click.bind(this));
    //     that.$tree_.bind('tree.open', tree_open.bind(this));
    //     that.$tree_.bind('tree.close', tree_close.bind(this));

    //     if(start_widget_time)
    //         console.log('load tree took ' + (window.performance.now() - start_widget_time));

    //     var interests = this.$tree_.tree('getNodeById', "/interests");
    //     that.$tree_.tree('openNode', interests);
    // });

    // var load_tree = function(root_data) {
    //     create_book_tree_widget.call(this, root_data);
    //     var interests = this.$tree_.tree('getNodeById', "/interests");
    //     this.$tree_.tree('openNode', interests);
    // },
    
    // create_book_tree_widget = function(data) {
    //     var that = this;

    //     var start_widget_time = window.performance ? window.performance.now() : 0;
    //     that.$tree_ = $("#editor-book-tree");
    //     that.$tree_.tree({
    //         data: data,
    //         onCreateLi: on_create_tree_li.bind(this),
    //         selectable: true,
    //         useContextMenu: false,
    //         keyboardSupport: false
    //     });

    //     that.$tree_.bind('tree.click', tree_click.bind(this));
    //     that.$tree_.bind('tree.open', tree_open.bind(this));
    //     that.$tree_.bind('tree.close', tree_close.bind(this));

    //     if(start_widget_time)
    //         console.log('load tree took ' + (window.performance.now() - start_widget_time));
    // },
    
    var tree_click = function(event) {

        if(event.node.id === 'showmore')
            this.show_history(event.node.parent, false);
        else if(event.node.gistname) {
            if(event.click_event.metaKey || event.click_event.ctrlKey)
                this.notebook_open.notify({ 
                    // gistname, version, source, selroot, new_window
                    gistname: event.node.gistname, 
                    version: event.node.version,
                    source: event.node.source, 
                    selroot: true,
                    new_window: true
                });
            else {
                // it's weird that a notebook exists in two trees but only one is selected (#220)
                // just select - and this enables editability
                /*jshint eqnull:true */
                if(event.node.gistname === current_.notebook &&
                    event.node.version == current_.version && event.node.version == null) // deliberately null-vague here
                    this.select_node(event.node).bind(this);
                else
                    this.notebook_open.notify({ 
                        // gistname, version, source, selroot, new_window
                        gistname: event.node.gistname, 
                        version: event.node.version || null,
                        source: event.node.source, 
                        selroot: event.node.root,
                        new_window: false
                    });
                /*jshint eqnull:false */
            }
        }
        else {
            if(!event.node.is_open) {
                $tree_.tree('openNode', event.node);
                ui_utils.fake_hover(event.node);
            }
        }
        return false;
    },

    select_node = function(node) {
        this.$tree_.tree('selectNode', node);
        scroll_into_view.call(this, node);
        if(node.user === username_)
            RCloud.UI.notebook_title.make_editable(node, node.element, true);
        else
            RCloud.UI.notebook_title.make_editable(null);
    },

    scroll_into_view = function(node) {
        var p = node.parent;
        while(p.sort_order===order.NOTEBOOK) {
            this.$tree_.tree('openNode', p);
            p = p.parent;
        }
        ui_utils.scroll_into_view(this.$tree_.parent(), 50, 100, null, $(node.element));
    },

    remove_node = function(node) {
        var parent = node.parent;
        ui_utils.fake_hover(node);
        this.$tree_.tree('removeNode', node);
        remove_empty_parents(parent);
        if(node.root === 'interests' && node.user !== username_ && parent.children.length === 0)
            this.$tree_.tree('removeNode', parent);
    },

    remove_empty_parents = function(dp) {
        // remove any empty notebook hierarchy
        while(dp.children.length===0 && dp.sort_order===order.NOTEBOOK) {
            var dp2 = dp.parent;
            this.$tree_.tree('removeNode', dp);
            dp = dp2;
        }
    },

    reselect_node = function(f) {
        var selected_node = $tree_.tree('getSelectedNode');
        var that = this;
        return f().then(function() {
            var node_to_select = $tree_.tree('getNodeById', selected_node.id);

            if(node_to_select)
                select_node(node_to_select);
            else console.log('sorry, neglected to highlight ' + selected_node.id);
        });
    },

    tree_open = function(event) {
        var n = event.node;

        // notebook folder name only editable when open
        if(n.full_name && n.user === username_ && !n.gistname)
            RCloud.UI.notebook_title.make_editable(n, n.element, true);
        $('#collapse-notebook-tree').trigger('size-changed');

        if(n.user && this.lazy_load_[n.user])
            load_user_notebooks(n.user);
    },

    tree_close = function(event) {
        var n = event.node;
        // notebook folder name only editable when open
        if(n.full_name && !n.gistname)
            RCloud.UI.notebook_title.make_editable(n, n.element, false);
    },

    show_history = function(node, opts) {
        var that = this;
        if(_.isBoolean(opts))
            opts = {toggle: opts};
        var whither = opts.update ? 'same' : 'more';
        if(node.children.length) {
            if(!node.is_open) {
                $tree_.tree('openNode', node);
                return Promise.resolve(undefined);
            }
            if(opts.toggle) whither = 'hide';
        }
        return update_history_nodes.call(that, node, whither, null)
            .then(function(node) {
                var history_len = 0;
                if(that.histories_[node.gistname]) {
                    history_len = that.histories_[node.gistname].length;
                }
                if(history_len==1) { // FIXME: should be via UI.notebook_commands
                    $(".history i",$(node.element)).addClass("button-disabled");
                }
                that.$tree_.tree('openNode', node);
            });
    },  

    format_date_time_stamp = function(date, diff, isDateSame, for_version) {
        function pad(n) { return n<10 ? '0'+n : n; }
        var now = new Date();
        var time_part = '<span class="notebook-time">' + date.getHours() + ':' + pad(date.getMinutes()) + '</span>';
        var date_part = (date.getMonth()+1) + '/' + date.getDate();
        var year_part = date.getFullYear().toString().substr(2,2);
        if(diff < 24*60*60*1000 && isDateSame && this.show_terse_dates_ && for_version)
            return time_part;
        else if(date.getFullYear() === now.getFullYear())
            return '<span>' + date_part + ' ' + time_part + '</span>';
        else
            return '<span>' + date_part + '/' + year_part + ' ' + time_part + '</span>';
    },

    display_date = function(ds) {
        // return an element
        return $(display_date_html(ds))[0];
    },

    display_date_html = function(ds) {
        if(ds==='none')
            return '';
        if(typeof ds==='string')
            return ds;
        var date = new Date(ds);
        var now = new Date();
        var diff = now - date;
        return format_date_time_stamp(date, diff, true, false);
    }, 

    highlight_node = function(node) {
        var that = this;
        return function() {
            return new Promise(function(resolve) {
                var p = node.parent;
                while(p.sort_order===order.NOTEBOOK) {
                    that.$tree_.tree('openNode', p);
                    p = p.parent;
                }
                ui_utils.scroll_into_view(that.$tree_.parent(), 150, 150, function() {
                    $(node.element).closest('.jqtree_common').effect('highlight', { color: '#fd0' }, 1500, function() {
                        resolve();
                    });
                }, $(node.element));
            });
        };
    }, 

    highlight_notebooks = function(notebooks) {
        var that = this;

        var nodes = _.map(_.isArray(notebooks) ? notebooks : [notebooks], function(notebook) {
            return that.$tree_.tree('getNodeById', node_id('interests', username_, notebook.id));
        });

        // get promises:
        nodes.map(function(node) {
            return highlight_node(node);
        }).reduce(function(cur, next) {
            return cur.then(next);
        }, Promise.resolve()).then(function() {});
    }, 
    
    on_create_tree_li = function(node, $li) {

        $li.css("min-height","15px");

        var element = $li.find('.jqtree-element'),
            title = element.find('.jqtree-title');

        title.css('color', node.color);

        if(path_tips_) {
            element.attr('title', node.id);
        }

        if(node.gistname) {
            if(node.source) {
                title.addClass('foreign-notebook');
            } else if(!node.visible) {
                title.addClass('hidden-notebook');
            }
        }

        if(node.version || node.id === 'showmore') {
            title.addClass('history');
        }

        var date;

        if(node.last_commit) {
            date = $.el.span({'class': 'notebook-date'}, display_date(node.last_commit));
        }

        var right = $.el.span({'class': 'notebook-right'}, date);
        // if it was editable before, we need to restore that - either selected or open folder tree node
        if(node.user === username_ && (this.$tree_.tree('isNodeSelected', node) ||
                                       !node.gistname && node.full_name && node.is_open)) {
            RCloud.UI.notebook_title.make_editable(node, $li, true);
        }   

        RCloud.UI.notebook_commands.decorate($li, node, right);
        element.append(right);
    };

    return {
        highlight_notebooks: highlight_notebooks
    };
}();