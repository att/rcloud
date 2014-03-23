RCloud.UI.column = function(selector, colwidth) {
    function classes(cw) {
        return "col-md-" + cw + " col-sm-" + cw;
    }
    var result = {
        colwidth: function(val) {
            if(!_.isUndefined(val) && val != colwidth) {
                $(selector).removeClass(classes(colwidth)).addClass(classes(val));
                colwidth = val;
            }
            return colwidth;
        }
    };
    return result;
};
