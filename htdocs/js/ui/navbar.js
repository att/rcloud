RCloud.UI.navbar = (function() {
    var extension_, controls_;
    var result = {
        create_button: function(id, title, icon) {
            var button = $.el.button({
                id: id,
                title: title,
                type: 'button',
                class: 'btn btn-link navbar-btn'
            }, $.el.i({
                class: icon
            })), $button = $(button);
            return {
                control: button,
                click: function(handler) {
                    $(button).click(handler);
                    return this;
                },
                hide: function() {
                    $button.hide();
                    return this;
                },
                show: function() {
                    $button.show();
                    return this;
                },
                disable: function() {
                    ui_utils.disable_bs_button($button);
                    return this;
                },
                enable: function() {
                    ui_utils.enable_bs_button($button);
                    return this;
                },
                display: function(title, icon) {
                    $(button).find('i').removeClass().addClass(icon);
                    $(button).attr('title', title);
                    return this;
                }
            };

        },
        create_highlight_button: function(id, title, icon) {
            var result = this.create_button(id, title, icon);
            result.control = $.el.span($.el.span({
                class: 'button-highlight'
            }), result.control);
            result.highlight = function(whether) {
                $(result.control)
                    .find('.button-highlight')
                    .animate({opacity: whether ? 1 : 0}, {duration: 250, queue: false});
                return this;
            };
            return result;
        },
        init: function() {
            // display brand now (won't wait for load/session)
            var header = $('#rcloud-navbar-header');
            header.empty().append('<a class="navbar-brand" href="/edit.html">RCloud</a>');
            var cmd_filter = RCloud.extension.filter_field('area', 'commands'),
                view_filter = RCloud.UI.menu.filter_mode('view'),
                edit_filter = RCloud.UI.menu.filter_mode('edit');

            extension_ = RCloud.extension.create({
                sections: {
                    header: {
                        filter: RCloud.extension.filter_field('area', 'header')
                    },
                    view_commands: {
                        filter: function(entry) {
                            return cmd_filter(entry) && view_filter(entry);
                        }
                    },
                    edit_commands: {
                        filter: function(entry) {
                            return cmd_filter(entry) && edit_filter(entry);
                        }
                    }
                }
            });
            this.add({
                shareable_link: {
                    area: 'commands',
                    sort: 1000,
                    modes: ['edit'],
                    create: function() {
                        var view_types_;
                        var share_link_ = $.el.a({
                                href: '#',
                                id: 'share-link',
                                title: 'Shareable Link',
                                class: 'btn btn-link navbar-btn',
                                style: 'text-decoration:none; padding-right: 0px',
                                target: '_blank'
                            }, $.el.i({class: 'icon-share'}));
                        $(share_link_).on('click', function(x) { shell.save_notebook();})
                        return {
                            control: $.el.span(share_link_, $.el.span({
                                class: 'dropdown',
                                style: 'position: relative; margin-left: -2px; padding-right: 12px'
                            }, $.el.a({
                                href: '#',
                                class: 'dropdown-toggle',
                                'data-toggle': 'dropdown',
                                id: 'view-mode'
                            }, $.el.b({class: 'caret'})), view_types_ = $.el.ul({
                                class: 'dropdown-menu view-menu',
                                id: 'view-type'
                            }))),
                            set_url: function(url) {
                                if(share_link_)
                                    $(share_link_).attr('href', url);
                                return this;
                            },
                            open: function() {
                                if(share_link_) {
                                    $(share_link_)[0].click();
                                }
                                return this;
                            },
                            set_view_types: function(items) {
                                $(view_types_).append($(items.map(function(item) {
                                    var a = $.el.a({href: '#'}, item.title);
                                    $(a).click(item.handler);
                                    return $.el.li(a);
                                })));
                            }
                        };
                    }
                },
                star_notebook: {
                    area: 'commands',
                    sort: 2000,
                    modes: ['edit'],
                    create: function() {
                        var star_, unstar_, icon_, count_;
                        var button = $.el.button({
                            id: 'star-notebook',
                            title: 'Star Notebook',
                            type: 'button',
                            class: 'btn btn-link navbar-btn',
                            style: 'padding-left: 3px'
                        }, $.el.i({
                            class: 'icon-star-empty'
                        }), $.el.sub(count_ = $.el.span({
                            id: 'curr-star-count'
                        })));
                        icon_ = ui_utils.twostate_icon($(button),
                                                       function() { star_(); },
                                                       function() { unstar_(); },
                                                       'icon-star', 'icon-star-empty');
                        return {
                            control: button,
                            set_star_unstar: function(star, unstar) {
                                star_ = star;
                                unstar_ = unstar;
                                return this;
                            },
                            set_fill: function(filled) {
                                icon_.set_state(filled);
                                $(this.control).attr('title', filled ? 'Unstar Notebook' : 'Star Notebook');
                                return this;
                            },
                            set_count: function(count) {
                                $(count_).text(count);
                                return this;
                            }
                        };
                    }
                },
                fork_notebook: {
                    area: 'commands',
                    sort: 3000,
                    modes: ['edit'],
                    create: function() {
                        var control = RCloud.UI.navbar.create_button('fork-notebook', 'Fork', 'icon-code-fork');
                        $(control.control).click(function(e) {
                            var is_mine = shell.notebook.controller.is_mine();
                            var gistname = shell.gistname();
                            var version = shell.version();
                            
                            if(e.metaKey || e.ctrlKey) {
                              editor.fork_notebook(is_mine, gistname, version, false).then(function(notebook) {
                                var url = ui_utils.make_url('edit.html', {notebook: notebook.id});
                                window.open(url, "_blank");
                              });
                            } else {
                              editor.fork_notebook(is_mine, gistname, version, true);
                            }
                            
                        });
                        return control;
                    }
                },
                save_notebook: {
                    area: 'commands',
                    sort: 4000,
                    modes: ['edit'],
                    create: function() {
                        var control = RCloud.UI.navbar.create_button('save-notebook', 'Save', 'icon-save');
                        $(control.control).click(function() {
                            shell.save_notebook();
                        });
                        control.disable();
                        return control;
                    }
                },
                revert_notebook: {
                    area: 'commands',
                    sort: 5000,
                    modes: ['edit'],
                    create: function() {
                        var control = RCloud.UI.navbar.create_button('revert-notebook', 'Revert', 'icon-undo');
                        $(control.control).click(function() {
                            var is_mine = shell.notebook.controller.is_mine();
                            var gistname = shell.gistname();
                            var version = shell.version();
                            editor.revert_notebook(is_mine, gistname, version);
                        });
                        return control;
                    }
                },
                edit_notebook: {
                    area: 'commands',
                    sort: 1000,
                    modes: ['view'],
                    create: function() {
                        var control = RCloud.UI.navbar.create_button('edit-notebook', 'Edit Notebook', 'icon-edit');
                        $(control.control).click(function() {
                            window.location = "edit.html?notebook=" + shell.gistname();
                        });
                        return control;
                    }
                },
                run_notebook: {
                    area: 'commands',
                    sort: 6000,
                    modes: ['edit', 'view'],
                    create: function() {
                        var control = RCloud.UI.navbar.create_highlight_button('run-notebook', 'Run All', 'icon-play');
                        $(control.control).click(function(e) {
                          if(e.metaKey || e.ctrlKey) {
                            var selected = shell.get_selected_cells().map (function(x) { return x.id(); });
                            if(selected.length) {
                              shell.run_notebook_cells(selected);
                            }
                          } else {
                            RCloud.UI.run_button.run();
                          }
                        });
                        return control;
                    }
                },
                stop_notebook: {
                    area: 'commands',
                    sort: 7000,
                    modes: ['edit', 'view'],
                    create: function() {
                        var control = RCloud.UI.navbar.create_highlight_button('stop-notebook', 'Stop', 'icon-stop');
                        $(control.control).click(function(e) {
                            RCloud.UI.stop_button.stop();
                        });
                        return control;
                    }
                }
            });
        },
        add: function(commands) {
            if(extension_)
                extension_.add(commands);
            return this;
        },
        remove: function(command_name) {
            if(extension_)
                extension_.remove(command_name);
            return this;
        },
        get: function(command_name) {
            return extension_ ? extension_.get(command_name) : null;
        },
        control: function(command_name) {
            return controls_ ? controls_[command_name] : null;
        },
        load: function() {
            if(extension_) {
                var brands = extension_.create('header').array;
                var header = $('#rcloud-navbar-header');
                if(brands.length)
                    header.empty().append.apply(header, brands);
                var commands_section = RCloud.UI.menu.ui_mode() + '_commands';
                var commands = extension_.create(commands_section);
                var main = $('#rcloud-navbar-main');
                if(commands.array.length)
                    main.prepend.apply(main, commands.array.map(function(button) {
                        return $.el.li(button.control);
                    }));
                controls_ = commands.map;
            }
            return Promise.resolve(undefined);
        }
    };
    return result;
})();
