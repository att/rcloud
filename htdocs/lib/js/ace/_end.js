// restore true requirejs since ace clobbers global variable.
var global = (function() {
    return this;
})();
global.requirejs = old_requirejs;
global.require = old_require;

})();
