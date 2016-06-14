var discover = function () {
    
    var notebooks_ = {};

    return {
        get_notebooks : function(notebook_ids) {

            var promise = Promise.resolve(),
                notebook_ids = _.filter(notebook_ids, function(id) { return id[0] !== 'r' });

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
                // get notebooks' info:
                promise = promise.then(function() {
                    return rcloud.get_multiple_notebook_infos(ids);
                }).then(function(notebooks) {
                    _.extend(notebooks_, notebooks);
                    return rcloud.stars.get_multiple_notebook_star_counts(ids);
                }).then(function(stars) {

                    _.each(Object.keys(stars), function(notebook_id){ 
                        notebooks_[notebook_id].stars = stars[notebook_id];
                    });

                    // todo: get forks:
                    return [];
                    // /todo

                }).then(function(forks) {

                    // temporary fork count:
                    _.each(notebook_ids, function(notebook_id){ 
                        if(notebooks_[notebook_id]) {
                            notebooks_[notebook_id].forks = 1;
                        }
                    });

                    // construct the notebooks to return:
                    return Promise.resolve(get_(notebook_ids));

                });
            } else {
                return Promise.resolve(get_(notebook_ids));
            }
           
            return promise;
        }
    };
}();
