RCloud.UI.column = function(sel_column, colwidth) {
    function classes(cw) {
        return "col-md-" + cw + " col-sm-" + cw;
    }
    var result = {
        colwidth: function(val) {
            if(!_.isUndefined(val) && val != colwidth) {
                $(sel_column).removeClass(classes(colwidth)).addClass(classes(val));
                colwidth = val;
            }
            return colwidth;
        }
    };
    return result;
};

RCloud.UI.collapsible_column = function(sel_column, sel_accordion, sel_collapser, colwidth) {
    var result = RCloud.UI.column(sel_column, colwidth);
    function collapsibles() {
        return $(sel_accordion + " > .panel > div.panel-collapse");
    }
    function togglers() {
        return $(sel_accordion + " > .panel > div.panel-heading > a.accordion-toggle");
    }
    _.extend(result, {
        collapsed: false,
        init: function() {
            var that = this;
            collapsibles().each(function() {
                $(this).data("would-collapse", !$(this).hasClass('in'));
            });
            togglers().click(function() {
                var target = $(this.hash);
                if(that.collapsed) {
                    target.data("would-collapse", false);
                    that.show();
                    return false;
                }
                target.data("would-collapse", target.hasClass('in'));
                return true;
            });
            $(sel_accordion).on("show.bs.collapse", function(e) {
                that.resize();
            });
            $(sel_accordion).on("hide.bs.collapse", function(e) {
                that.resize();
            });
            $(sel_accordion).on("shown.bs.collapse", function() {
                $(".panel-shadow").each(function(v) {
                    var h = $(this).parent().height();
                    if (h === 0)
                        h = "100%";
                    $(this).attr("height", h);
                });
            });
            $(sel_collapser).click(function() {
                if (that.collapsed)
                    that.show();
                else
                    that.hide();
            });
        },
        resize: function() {
            var cw = this.calcwidth();
            console.log("resizing " + sel_column + " to " + cw);
            this.colwidth(cw);
            RCloud.UI.middle_column.update();
        },
        hide: function() {
            // all collapsible sub-panels that are not "out" and not already collapsed, collapse them
            $(sel_accordion + " > .panel > div.panel-collapse:not(.collapse):not(.out)").collapse('hide');
            $(sel_collapser + " i").removeClass("icon-minus").addClass("icon-plus");
            this.collapsed = true;
            this.resize();
        },
        show: function() {
            collapsibles().each(function() {
                if(!$(this).data("would-collapse"))
                    $(this).collapse("show");
            });
            $(sel_collapser + " i").removeClass("icon-plus").addClass("icon-minus");
            this.collapsed = false;
            this.resize();
        },
        calcwidth: function() {
            if(this.collapsed)
                return 1;
            var widths = [];
            collapsibles().each(function() {
                var width = $(this).data("would-collapse") ? 1 : $(this).attr("data-colwidth");
                if(width > 0)
                    widths.push(width);
            });
            return d3.max(widths);
        }
    });
    return result;
};
