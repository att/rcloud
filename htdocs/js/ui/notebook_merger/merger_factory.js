RCloud.UI.merger_factory = (function() {

    let instance = null,
        merger_factory = class {
            constructor() {
                if(!instance) {
                    instance = new RCloud.UI.notebook_merger();
                }
                return instance;
            }
    }

    return merger_factory;

})();
