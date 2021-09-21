RCloud.UI.settings_frame = (function() {
    // options to fetch from server, with callbacks for what to do once we get them
    var options_ = {};
    var body_;
    // the controls, once they are created
    var controls_ = {};
    // are we currently setting option x?
    var now_setting_ = {};


    function set_option_noecho(key, value) {
        // we're about to call user code here, make sure we restore now_setting_
        // if it throws (but propagate the exception)
        try {
            now_setting_[key] = true;
            options_[key].set(value, controls_[key]);
        }
        catch(xep) {
            throw xep;
        }
        finally {
            now_setting_[key] = false;
        }
    }
    var result = {
        body: function() {
            return body_ = $.el.div({id: "settings-body-wrapper", 'class': 'panel-body'},
                            $.el.div({id: "settings-scroller", style: "width: 100%; height: 100%; overflow-x: auto"},
                                    $.el.div({id:"settings-body", 'class': 'widget-vsize'})),
                            $.el.span({class: "settings-reload-msg", style: "display: none"}, "Reload to see changes"));
        },
        panel_sizer: function(el) {
            // fudge it so that it doesn't scroll 4 nothing
            var sz = RCloud.UI.collapsible_column.default_sizer(el);
            return {height: sz.height+5, padding: sz.padding};
        },
        show_reload_msg: function(val) {
            if(val)
                $(body_).find('.settings-reload-msg').show();
            else
                $(body_).find('.settings-reload-msg').hide();
        },
        checkbox: function(opts) {
            opts = _.extend({
                sort: 10000,
                default_value: false,
                needs_reload: false,
                label: "",
                id:"",
                set: function(val) {}
            }, opts);
            return {
                sort: opts.sort,
                default_value: opts.default_value,
                create_control: function(on_change) {
                    var check = $.el.input({type: 'checkbox'});
                    $(check).prop('id', opts.id);
                    var span = $.el.span(opts.label);
                    var label = $.el.label(check, span);
                    var checkboxdiv = $($.el.div({class: 'checkbox'}, label));
                    $(check).change(function() {
                        var val = $(this).prop('checked');
                        on_change(val);
                        if(opts.needs_reload)
                            result.show_reload_msg(true);
                        opts.set(val);
                    });
                    return checkboxdiv;
                },
                set: function(val, control) {
                    val = !!val;
                    control.find('input').prop('checked', val);
                    opts.set(val);
                }
            };
        },
        text_input: function(opts) {
            opts = _.extend({
                sort: 10000,
                default_value: "",
                needs_reload: false,
                label: "",
                id:"",
                parse: function(val) { return val; },
                format: function(val) { return val; },
                set: function(val) {}
            }, opts);
            return {
                sort: opts.sort,
                default_value: opts.default_value,
                create_control: function(on_change) {
                    var input = $.el.input({type: 'text', class: 'form-control-ext'});
                    $(input).prop('id', opts.id);
                    var span = $.el.span(opts.label);
                    var label = $.el.label(span, input);
                    var div = $($.el.div({class: 'settings-input'}, label));
                    function commit() {
                        var val = $(input).val();
                        if(val === div.data('original-value'))
                            return;
                        val = opts.parse(val);
                        on_change(val);
                        if(opts.needs_reload)
                            result.show_reload_msg(true);
                        opts.set(val);
                        val = opts.format(val);
                        $(input).val(val);
                        div.data('original-value', val);
                    }
                    function cancel() {
                        $(input).val(div.data('original-value'));
                    }
                    $(input).keydown(function(e) {
                        if(e.keyCode === $.ui.keyCode.ENTER)
                            commit();
                        else if(e.keyCode === $.ui.keyCode.ESCAPE)
                            cancel();
                    });
                    $(input).blur(function() {
                        commit();
                    });
                    return div;
                },
                set: function(val, control) {
                    opts.set(val);
                    val = opts.format(val);
                    control.find('input').val(val);
                    control.data('original-value', val);
                }
            };
        },
        text_input_vector: function(opts) {
            opts = _.extend({
                parse: function(val) {
                    return val.trim().split(/[, ]+/).filter(function(x) { return !!x; });
                },
                format: function(val) {
                    // might be devectorized by rserve.js
                    return val.join ? val.join(', ') : val;
                }
            }, opts);
            return this.text_input(opts);
        },
        init: function() {
            var that = this;
            this.add({
                'show-command-prompt': that.checkbox({
                    sort: 1000,
                    default_value: true,
                    label: "Show Command Prompt",
                    set: function(val) {
                        RCloud.UI.command_prompt.show_prompt(val);
                    }
                }),
                'show-terse-dates': that.checkbox({
                    sort: 2000,
                    default_value: true,
                    needs_reload: true,
                    label: "Show Terse Version Dates",
                    set: function(val) {
                        editor.set_terse_dates(val);
                    }
                }),
                'show-cell-numbers': that.checkbox({
                    sort: 3000,
                    default_value: true,
                    label: "Show Cell Numbers",
                    set: function(val) {
                        shell.notebook.controller.show_cell_numbers(val);
                    }
                }),
                'color-recent-notebooks-by-modification-date': that.checkbox({
                    sort: 3500,
                    default_value: false,
                    needs_reload: true,
                    label: "Color recent notebooks by modification date",
                    set: function(val) {
                        editor.color_recent_notebooks_by_modification_date(val);
                    }
                }),
                'show-folder-dates': that.checkbox({
                    sort: 3750,
                    default_value: false,
                    needs_reload: true,
                    label: "Show folder date for date ordered tree",
                    set: function(val) {
                        editor.set_show_folder_dates(val);
                    }
                }),
                'panel-layout-by-size': that.checkbox({
                    sort: 4000,
                    default_value: true,
                    needs_reload: true,
                    label: "Arrange panels by size"
                }),
                'clear-r-session-when-run-all': that.checkbox({
                    sort: 5000,
                    default_value: true,
                    label: "Clear R Session when entire notebook is run",
                    set: function(val) {
                        RCloud.UI.run_button.reset_on_run(val);
                    }
                }),
                'export-only-selected-cells': that.checkbox({
                    sort: 6000,
                    default_value: true,
                    label: "Export only selected cells",
                    set: function(val) {
                        RCloud.UI.import_export.export_only_selected_files(val);
                    }
                }),
                'autoactivate-cells': that.checkbox({
                    sort: 6400,
                    default_value: true,
                    label: "Auto-activate cells",
                    needs_reload: true
                }),
                'autoscroll-notebook-output': that.checkbox({
                    sort: 6500,
                    default_value: true,
                    label: "Autoscroll notebook",
                    set: function(val) {
                        shell.notebook.controller.autoscroll_notebook_output(val);
                    }
                }),
                'show-hidden-assets': that.checkbox({
                    sort: 6600,
                    default_value: false,
                    label: "Show hidden assets",
                    set: function(val) {
                        shell.notebook.model.show_hidden_assets(val);
                    }
                }),
                'addons': that.text_input_vector({
                    sort: 10000,
                    needs_reload: true,
                    label: "Enable Extensions"
                }),
                'skip-addons': that.text_input_vector({
                    sort: 11000,
                    needs_reload: true,
                    label: "Disable Extensions"
                }),
                'new-notebook-prefix': that.text_input({
                    sort: 12000,
                    label: "New Notebook Prefix",
                    default_value: editor.new_notebook_prefix(),
                    set: function(val) {
                        editor.new_notebook_prefix(val);
                    },
                    parse: function(val) {
                        // no monkey business: do not allow any empty parts in path, except the last one
                        return val.split('/')
                            .filter(function(x, i, a) { return i==a.length-1 || !Notebook.empty_for_github(x); })
                            .join('/');
                    }
                })
            });
        },
        add: function(S) {
            _.extend(options_, S);
        },
        remove: function(option_name) {
            delete options_[option_name];
        },
        load: function() {
            var that = this;
            var sort_controls = [];
            _.keys(options_).forEach(function(name) {
                var option = options_[name];
                controls_[name] = option.create_control(function(value) {
                    if(!now_setting_[name])
                        rcloud.config.set_user_option(name, value);
                });
                sort_controls.push({sort: option.sort, control: controls_[name]});
            });
            sort_controls = sort_controls.sort(function(a,b) { return a.sort - b.sort; });
            var body = $('#settings-body');
            for(var i=0; i<sort_controls.length; ++i)
                body.append(sort_controls[i].control);

            var option_keys = _.keys(options_);
            if(option_keys.length === 1)
                option_keys.push("foo"); // evade rcloud scalarizing
            return rcloud.config.get_user_option(option_keys)
                .then(function(settings) {
                    for(var key in settings) {
                        if(key==="foo" || key==='r_attributes' || key==='r_type')
                            continue;
                        var value = settings[key] !== null ?
                                settings[key] :
                                options_[key].default_value;
                        set_option_noecho(key, value);
                    }
                });
        }
    };
    return result;
})();

