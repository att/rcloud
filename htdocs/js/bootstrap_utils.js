var bootstrap = {};

bootstrap.alert = function(opts)
{
    opts = _.defaults(opts || {}, {
        close_button: true
    });
    var div = $('<div class="alert"></div>');
    if (opts.html) div.html(opts.html);
    if (opts.text) div.text(opts.text);
    if (opts['class']) div.addClass('alert-' + opts['class']);
    if (opts.close_button) 
        div.prepend($('<button type="button" class="close" data-dismiss="alert">&times;</button>'));
    return div;
};
