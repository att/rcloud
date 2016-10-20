RCloud.utils = {};

// Ways to execute promise in sequence, with each started after the last completes
RCloud.utils.promise_for = function(condition, action, value) {
    if(!condition(value))
        return value;
    return action(value).then(RCloud.utils.promise_for.bind(null, condition, action));
};

// like Promise.each but each promise is not *started* until the last one completes
RCloud.utils.promise_sequence = function(collection, operator) {
    return RCloud.utils.promise_for(
        function(i) {
            return i < collection.length;
        },
        function(i) {
            return operator(collection[i]).return(++i);
        },
        0);
};

RCloud.utils.get_url_parameter = function(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

RCloud.utils.get_notebook_from_url = function(url) {
    var id = url.match(new RegExp('[?&]notebook=([^&#]*)'));
    return id && id[1];
}