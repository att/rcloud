RCloud.UI.notebook_commands = (function() {
    var info_popover_ = null; // current opened information popover
    var icon_style_ = {'line-height': '90%'};
    var star_style_ = _.extend({'font-size': '80%'}, icon_style_);
    var star_states_ = {true: {'class': 'icon-star', title: 'unstar'},
                        false: {'class': 'icon-star-empty', title: 'star'}};

    var commands_ = {};
    var defaults_ = {
        condition0: function(node) {
            return node.gistname && !node.version;
        },
        condition1: function(node) {
            return true;
        }
    };

    function add_commands(node, span, commands) {
        commands.sort(function(a, b) { return a.sort - b.sort; });
        commands.forEach(function(command) {
            if(!_.every(['condition0', 'condition1', 'condition2'],
                      function(c) {
                          return !command[c] || command[c](node);
                      }))
                return;
            span.append(document.createTextNode(String.fromCharCode(160)));
            span.append(command.create(node));
        });
    }

    //for hiding information popover on click outside
    $('body').on('click', function(e) {
        if(info_popover_ &&
           $(e.target).data('toggle') !== 'popover' &&
           $(e.target).parents('.popover.in').length === 0) {
            info_popover_.popover('destroy');
            info_popover_ = null;
        }
    });
    var result = {
        init: function() {
            this.add({
                star_unstar: {
                    section: 'always',
                    sort: 1000,
                    create: function(node) {
                        var state = editor.i_starred(node.gistname);
                        var star_unstar = ui_utils.fa_button(star_states_[state]['class'],
                                                             function(e) { return star_states_[state].title; },
                                                             'star',
                                                             star_style_,
                                                             true);
                        // sigh, ui_utils.twostate_icon should be a mixin or something
                        // ... why does this code exist?
                        star_unstar.click(function(e) {
                            e.preventDefault();
                            e.stopPropagation(); // whatever you do, don't let this event percolate
                            var new_state = !state;
                            editor.star_notebook(new_state, {gistname: node.gistname, user: node.user});
                        });
                        star_unstar[0].set_state = function(val) {
                            state = !!val;
                            $(this).find('i').attr('class', star_states_[state].class);
                        };
                        star_unstar.append($.el.sub(String(editor.num_stars(node.gistname))));
                        return star_unstar;
                    }
                },
                notebook_info: {
                    section: 'appear',
                    sort: 1000,
                    create: function(node) {
                        var info = ui_utils.fa_button('icon-info-sign', 'notebook info', 'info', icon_style_, false);
                        info.click(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            var thisIcon = this;
                            var info_content = '';
                            if(info_popover_) {
                                info_popover_.popover('destroy');
                                info_popover_ = null;
                            }
                            rcloud.stars.get_notebook_starrer_list(node.gistname).then(function(list) {
                                if(typeof(list) === 'string')
                                    list = [list];
                                var starrer_list = '<div class="info-category"><b>Starred by:</b></div>';
                                list.forEach(function (v) {
                                    starrer_list = starrer_list + '<div class="info-item">' + v + '</div>';
                                });
                                info_content = info_content + starrer_list;
                                $(thisIcon).popover({
                                    title: node.name,
                                    html: true,
                                    content: info_content,
                                    container: 'body',
                                    placement: 'right',
                                    animate: false,
                                    delay: {hide: 0}
                                });
                                $(thisIcon).popover('show');
                                var thisPopover = $(thisIcon).popover().data()['bs.popover'].$tip[0];
                                $(thisPopover).addClass('popover-offset');
                                info_popover_ = $(thisIcon);
                            });
                        });
                        return info;
                    }
                },
                history: {
                    section: 'appear',
                    sort: 2000,
                    create: function(node) {
                        var current = editor.current();
                        var disable = current.notebook===node.gistname && current.version;
                        var history = ui_utils.fa_button('icon-time', 'history', 'history', icon_style_, true);
                        // jqtree recreates large portions of the tree whenever anything changes
                        // so far this seems safe but might need revisiting if that improves
                        if(disable)
                            history.addClass('button-disabled');
                        history.click(function() {
                            ui_utils.fake_hover(node);
                            if(!disable) {
                                editor.show_history(node, true);
                            }
                            return false;
                        });
                        return history;
                    }
                },
                private_public: {
                    section: 'appear',
                    sort: 3000,
                    condition1: function(node) {
                        return node.user === editor.username();
                    },
                    create: function(node) {
                        var make_private = ui_utils.fa_button('icon-eye-close', 'make private', 'private', icon_style_, true),
                            make_public = ui_utils.fa_button('icon-eye-open', 'make public', 'public', icon_style_, true);
                        if(node.visible)
                            make_public.hide();
                        else
                            make_private.hide();
                        make_private.click(function() {
                            ui_utils.fake_hover(node);
                            if(node.user !== editor.username())
                                throw new Error("attempt to set visibility on notebook not mine");
                            else
                                editor.set_notebook_visibility(node.gistname, false);
                        });
                        make_public.click(function() {
                            ui_utils.fake_hover(node);
                            if(node.user !== editor.username())
                                throw new Error("attempt to set visibility on notebook not mine");
                            else
                                editor.set_notebook_visibility(node.gistname, true);
                            return false;
                        });
                        return make_private.add(make_public);
                    }
                },
                remove: {
                    section: 'appear',
                    sort: 4000,
                    condition1: function(node) {
                        return node.user === editor.username();
                    },
                    create: function(node) {
                        var remove = ui_utils.fa_button('icon-remove', 'remove', 'remove', icon_style_, true);
                        remove.click(function(e) {
                            var yn = confirm("Do you want to remove '"+node.full_name+"'?");
                            if (yn) {
                                e.stopPropagation();
                                e.preventDefault();
                                editor.remove_notebook(node.user, node.gistname);
                                return false;
                            } else {
                                return false;
                            }
                        });
                        return remove;
                    }
                }
            });
            return this;
        },
        add: function(commands) {
            _.extend(commands_, commands);
            return this;
        },
        remove: function(command_name) {
            delete commands_[command_name];
            return this;
        },
        load: function() {
            for(var key in commands_)
                commands_[key] = _.extend(_.extend({}, defaults_), commands_[key]);
            return this;
        },
        icon_style: function() {
            return icon_style_;
        },
        decorate: function($li, node, right) {
            // commands for the right column, always shown
            var always = $($.el.span({'class': 'notebook-commands-right'}));
            var always_commands = _.filter(commands_, function(command) {
                return command.section === 'always';
            });
            add_commands(node, always, always_commands);
            right.append(always);

            // commands that appear
            var appear = $($.el.span({'class': 'notebook-commands appear'}));
            var appear_commands = _.filter(commands_, function(command) {
                return command.section === 'appear';
            });
            add_commands(node, appear, appear_commands);
            right.append(appear);

            appear.hide();
            always.append($.el.span({"class": "notebook-commands appear-wrapper"}, appear[0]));

            $li.find('*:not(ul)').hover(
                function() {
                    var notebook_info = editor.get_notebook_info(node.gistname);
                    $('.notebook-commands.appear', this).show();
                    $('.notebook-date', this).css('visibility', 'hidden');
                },
                function() {
                    $('.notebook-commands.appear', this).hide();
                    $('.notebook-date', this).css('visibility', 'visible');
                });
            return this;
        }
    };
    return result;
})();
