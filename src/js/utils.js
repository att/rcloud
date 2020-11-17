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

RCloud.utils.slow_promise = function(promise, sleep) {
    return new Promise(function(resolve, reject) {
        window.setTimeout(function() {
            promise.then(function(result) {
                resolve(result);
            }, function(error) {
                reject(error);
            });
        }, sleep);
    });
};

RCloud.utils.get_url_parameter = function(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
};

RCloud.utils.get_notebook_from_url = function(url) {
    var id = url.match(new RegExp('[?&]notebook=([^&#]*)'));
    return id && id[1];
};

RCloud.utils.clean_r = function(obj) {
    return _.omit(obj, 'r_type', 'r_attributes');
};

RCloud.utils.split_number = function(name) {
    var trnexp = /(\d+)$/;
    
    var res = trnexp.exec(name);
    if(!res) {
       return null;
    }
    
    return [name.slice(0, res.index), res[1]];
};

RCloud.utils.format_date_time_stamp = function(date, diff, is_date_same, for_version, show_terse_dates) {
    function pad(n) { return n<10 ? '0'+n : n; }

    var now = new Date();
    var time_part = '<span class="notebook-time">' + date.getHours() + ':' + pad(date.getMinutes()) + '</span>';
    var date_part = (date.getMonth()+1) + '/' + date.getDate();
    var year_part = date.getFullYear().toString().substr(2,2);

    if(diff < 24*60*60*1000 && is_date_same && show_terse_dates && for_version){
        return time_part;
    } else if(date.getFullYear() === now.getFullYear()) {
        return '<span>' + date_part + ' ' + time_part + '</span>';
    } else {
        return '<span>' + date_part + '/' + year_part + ' ' + time_part + '</span>';
    }
};

RCloud.utils.filter = function(items, conditions) {
    
    _.mixin({
        invokeWith: function() {
            var args = arguments;
            return function(fn) {
                 return fn.apply(null, args);
            };
        }
    });

    if(!_.isArray(items)) {
        items = [items];
    }

    return _.filter(items, _.compose(_.partial(_.all, conditions), _.invokeWith));
    
}
