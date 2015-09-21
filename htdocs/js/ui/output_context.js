RCloud.UI.output_context = (function() {
    function create_context(selector) {
        var sel = $(selector);
        function appender(type) {
            function gen_wrapper(type) {
                switch(type) {
                case 'code':
                    return function(text) {
                        return $('<code></code>').append(text);
                    };
                case 'error':
                    return function(text) {
                        return $('<code style="color: crimson"></code>').append(text);
                    };
                case 'html':
                    return function(text) {
                        return text;
                    };
                default: throw new Error('unknown output type ' + type);
                }
            }
            var wrapper = gen_wrapper(type);
            return function(text) {
                sel.append(wrapper(text));
            };
        }
        return {
            end: function() {
                console.log('not expecting end on custom output context');
            },
            out: appender('code'),
            err: appender('error'),
            msg: appender('code'),
            html_out: appender('html'),
            selection_out: appender('html'),
            deferred_result: null, in: null
        };
    }
    return {
        create: function(selector) {
            var context = create_context(selector);
            var context_id = RCloud.register_output_context(context);
            return context_id;
        }
    };
})();
