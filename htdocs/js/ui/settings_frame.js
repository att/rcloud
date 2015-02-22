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
                        cancel();
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
                    return val.split(/, */).filter(function(x) { return !!x; });
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
                'addons': that.text_input_vector({
                    sort: 10000,
                    needs_reload: true,
                    needs_reload: true,
                    label: "Enable Extensions"
                }),
                'skip-addons': that.text_input_vector({
                    sort: 11000,
                    needs_reload: true,
                    needs_reload: true,
                    label: "Disable Extensions"
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
            rcloud.config.get_user_option(option_keys)
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

