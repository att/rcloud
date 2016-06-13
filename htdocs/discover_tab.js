var discover = function () {

    /* "Model-Model-View-Controller"
     .. or something ..
     there are two models: the local state and the global rcs+github
     the local model is private data of this class
    */

    // local model (all caches of stuff stored in RCS/github)
    var notebook_info_ = {}, // all notebooks we are aware of
        num_stars_ = {}, // number of stars for all known notebooks
        fork_count_ = {};

    function clean_r(obj) { 
        delete obj.r_attributes; 
        delete obj.r_type; 
        return obj; 
    };

    function load_everything(){
        var allnotebooks = rcloud.config.get_all_notebook_info();

        var promises = [allnotebooks.then(function(notebooks) {
            // populate notebook infos
            notebook_info_ = clean_r(notebooks.infos);
        }),
        allnotebooks.then(function(notebooks) {
            // populate star counts
            num_stars_ = clean_r(notebooks.stars);
        }),
        allnotebooks.then(function(notebooks) {
            // populate fork counts
            fork_count_ = clean_r(notebooks.forks);
        })];

        return Promise.all(promises);
    }

    var result = {
        init: function() {
            var promise = load_everything();

            return promise;
        },

        get_notebook_info: function(gistname) {
            return notebook_info_[gistname] || {};
        },
        num_stars: function(gistname) {
            return num_stars_[gistname] || 0;
        },
        fork_count: function(gistname) {
            return fork_count_[gistname] || 0;
        }

    };
    return result;
}();
