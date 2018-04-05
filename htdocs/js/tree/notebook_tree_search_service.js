
RCloud.UI.notebook_tree_search_service = (function() {

    var notebook_tree_search_service = function() {
        "use strict";
    };

    notebook_tree_search_service.prototype = {
        get_results: function(params) {
            // params.notebook
            // params.username
            return new Promise(function(resolve) {
                return rcloud.search_description(params.notebook).then(function(res) {                 
                    resolve(
                        _.map(res.response.docs, function(item) {
                            return {
                                id: item.id,
                                author: item.user,
                                name: item.description,
                                star_count: item.starcount,
                                updated_at: item.updated_at
                            }
                        }));
                });
            });
        }
    };

    return notebook_tree_search_service;

})();
