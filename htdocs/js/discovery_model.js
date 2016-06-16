RCloud.discovery_model = function () {

    var notebooks_ = {};

    return {
        get_notebooks : function(notebook_ids) {

            var promise;
            notebook_ids = _.filter(notebook_ids, function(id) { return id.length && id[0] !== 'r'; });

            // get only the items that we don't currently have:
            var ids = _.difference(notebook_ids, Object.keys(notebooks_));

            if(ids.length) {

                // temp code for forks:
                promise = Promise.all(
                    ids.map(function(id) { return rcloud.get_fork_count(id); })
                ).then(function(forks) {

                    return Promise.all([
                        rcloud.get_multiple_notebook_infos(ids),
                        rcloud.stars.get_multiple_notebook_star_counts(ids),
                        rcloud.stars.get_my_starred_notebooks()
                    ]).spread(function(notebooks, stars, my_starred_notebooks) {

                        // notebooks:
                        _.extend(notebooks_, notebooks);

                        // stars:
                        _.each(Object.keys(stars), function(notebook_id){
                            notebooks_[notebook_id].stars = stars[notebook_id];
                        });

                        // has the current user starred it?
                        _.each(my_starred_notebooks, function(notebook_id) {
                            if(notebooks_[notebook_id]) {
                                notebooks_[notebook_id].is_starred_by_me = true;
                            }
                        });

                        // fork count (temp):
                        _.each(Object.keys(stars), function(notebook_id){
                            notebooks_[notebook_id].forks = 1;
                        });

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
