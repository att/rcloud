RCloud.discovery_model = function () {

    var notebooks_ = {};

    function clean_r(obj) {
        delete obj.r_attributes;
        delete obj.r_type;
        return obj;
    }

    function temp() {
        var deferred = Promise.pending();
        setTimeout(function(){
            deferred.resolve();
        }, 5000);
        return deferred.promise;
    }

    return {
        get_notebooks : function(anonymous, notebook_ids) {

            var promise;
            notebook_ids = _.filter(notebook_ids, function(id) { return id.length && id[0] !== 'r'; });

            // get only the items that we don't currently have:
            var ids = _.difference(notebook_ids, Object.keys(notebooks_));

            if(ids.length) {

                promise = Promise.all([
                    rcloud.get_multiple_notebook_infos(ids),
                    rcloud.stars.get_multiple_notebook_star_counts(ids),
                    anonymous ? Promise.resolve([]) : rcloud.stars.get_my_starred_notebooks(),
                    rcloud.get_multiple_fork_counts(ids),
                    temp()
                ]).spread(function(notebooks, stars, my_starred_notebooks, forks) {
                    notebooks = clean_r(notebooks);

                    // populate #stars/forks whether or not we got results
                    Object.keys(notebooks).forEach(function(id) {
                        notebooks[id].stars = stars[id] || 0;
                        notebooks[id].forks = forks[id] || 0;
                    });

                    _.extend(notebooks_, notebooks);

                    // has the current user starred it?
                    _.each(my_starred_notebooks, function(id) {
                        if(notebooks_[id])
                            notebooks_[id].is_starred_by_me = true;
                    });
                });

            } else {
                promise = Promise.resolve();
            }

            return promise.then(function() {
                return _.pick(notebooks_, notebook_ids);
            });
        }
    };
}();
