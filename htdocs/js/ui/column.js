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
    var collapsed_ = false;
    var result = RCloud.UI.column(sel_column, colwidth);
    function collapsibles() {
        return $(sel_accordion + " > .panel > div.panel-collapse");
    }
    function togglers() {
        return $(sel_accordion + " > .panel > div.panel-heading > a.accordion-toggle");
    }
    function collapse(target, collapse, persist) {
        target.data("would-collapse", collapse);
        if(persist) {
            var opt = 'ui/' + target[0].id;
            rcloud.config.set_user_option(opt, collapse);
        }
    }
    function all_collapsed() {
        return $.makeArray(collapsibles()).every(function(el) {
            return $(el).hasClass('out') || $(el).data("would-collapse")===true;
        });
    }
    function sel_to_opt(sel) {
        return sel.replace('#', 'ui/');
    }
    function opt_to_sel(opt) {
        return opt.replace('ui/', '#');
    }
    _.extend(result, {
        init: function() {
            var that = this;
            collapsibles().each(function() {
                $(this).data("would-collapse", !$(this).hasClass('in') && !$(this).hasClass('out'));
            });
            togglers().click(function() {
                var target = $(this.hash);
                that.collapse(target, target.hasClass('in'));
                return false;
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
                if (collapsed_)
                    that.show(true);
                else
                    that.hide(true);
            });
        },
        load: function() {
            var that = this;
            var sels = $.makeArray(collapsibles()).map(function(el) { return '#' + el.id; });
            sels.push(sel_accordion);
            var opts = sels.map(sel_to_opt);
            rcloud.config.get_user_option(opts).then(function(settings) {
                var hide_column;
                for(var k in settings) {
                    var id = opt_to_sel(k);
                    if(id === sel_accordion)
                        hide_column = settings[k];
                    else if(typeof settings[k] === "boolean")
                        collapse($(id), settings[k], false);
                }
                // do the column last because it will affect all its children
                if(typeof hide_column === "boolean") {
                    if(hide_column)
                        that.hide(false);
                    else
                        that.show(false);
                }
                else that.show(true); // make sure we have a setting
            });
        },
        collapse: function(target, whether) {
            if(collapsed_) {
                collapse(target, false, true);
                this.show(true);
                return;
            }
            collapse(target, whether, true);
            if(all_collapsed())
                this.hide(true);
            else
                this.show(true);
        },
        resize: function() {
            var cw = this.calcwidth();
            console.log("resizing " + sel_column + " to " + cw);
            this.colwidth(cw);
            RCloud.UI.middle_column.update();
        },
        hide: function(persist) {
            // all collapsible sub-panels that are not "out" and not already collapsed, collapse them
            $(sel_accordion + " > .panel > div.panel-collapse:not(.collapse):not(.out)").collapse('hide');
            $(sel_collapser + " i").removeClass("icon-minus").addClass("icon-plus");
            collapsed_ = true;
            this.resize();
            if(persist)
                rcloud.config.set_user_option(sel_to_opt(sel_accordion), true);
        },
        show: function(persist) {
            if(all_collapsed())
                collapse($(collapsibles()[0]), false, true);
            collapsibles().each(function() {
                $(this).collapse($(this).data("would-collapse") ? "hide" : "show");
            });
            $(sel_collapser + " i").removeClass("icon-plus").addClass("icon-minus");
            collapsed_ = false;
            this.resize();
            if(persist)
                rcloud.config.set_user_option(sel_to_opt(sel_accordion), false);
        },
        calcwidth: function() {
            if(collapsed_)
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
