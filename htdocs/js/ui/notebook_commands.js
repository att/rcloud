RCloud.UI.notebook_commands = (function() {
    var icon_style_ = {'line-height': '90%'};
    var star_style_ = _.extend({'font-size': '80%'}, icon_style_);
    var star_states_ = {true: {'class': 'icon-star', title: 'unstar'},
                        false: {'class': 'icon-star-empty', title: 'star'}};

    var commands_ = {};
    var always_commands_, appear_commands_;
    var defaults_ = {
        condition0: function(node) {
            return node.gistname && !node.version;
        },
        condition1: function(node) {
            return true;
        }
    };

    function add_commands(node, span, commands) {
        commands.forEach(function(command) {
            span.append(document.createTextNode(String.fromCharCode(160)));
            span.append(command.create(node));
        });
    }

    function condition_pred(node) {
        return function(command) {
            return _.every(['condition0', 'condition1', 'condition2'], function(c) {
                return !command[c] || command[c](node);
            });
        };
    }

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
                            $('div.popover').remove(); // UGH
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
            // extend commands_ by each command in commands, with defaults
            for(var key in commands)
                commands_[key] = _.extend(_.extend({}, defaults_), commands[key]);

            // update the lists of commands (will be applied lots)
            always_commands_ = _.filter(commands_, function(command) {
                return command.section === 'always';
            });
            appear_commands_ = _.filter(commands_, function(command) {
                return command.section === 'appear';
            });
            [always_commands_, appear_commands_].forEach(function(set) {
                set.sort(function(a, b) { return a.sort - b.sort; });
            });
            return this;
        },
        remove: function(command_name) {
            delete commands_[command_name];
            return this;
        },
        icon_style: function() {
            return icon_style_;
        },
        decorate: function($li, node, right) {
            var appeared;
            var $right = $(right);
            var predicate = condition_pred(node);

            function do_always() {
                // commands for the right column, always shown
                var always_commands = always_commands_.filter(predicate);
                if(always_commands.length) {
                    var always = $($.el.span({'class': 'notebook-commands-right'}));
                    add_commands(node, always, always_commands);
                    $right.append(always);
                }
            }

            // decorate the notebook commands lazily, on hover
            function do_appear() {

                // commands that appear
                var appear_commands = appear_commands_.filter(predicate);
                if(appear_commands.length) {
                    var appear = $($.el.span({'class': 'notebook-commands appear'}));
                    add_commands(node, appear, appear_commands);
                    $right.append(appear);
                    $right.find('.notebook-date').toggleClass('disappear', true);
                    appear.hide();
                    $right.append($.el.span({"class": "notebook-commands appear-wrapper"}, appear[0]));
                }
                appeared = true;
            }

            do_always();
            $li.find('*:not(ul)').hover(
                function() {
                    if(!appeared)
                        do_appear();
                    var notebook_info = editor.get_notebook_info(node.gistname);
                    $('.notebook-commands.appear', this).show();
                    $('.notebook-date.disappear', this).css('visibility', 'hidden');
                },
                function() {
                    $('.notebook-commands.appear', this).hide();
                    $('.notebook-date.disappear', this).css('visibility', 'visible');
                });
            return this;
        }
    };
    return result;
})();
