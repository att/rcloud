RCloud.extension = (function() {
    return {
        create: function(options) {
            options = options || {};
            var entries_ = {};
            var sections_ = {};
            var defaults_ = options.defaults ? options.defaults : {};

            if(options.sections) {
                for(var key in options.sections)
                    sections_[key] = {filter: options.sections[key].filter};
            }
            else sections_.all = {};

            function recompute_sections() {
                for(key in sections_) {
                    sections_[key].entries = _.filter(entries_, function(entry) {
                        if(entry.disable)
                            return false;
                        return sections_[key].filter ? sections_[key].filter(entry) : true;
                    });
                    sections_[key].entries.sort(function(a, b) { return a.sort - b.sort; });
                }
            }

            return {
                add: function(entries) {
                    for(var key in entries)
                        entries_[key] = _.extend(_.extend({key: key}, defaults_), entries[key]);
                    recompute_sections();
                    return this;
                },
                remove: function(name) {
                    delete entries_[name];
                    recompute_sections();
                    return this;
                },
                disable: function(name, disable) {
                    if(entries_[name]) {
                        entries_[name].disable = disable;
                        recompute_sections();
                    }
                    return this;
                },
                get: function(name) {
                    return entries_[name];
                },
                entries: function(name) {
                    return sections_[name].entries;
                },
                create: function(name, _) {
                    var ret = {};
                    var args = Array.prototype.slice.call(arguments, 1);
                    this.entries(name).forEach(function(entry) {
                        ret[entry.key] = entry.create.apply(entry, args);
                    });
                    return ret;
                },
                sections: sections_
            };
        }
    };
})();

