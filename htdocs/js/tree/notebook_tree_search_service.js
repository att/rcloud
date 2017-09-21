var notebook_tree_search_service = function() {
    "use strict";
};

notebook_tree_search_service.prototype = {
    get_results: function(params) {
        // params.notebook
        // params.username
        return new Promise(function(resolve) {
            // for now, mock a response:

            var minimum = 100,
                maximum = 350;

            setTimeout(function() {
                resolve([
                    { id: '3c9b6e24acc14525b62d66ffffffffff', name: 'Notebook 1', author: 'aturing', star_count: 100 },            
                    { id: '3c9b6e24acc14525b62d66aa732d9c2d', name: 'Notebook 11', author: 'aeinstein', star_count: 601 },  
                    { id: '126db9c2e98b4c288e03a10c876cf709', name: 'Notebook 12', author: 'inewton', star_count: 16 },  
                    { id: 'ecac7dbd18174cf495d1ff729566ee58', name: 'Notebook 15', author: 'ggalilei', star_count: 2 },  
                    { id: 'c83a67f28859452a80c7dbeb476898f7', name: 'Notebook 16', author: 'mcurie', star_count: 81 },  
                    { id: '6d2f0d6e1d424423985edb3909199fb1', name: 'Notebook 18', author: 'cdarwin', star_count: 9 },  
                    { id: 'd1a91765543e4a8ea19d53e1fdb3963c', name: 'Notebook 101', author: 'lpasteur', star_count: 1 },  
                    { id: '3c442f49abe04d9f8b12906aa5eee695', name: 'Notebook 91', author: 'shawking', star_count: 12 },  
                    { id: '15ded6209ad8417b8bb4c36680f2e62e', name: 'Notebook 101', author: 'ncopernicus', star_count: 87 },  
                    { id: '3d3f6880fd344e5daca2993a4e686907', name: 'Notebook 717', author: 'tedison', star_count: 3 },  
                    { id: '27821e859d8c4d08b86a326a7e197071', name: 'Notebook 861', author: 'mfaraday', star_count: 86 }      
                ]);
            }, Math.floor(Math.random() * (maximum - minimum + 1)) + minimum);
            
        });
    }
};
