RCloud.UI.navbar = (function() {
    var extension_;
    var result = {
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
                        return $.el.span($.el.a({
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
                        }, $.el.b({class: 'caret'})), $.el.ul({
                            class: 'dropdown-menu view-menu',
                            id: 'view-type'
                        })));
                    }
                },
                star_notebook: {
                    area: 'commands',
                    sort: 2000,
                    create: function() {
                        return $.el.button({
                            id: 'star-notebook',
                            title: 'Add to Interests',
                            type: 'button',
                            class: 'btn btn-link navbar-btn',
                            style: 'padding-left: 3px'
                        }, $.el.i({
                            class: 'icon-star-empty'
                        }), $.el.sub($.el.span({
                            id: 'curr-star-count'
                        })));
                    }
                },
                fork_notebook: {
                    area: 'commands',
                    sort: 3000,
                    create: function() {
                        return $.el.button({
                            id: 'fork-notebook',
                            title: 'Fork',
                            type: 'button',
                            class: 'btn btn-link navbar-btn'
                        }, $.el.i({
                            class: 'icon-code-fork'
                        }));
                    }
                },
                save_notebook: {
                    area: 'commands',
                    sort: 4000,
                    create: function() {
                        return $.el.button({
                            id: 'save-notebook',
                            title: 'Save',
                            type: 'button',
                            class: 'btn btn-link navbar-btn'
                        }, $.el.i({
                            class: 'icon-save'
                        }));
                    }
                },
                revert_notebook: {
                    area: 'commands',
                    sort: 5000,
                    create: function() {
                        return $.el.button({
                            id: 'revert-notebook',
                            title: 'Revert',
                            type: 'button',
                            class: 'btn btn-link navbar-btn'
                        }, $.el.i({
                            class: 'icon-undo'
                        }));
                    }
                },
                run_notebook: {
                    area: 'commands',
                    sort: 6000,
                    create: function() {
                        return $.el.span($.el.span({
                            class: 'button-highlight'
                        }), $.el.button({
                            id: 'run-notebook',
                            title: 'Run All',
                            type: 'button',
                            class: 'btn btn-link navbar-btn'
                        }, $.el.i({class: 'icon-play'})));
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
        load: function() {
            if(extension_) {
                var brands = extension_.create('header').array;
                var header = $('#rcloud-navbar-header');
                if(brands.length)
                    header.empty().append.apply(header, brands);
                var commands = extension_.create('commands').array;
                var main = $('#rcloud-navbar-main');
                if(commands.length)
                    main.prepend.apply(main, commands.map(function(button) {
                        return $.el.li(button);
                    }));
            }
        }
    };
    return result;
})();
