RCloud.UI.cell_commands = (function() {
    var extension_;

    function create_command_set(area, div, cell_model, cell_view) {
        var commands_ = extension_.create(area, cell_model, cell_view);
        commands_.array.forEach(function(command) {
            command.control.addClass('cell-control');
        });
        var flags_ = {};
        div.append.apply(div, _.pluck(commands_.array, 'control'));
        return {
            controls: commands_.map,
            set_flag: function(flag, value) {
                var checkf = function(f) {
                    var reverse;
                    if(f.substr(0,1)=='!') {
                        reverse = true;
                        f = f.substr(1);
                    }
                    return reverse^flags_[f];
                };
                // a command will be enabled iff all of its enable_flags are true
                // a command will be shown iff all of its display_flags are true
                flags_[flag] = value;
                extension_.entries(area).forEach(function(cmd) {
                    if(!_.every(cmd.enable_flags, checkf))
                        commands_.map[cmd.key].disable();
                    else
                        commands_.map[cmd.key].enable();

                    if(cmd.display_flags) {
                        if(!_.every(cmd.display_flags, checkf))
                            commands_.map[cmd.key].control.hide();
                        else
                            commands_.map[cmd.key].control.show();
                    }
                });
            }
        };
    }

    var result = {
        create_button: function(awesome, text, action) {
            var control = ui_utils.fa_button(awesome, text);
            control.click(function(e) {
                // this is a blunt instrument.  seems the tooltips don't go away
                // when they are set to container = body
                $(".tooltip").remove();
                if (!$(e.currentTarget).hasClass("button-disabled")) {
                    action(control, e);
                }
            });
            return {
                control: control,
                enable: function() {
                    ui_utils.enable_fa_button(control);
                },
                disable: function() {
                    ui_utils.disable_fa_button(control);
                }
            };
        },
        create_select: function(items, action) {
            var control = $("<select class='form-control cell-control-select'></select>");
            control.append.apply(control,
                                 items.map(function(item) {
                                     return $("<option></option>").text(item);
                                 }));
            control.change(function() {
                var val = control.val();
                action(val);
            });
            return {
                control: control,
                enable: function() {
                    control.prop('disabled', false);
                },
                disable: function() {
                    control.prop('disabled', 'disabled');
                },
                set: function(val) {
                    if(items.indexOf(val)<0)
                        throw new Error('tried to select unknown value ' + val);
                    control.val(val);
                }
            };
        },
        create_static: function(html, wrap, action) {
            var content = $('<span><span/>').html(html);
            var span = wrap ? wrap(content) : content;

            if(action) {
                action(span);
            }

            return {
                control: span,
                enable: function() {},
                disable: function() {},
                set: function(html) {
                    content.html(html);
                    return this;
                },
                get: function() {
                    return content;
                }
            };
        },
        create_icon: function(icon, color, wrap) {
            var result = this.create_static("<i></i>");
            result = _.extend(result, {
                icon: function(icon) {
                    result.get().find('i').attr('class', icon);
                    return this;
                },
                color: function(color) {
                    result.get().find('i').css('color', color);
                    return this;
                },
                title: function(title) {
                    result.get().find('i').attr('title', title);
                    return this;
                }
            });
            result.get().attr('class', 'state-icon left-indicator');
            result.icon(icon).color(color);
            return result;
        },
        init: function() {
            extension_ = RCloud.extension.create({
                defaults: {},
                sections: {
                    above: {
                        filter: RCloud.extension.filter_field('area', 'above')
                    },
                    cell: {
                        filter: RCloud.extension.filter_field('area', 'cell')
                    },
                    prompt: {
                        filter: RCloud.extension.filter_field('area', 'prompt')
                    },
                    left: {
                        filter: RCloud.extension.filter_field('area', 'left')
                    }
                }
            });

            var that = this;
            this.add({
                insert: {
                    area: 'above',
                    sort: 1000,
                    enable_flags: ['modify'],
                    create: function(cell_model) {
                        return that.create_button("icon-plus-sign", "insert cell", function() {
                            shell.insert_cell_before("", cell_model.language(), cell_model.id())
                                .spread(function(_, controller) {
                                    controller.edit_source(true);
                                });
                        });
                    }
                },
                join: {
                    area: 'above',
                    sort: 2000,
                    enable_flags: ['modify'],
                    display_flags: ['!first'],
                    create: function(cell_model) {
                        return that.create_button("icon-link", "join cells", function() {
                            shell.join_prior_cell(cell_model);
                        });
                    }
                },
                language_cell: {
                    area: 'cell',
                    sort: 1000,
                    enable_flags: ['modify'],
                    create: function(cell_model, cell_view) {
                        var languages = RCloud.language.available_languages();
                        if(languages.indexOf(cell_model.language())<0)
                            languages.push(cell_model.language());
                        return that.create_select(languages, function(language) {
                            cell_model.parent_model.controller.change_cell_language(cell_model, language);
                            cell_view.clear_result();
                            cell_view.edit_source(true);
                        });
                    }
                },
                run: {
                    area: 'cell',
                    sort: 2000,
                    create: function(cell_model, cell_view) {
                        return that.create_button("icon-play", "run", function(control, e) {
                            if(e.shiftKey) {
                                shell.run_notebook_from(cell_model.id());
                            } else {
                                cell_view.execute_cell();
                            }
                        });
                    }
                },
                edit: {
                    area: 'cell',
                    sort: 3000,
                    create: function(cell_model, cell_view) {
                        return that.create_button("icon-edit borderable", "toggle edit mode", function() {
                            if(cell_model.parent_model.read_only())
                                cell_view.toggle_source();
                            else
                                cell_view.toggle_edit();
                        });
                    }
                },
                results: {
                    area: 'cell',
                    sort: 3500,
                    create: function(cell_model, cell_view) {
                        return that.create_button("icon-picture borderable", "show/hide results", function() {
                            cell_view.toggle_results();
                        });
                    }
                },
                command_gap: {
                    area: 'cell',
                    sort: 3500,
                    create: function(cell_model) {
                        return that.create_static('&nbsp;');
                    }
                },
                split: {
                    area: 'cell',
                    sort: 4000,
                    enable_flags: ['modify', 'edit'],
                    create: function(cell_model, cell_view) {
                        return that.create_button("icon-unlink", "split cell", function() {
                            var ace_widget = cell_view.ace_widget();
                            if(ace_widget) {
                                var range = ace_widget.getSelection().getRange();
                                var point1, point2;
                                point1 = ui_utils.character_offset_of_pos(ace_widget, range.start);
                                if(!range.isEmpty())
                                    point2 = ui_utils.character_offset_of_pos(ace_widget, range.end);
                                shell.split_cell(cell_model, point1, point2);
                            }
                        });
                    }
                },
                remove: {
                    area: 'cell',
                    sort: 5000,
                    enable_flags: ['modify'],
                    create: function(cell_model) {
                        return that.create_button("icon-trash", "remove", function() {
                            cell_model.parent_model.controller.remove_cell(cell_model);
                        });
                    }
                },
                selection: {
                    area: 'left',
                    sort: 1250,
                    display_flags: ['modify'],
                    create: function(cell_model) {
                        var html = "<input type='checkbox'></input>";
                        return that.create_static(html, function(x) {
                            return $("<span class='cell-selection'>").append(x);
                        }, function(static_content) {
                            static_content.click(function(e) {
                                cell_model.parent_model.controller.select_cell(cell_model, {
                                    is_toggle: !e.shiftKey, 
                                    is_range : e.shiftKey
                                });
                            });
                        });
                    }
                },
                left_gap: {
                    area: 'left',
                    sort: 1500,
                    display_flags: ['!modify'],
                    create: function(cell_model) {
                        return that.create_static('&nbsp;');
                    }
                },
                run_state: {
                    area: 'left',
                    sort: 2000,
                    create: function(cell_model) {
                        return that.create_icon('icon-circle-blank', '#777');
                    }
                },
                cell_number: {
                    area: 'left',
                    sort: 3000,
                    display_flags: ['cell-numbers'],
                    create: function(cell_model) {
                        return that.create_static(cell_model.id(), function(x) {
                            return $("<span class='left-indicator cell-number'></span>").append('cell ', x);
                        }, function(static_content) {
                        });
                    }
                }
            });
            return this;
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
        decorate: function(area, div, cell_model, cell_view) {
            return create_command_set(area, div, cell_model, cell_view);
        }
    };
    return result;
})();
