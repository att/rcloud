RCloud.UI.settings_frame = (function() {
    var result = {
        body: function() {
            return $.el.div({id: "settings-body-wrapper", 'class': 'panel-body'},
                           $.el.div({id: "settings-scroller", style: "width: 100%; height: 100%; overflow-x: auto"},
                                    $.el.div({id:"settings-body", 'class': 'widget-vsize'})));
        },
        init: function() {
            var that = this;
            var body = $('#settings-body');
            // options to fetch from server, with callbacks for what to do once we get them
            var options = {};
            var prompt_option = $.el.input({type: 'checkbox'}, "Show Command Prompt");
            options['show-command-prompt'] = {
                default: true,
                set: function(val) {
                    prompt_option.val(val);
                    RCloud.UI.command_prompt.show_prompt = val;
                }
            };
            body.append(prompt_option);
            var option_keys = _.keys(options);
            rcloud.config.get_user_option(option_keys)
                .then(function(settings) {
                    for(var k in settings) {
                        if(settings[k] !== undefined)
                            options[k].set(settings[k]);
                        else
                            options[k].set(options[k].default);
                    }
                });
        }
    };
    return result;
})();

