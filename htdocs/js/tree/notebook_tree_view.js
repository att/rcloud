var notebook_tree_view = function(model) {

    "use strict";

    this.model_ = model;
    this.$tree_ = null;
    this.tree_controls_root_selector = '#tree-controls';
    this.$sort_order_select_ = $('#tree_sort_order');
    this.date_filter_ = new date_filter('#tree-filter-by');
    
    this.on_notebook_open = new event(this);

    var view_obj = this;

    // attach view component listeners:
    this.date_filter_.on_change.attach(function(sender, args) { 
        view_obj.model_.update_filter(args);
    });

    // future listeners conform to args = { prop, value }
    //
    // this.another_filter_.on_change.attach(function(sender, args) {
    //     view_obj.model_.update_filter(args);
    // });

    // attach model listeners
    this.model_.on_settings_complete.attach(function(sender, args) {
        $(view_obj.tree_controls_root_selector).find('[data-settingkey]').each(function() {
            var settingKey = $(this).data('settingkey');
            var settingValue = args[settingKey];

            if(settingValue != null) {
                $(this).val(settingValue);                 
            }
        });
    });

    this.model_.on_initialise_tree.attach(function(sender, args) {

        var start_widget_time = window.performance ? window.performance.now() : 0;
        view_obj.$tree_ = $("#editor-book-tree");

        console.info('loading tree data: ', args.data);

        view_obj.$sort_order_select_.on('change', view_obj.change_sort_order.bind(view_obj));

        view_obj.$tree_.tree({
            data: args.data,
            onCreateLi: view_obj.on_create_tree_li.bind(view_obj),
            selectable: true,
            useContextMenu: false,
            keyboardSupport: false
        });

        view_obj.$tree_.bind('tree.click', view_obj.tree_click.bind(view_obj));
        view_obj.$tree_.bind('tree.open', view_obj.tree_open.bind(view_obj));
        view_obj.$tree_.bind('tree.close', view_obj.tree_close.bind(view_obj));

        if(start_widget_time)
            console.log('load tree took ' + (window.performance.now() - start_widget_time));

        var interests = view_obj.$tree_.tree('getNodeById', "/interests");
        view_obj.$tree_.tree('openNode', interests);
    });

    this.model_.on_update_sort_order.attach(function(sender, args) {
        if(view_obj.$tree_) {
            // get the state, because 'loadData' doesn't persist selected
            // or node states:
            var state = view_obj.$tree_.tree('getState');

            _.each(args.nodes, function(node) {
                var parent = view_obj.$tree_.tree('getNodeById', node.node_id);
                view_obj.$tree_.tree('loadData', node.children, parent);
            });

            // restore the state:
            view_obj.$tree_.tree('setState', state);
        }

        view_obj.$sort_order_select_.val(args.sort_type);
    });

    this.model_.on_update_show_nodes.attach(function(sender, args) {
        if(view_obj.$tree_) {
            view_obj.$tree_.tree('getTree').iterate(function(node) {
                if(node.gistname) {
                    if(args.nodes.indexOf(node.id) != -1) {
                        $(node.element).show();
                    } else {
                        $(node.element).hide();
                    }
                } 

                return true;
            });
        }

        if(args.filter_props.prop == 'tree-filter-date') {
            view_obj.date_filter_.val(args.filter_props.value);
        }
    });

    this.model_.on_load_by_user.attach(function(sender, args) {
        
        var root = view_obj.$tree_.tree('getNodeById', args.pid);  
        view_obj.$tree_.tree('loadData', args.data, root);

        if(args.duplicate_data) {
            view_obj.$tree_.tree('loadData', args.duplicate_data, 
            view_obj.$tree_.tree('getNodeById', args.duplicate_parent_id));
        }
    });

    this.model_.on_open_and_select.attach(function(sender, args) {
        var node = args.node;

        if(args.isHistorical) {
            view_obj.$tree_.tree('openNode', 
                view_obj.$tree_.tree('getNodeById', args.node.id));

            node = view_obj.$tree_.tree('getNodeById', args.id);

            if(!node)
                throw new Error('tree node was not created for current history');
        } else {
            node = view_obj.$tree_.tree('getNodeById', args.id);
        }

        view_obj.select_node(node);
    });

    this.model_.on_select_node.attach(function(sender, args) {
        var node = view_obj.$tree_.tree('getNodeById', args.node.id);
        view_obj.$tree_.tree('selectNode', node);
        view_obj.scroll_into_view(node);
        if(node.user === sender.username_)
            RCloud.UI.notebook_title.make_editable(node, node.element, true);
        else
            RCloud.UI.notebook_title.make_editable(null);
    });

    this.model_.on_load_children.attach(function(sender, args) {
        console.warn('redundant code?');
        view_obj.$tree_.tree('loadData', args.node.delay_children, args.node);
    });

    this.model_.on_add_node_before.attach(function(sender, args) {
        view_obj.$tree_.tree('addNodeBefore',
            args.node_to_insert,
            view_obj.$tree_.tree('getNodeById', args.existing_node.id)); 
    });

    this.model_.on_append_node.attach(function(sender, args) {
        view_obj.$tree_.tree('appendNode', args.node_to_insert, 
            view_obj.$tree_.tree('getNodeById', args.parent_id));
    });

    this.model_.on_load_data.attach(function(sender, args) {
        view_obj.$tree_.tree('loadData', args.children, 
            view_obj.$tree_.tree('getNodeById', args.node.id));        
    });

    this.model_.on_update_node.attach(function(sender, args) {
        view_obj.$tree_.tree('updateNode', 
            view_obj.$tree_.tree('getNodeById', args.node.id), args.data);
    });

    this.model_.on_remove_node.attach(function(sender, args) {
        var node = view_obj.$tree_.tree('getNodeById', args.node.id);

        if(args.fake_hover) {
            ui_utils.fake_hover(node);
        }
        
        view_obj.$tree_.tree('removeNode', node);
    });

    this.model_.on_fake_hover.attach(function(sender, args) {
        ui_utils.fake_hover(view_obj.$tree_.tree('getNodeById', args.node.id));
    });

    this.model_.on_open_node.attach(function(sender, args) {
        view_obj.$tree_.tree('removeNode', view_obj.$tree_.tree('getNodeById', args.node.id));
    });

    this.model_.on_show_history.attach(function(sender, args) {
        if(args.history_len === 1) { // FIXME: should be via UI.notebook_commands
            $(".history i", $(view_obj.$tree_.tree('getNodeById', args.node.id).element)).addClass("button-disabled");
        }

        view_obj.$tree_.tree('openNode', 
            view_obj.$tree_.tree('getNodeById', args.node.id));
    });

    this.model_.remove_history_nodes.attach(function(sender, args) {
        var i, node = view_obj.$tree_.tree('getNodeById', args.node.id);

        if (node.children) {
            if(args.from_index) {
                // remove everything from:
                for(i = node.children.length - 1; i >= args.from_index; --i) {
                    view_obj.$tree_.tree('removeNode', node.children[i]);
                }
            } else {
                // get rid of everything:
                for (i = node.children.length-1; i >= 0; i--) {
                    view_obj.$tree_.tree('removeNode', node.children[i]);
                }
            }
        }
    });
};

notebook_tree_view.prototype = {

    change_sort_order: function(event) {
        var val = $(event.target).val();
        this.model_.update_sort_type(val, true);
    },

    tree_click: function(event) {

        if(event.node.id.startsWith('showmore')){
            //show_history(event.node.parent, false);
            this.model_.update_history(event.node.parent, false);
        } else if(event.node.gistname) {
            if(event.click_event.metaKey || event.click_event.ctrlKey) {
                this.on_notebook_open.notify({ 
                    gistname: event.node.gistname, 
                    version: event.node.version,
                    source: event.node.source, 
                    selroot: true,
                    new_window: true
                });
            } else {
                // it's weird that a notebook exists in two trees but only one is selected (#220)
                // just select - and this enables editability
                /*jshint eqnull:true */
                if(event.node.gistname === this.model_.get_current().notebook &&
                    event.node.version == this.model_.get_current().version && event.node.version == null) { // deliberately null-vague here
                    this.select_node(event.node);
                } else {
                    this.on_notebook_open.notify({ 
                        // gistname, version, source, selroot, new_window
                        gistname: event.node.gistname, 
                        version: event.node.version || null,
                        source: event.node.source, 
                        selroot: event.node.root,
                        new_window: false
                    });
                }
                /*jshint eqnull:false */
            }
        } else {
            if(!event.node.is_open) {
                this.$tree_.tree('openNode', event.node);
                ui_utils.fake_hover(event.node);
            }

            this.model_.set_node_open_status(event.node, event.node.is_open);
        }

        return false;
    },

    select_node: function(node) {
        this.$tree_.tree('selectNode', node);
        this.scroll_into_view(node);
        if(node.user === this.model_.username_)
            RCloud.UI.notebook_title.make_editable(node, node.element, true);
        else
            RCloud.UI.notebook_title.make_editable(null);
    },

    scroll_into_view: function(node) {
        var p = node.parent;
        while(p.sort_order === this.model_.order.NOTEBOOK) {
            this.$tree_.tree('openNode', p);
            p = p.parent;
        }
        ui_utils.scroll_into_view(this.$tree_.parent(), 50, 100, null, $(node.element));
    },

    remove_node: function(node) {
        var parent = node.parent;
        ui_utils.fake_hover(node);
        $tree_.tree('removeNode', node);
        this.remove_empty_parents(parent);
        if(node.root === 'interests' && node.user !== this.model_.username_ && parent.children.length === 0)
            $tree_.tree('removeNode', parent);
    },

    remove_empty_parents: function(dp) {
        // remove any empty notebook hierarchy
        while(dp.children.length===0 && dp.sort_order === this.model_.order.NOTEBOOK) {
            var dp2 = dp.parent;
            $tree_.tree('removeNode', dp);
            dp = dp2;
        }
    },

    reselect_node: function(f) {
        var selected_node = $tree_.tree('getSelectedNode');
        return f().then(function() {
            var node_to_select = $tree_.tree('getNodeById', selected_node.id);

            if(node_to_select)
                this.select_node(node_to_select);
            else console.log('sorry, neglected to highlight ' + selected_node.id);
        });
    },

    tree_open: function(event) {
        var n = event.node;

        // notebook folder name only editable when open
        if(n.full_name && n.user === this.model_.username() && !n.gistname) {
            RCloud.UI.notebook_title.make_editable(n, n.element, true);
        }

        $('#collapse-notebook-tree').trigger('size-changed');

        if(n.user && this.model_.lazy_load_[n.user])
            this.model_.load_user_notebooks(n.user);
    },

    tree_close: function(event) {
        var n = event.node;
        // notebook folder name only editable when open
        if(n.full_name && !n.gistname) {
            RCloud.UI.notebook_title.make_editable(n, n.element, false);
        }
    },

    display_date: function(ds) {
        // return an element
        return $(this.display_date_html(ds))[0];
    },

    display_date_html: function(ds) {
        if(ds==='none')
            return '';
        if(typeof ds==='string')
            return ds;
        var date = new Date(ds);
        var now = new Date();
        var diff = now - date;
        return RCloud.utils.format_date_time_stamp(date, diff, true, false, this.model_.show_terse_dates());
    }, 

    highlight_node: function(node) {
        var that = this;
        return function() {
            return new Promise(function(resolve) {
                var p = node.parent;
                while(p.sort_order === that.model_.order.NOTEBOOK) {
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

    highlight_notebooks: function(notebooks) {

        var that = this,
            nodes = _.map(_.isArray(notebooks) ? notebooks : [notebooks], function(notebook) {
            // HACKY: the view shouldn't need to know how to generate an ID (model's repsonsibility):
            return that.$tree_.tree('getNodeById', '/' + ['interests', that.model_.username_, notebook.id].join('/'));
        });

        // get promises:
        nodes.map(function(node) {
            return that.highlight_node(node);
        }).reduce(function(cur, next) {
            return cur.then(next);
        }, Promise.resolve()).then(function() {});
    }, 
    
    on_create_tree_li: function(node, $li) {

        var element = $li.find('.jqtree-element'),
            title = element.find('.jqtree-title');

        title.css('color', node.color);

        if(this.model_.path_tips()) {
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
            date = $.el.span({'class': 'notebook-date'}, this.display_date(node.last_commit));
        }

        var right = $.el.span({'class': 'notebook-right'}, date);
        // if it was editable before, we need to restore that - either selected or open folder tree node
        if(node.user === this.model_.username_ && (this.$tree_.tree('isNodeSelected', node) ||
                                       !node.gistname && node.full_name && node.is_open)) {
            RCloud.UI.notebook_title.make_editable(node, $li, true);
        }   

        RCloud.UI.notebook_commands.decorate($li, node, right);

        element.append(right);

        if(node.gistname) {
            element.parent()[this.model_.does_notebook_match_filter(node.id) ? 'show' : 'hide']();
        }
    }
};
