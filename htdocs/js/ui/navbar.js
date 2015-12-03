RCloud.UI.navbar = (function() {
    var extension_;
    var result = {
        init: function() {
            extension_ = RCloud.extension.create({
                sections: {
                    header: {
                        filter: RCloud.extension.filter_field('area', 'header')
                    },
                    main: {
                        filter: RCloud.extension.filter_field('area', 'main')
                    }
                }
            });
            var header = $('#rcloud-navbar-header');
            header.empty().append('<a class="navbar-brand" href="#">RCloud</a>');
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
                var items = _.values(extension_.create('header')); // what about order?
                var header = $('#rcloud-navbar-header');
                if(items.length)
                    header.empty().append.apply(header, items);
            }
        }
    };
    return result;
})();
