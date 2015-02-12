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
            this.add({
                rcloud: {
                    area: 'header',
                    sort: 1000,
                    create: function() {
                        return '<a class="navbar-brand" href="#">RCloud</a>';
                    }
                }
            });
        },
        add: function(commands) {
            extension_.add(commands);
            return this;
        },
        remove: function(command_name) {
            extension_.remove(command_name);
            return this;
        },
        load: function() {
            var items = extension_.create('header');
            var header = $('#rcloud-navbar-header');
            header.append.apply(header, _.values(items));
        }
    };
    return result;
})();
