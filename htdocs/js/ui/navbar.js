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
                    .animate({opacity: whether ? 1 : 0}, 250);
                return this;
            };
            return result;
        },
        init: function() {
            // display brand now (won't wait for load/session)
            var header = $('#rcloud-navbar-header');
            header.empty().append('<a class="navbar-brand" href="#">RCloud</a>');
            extension_ = RCloud.extension.create({
                sections: {
                    header: {
                        filter: RCloud.extension.filter_field('area', 'header')
                    },
                    commands: {
                        filter: RCloud.extension.filter_field('area', 'commands')
                    }
                }
            });
            this.add({
                shareable_link: {
                    area: 'commands',
                    sort: 1000,
                    create: function() {
                        var share_link_, view_types_;
                        return {
                            control: $.el.span(share_link_ = $.el.a({
                                href: '#',
                                id: 'share-link',
                                title: 'Shareable Link',
                                class: 'btn btn-link navbar-btn',
                                style: 'text-decoration:none; padding-right: 0px',
                                target: '_blank'
                            }, $.el.i({class: 'icon-share'})), $.el.span({
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
                    create: function() {
                        var star_, unstar_, icon_, count_;
                        var button = $.el.button({
                            id: 'star-notebook',
                            title: 'Add to Interests',
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
                    create: function() {
                        return RCloud.UI.navbar.create_button('fork-notebook', 'Fork', 'icon-code-fork');
                    }
                },
                save_notebook: {
                    area: 'commands',
                    sort: 4000,
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
                    create: function() {
                        return RCloud.UI.navbar.create_button('revert-notebook', 'Revert', 'icon-undo');
                    }
                },
                run_notebook: {
                    area: 'commands',
                    sort: 6000,
                    create: function() {
                        return RCloud.UI.navbar.create_highlight_button('run-notebook', 'Run All', 'icon-play');
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
                var commands = extension_.create('commands');
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
