// restore true requirejs since ace clobbers global variables.
var global = (function() {
    return this;
})();
global.requirejs = old_requirejs;
global.require = old_require;
global.define = old_define;
})();
