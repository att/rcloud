RCloud.UI.cell_commands = (function() {
    var commands_ = {};
    var above_between_commands_, cell_commands_, prompt_commands_;
    var defaults_ = {};

    function create_command_set(area, command_set, cell_model, cell_view) {
        var commands = {};
        command_set.forEach(function(cmd) {
            commands[cmd.key] = cmd.create(cell_model, cell_view);
            commands[cmd.key].control.addClass('cell-control');
        });
        area.append.apply(area, _.pluck(commands, 'control'));
        return {
            controls: commands,
            readonly: function(readonly) {
                command_set.forEach(function(cmd) {
                    if(cmd.modifying) {
                        if(readonly)
                            commands[cmd.key].disable();
                        else
                            commands[cmd.key].enable();
                    }
                });
            }
        };
    }

    var result = {
        create_button: function(awesome, text, action) {
            var control = ui_utils.fa_button(awesome, text);
            control.click(function(e) {
                control.tooltip('destroy');
                if (!$(e.currentTarget).hasClass("button-disabled")) {
                    action();
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
                }
            };
        },
        create_gap: function() {
            var gap = $('<span/>').html('&nbsp;').css({'line-height': '25%'});
            return {
                control: gap
            };
        },
        init: function() {
            var that = this;
            this.add({
                insert: {
                    area: 'above',
                    sort: 1000,
                    modifying: true,
                    create: function(cell_model) {
                        return that.create_button("icon-plus-sign", "insert cell", function() {
                            shell.insert_cell_before(cell_model.language(), cell_model.id());
                        });
                    }
                },
                join: {
                    area: 'between',
                    sort: 2000,
                    modifying: true,
                    create: function(cell_model) {
                        return that.create_button("icon-link", "join cells", function() {
                            shell.join_prior_cell(cell_model);
                        });
                    }
                },
                language_cell: {
                    area: 'cell',
                    sort: 1000,
                    modifying: true,
                    create: function(cell_model, cell_view) {
                        var languages = RCloud.language.available_languages();
                        if(languages.indexOf(cell_model.language())<0)
                            languages.push(cell_model.language());
                        return that.create_select(languages, function(language) {
                            cell_model.parent_model.controller.change_cell_language(cell_model, language);
                            cell_view.clear_result();
                        });
                    }
                },
                run: {
                    area: 'cell',
                    sort: 2000,
                    create: function(cell_model,cell_view) {
                        return that.create_button("icon-play", "run", function() {
                            cell_view.execute_cell();
                        });
                    }
                },
                edit: {
                    area: 'cell',
                    sort: 3000,
                    modifying: true,
                    create: function(cell_model, cell_view) {
                        return that.create_button("icon-edit", "toggle edit", function() {
                            cell_view.toggle_edit();
                        });
                    }
                },
                gap: {
                    area: 'cell',
                    sort: 3500,
                    create: function(cell_model) {
                        return that.create_gap();
                    }
                },
                split: {
                    area: 'cell',
                    sort: 4000,
                    modifying: true,
                    create: function(cell_model, cell_view) {
                        return that.create_button("icon-unlink", "split cell", function() {
                            var ace_widget = cell_view.ace_widget();
                            var range = ace_widget.getSelection().getRange();
                            var point1, point2;
                            point1 = ui_utils.character_offset_of_pos(ace_widget, range.start);
                            if(!range.isEmpty())
                                point2 = ui_utils.character_offset_of_pos(ace_widget, range.end);
                            shell.split_cell(cell_model, point1, point2);
                        });
                    }
                },
                remove: {
                    area: 'cell',
                    sort: 5000,
                    modifying: true,
                    create: function(cell_model) {
                        return that.create_button("icon-trash", "remove", function() {
                            cell_model.parent_model.controller.remove_cell(cell_model);
                        });
                    }
                },
                insert_prompt: {
                    area: 'prompt',
                    modifying: true,
                    sort: 1000
                },
                language_prompt: {
                    area: 'prompt',
                    modifying: true,
                    sort: 2000
                }
            });
            return this;
        },
        add: function(commands) {
            // extend commands_ by each command in commands, with defaults
            for(var key in commands)
                commands_[key] = _.extend(_.extend({key: key}, defaults_), commands[key]);

            // update the lists of commands (for quick access)
            above_between_commands_ = _.filter(commands_, function(command) {
                return command.area === 'above' || command.area === 'between';
            });
            cell_commands_ = _.filter(commands_, function(command) {
                return command.area === 'cell';
            });
            prompt_commands_ = _.filter(commands_, function(command) {
                return command.area === 'prompt';
            });
            [above_between_commands_, cell_commands_, prompt_commands_].forEach(function(set) {
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
        decorate_above_between: function(area, cell_model, cell_view) {
            // commands for above and between cells
            var result = create_command_set(area, above_between_commands_, cell_model, cell_view);
            _.extend(result, {
                betweenness: function(between) {
                    above_between_commands_.forEach(function(cmd) {
                        if(cmd.area === 'between') {
                            if(between)
                                result.controls[cmd.key].control.show();
                            else
                                result.controls[cmd.key].control.hide();
                        }
                    });
                }
            });
            return result;
        },
        decorate_cell: function(area, cell_model, cell_view) {
            return create_command_set(area, cell_commands_, cell_model, cell_view);
        }
    };
    return result;
})();
