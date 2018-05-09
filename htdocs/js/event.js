RCloud.UI.event = (function(sender) {

    var event = function(sender) {
        this._sender = sender;
        this._listeners = [];
    }

    event.prototype = {
        attach : function (listener) {
            this._listeners.push(listener);
        },
        notify : function (args) {
            var index;

            for (index = 0; index < this._listeners.length; index += 1) {
                this._listeners[index](this._sender, args);
            }
        }
    };

    return event;
    
})();
