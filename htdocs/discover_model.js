var discover = function () {
    
    var notebooks_ = {};

    return {
        get_notebooks : function(notebook_ids) {

            var promise = Promise.resolve(),
                notebook_ids = _.filter(notebook_ids, function(id) { return id.length && id[0] !== 'r' });

            var get_ = function(notebook_ids) {
                var notebooks = {};

                _.each(notebook_ids, function(id) {
                    notebooks[id] = notebooks_[id];
                });

                return notebooks;
            };

            // get only the items that we don't currently have:
            var ids = _.difference(notebook_ids, Object.keys(notebooks_));

            if(ids.length) {

                // temp code for forks:
                promise = Promise.all(
                    ids.map(function(id) { return rcloud.get_fork_count(id); })
                );

                promise = promise.then(function(forks) {

                    return Promise.all([
                        rcloud.get_multiple_notebook_infos(ids),
                        rcloud.stars.get_multiple_notebook_star_counts(ids)
                    ]).spread(function(notebooks, stars) {
                        
                        // notebooks:
                        _.extend(notebooks_, notebooks);

                        // stars:
                        _.each(Object.keys(stars), function(notebook_id){ 
                            notebooks_[notebook_id].stars = stars[notebook_id];
                            notebooks_[notebook_id].is_starred_by_me = true;
                        });

                        // fork count (temp):
                        _.each(Object.keys(stars), function(notebook_id){ 
                            notebooks_[notebook_id].forks = 1;
                        });

                    }).then(function() {
                        return Promise.resolve(get_(notebook_ids));
                    });
                });

            } else {
                promise = Promise.resolve(get_(notebook_ids));
            }
           
            return promise;
        }
    };
}();
