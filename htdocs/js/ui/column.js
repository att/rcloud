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
        // return $(sel_accordion + " > .panel > div.panel-heading > a.accordion-toggle");
        return $(sel_accordion + " > .panel > div.panel-heading");
    }
    function set_collapse(target, collapse, persist) {
        target.data("would-collapse", collapse);
        if(persist && rcloud.config) {
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
                // var target = $(this.hash);
                var target = $(this.dataset.target);
                that.collapse(target, target.hasClass('in'));
                return false;
            });
            $(sel_accordion).on("show.bs.collapse", function(e) {
                that.resize();
            });
            $(sel_accordion).on("hide.bs.collapse", function(e) {
                that.resize();
            });
            var shadow_sizer = function() {
                $(".panel-shadow").each(function(v) {
                    var h = $(this).parent().height();
                    if (h === 0)
                        h = "100%";
                    $(this).attr("height", h);
                });
            };
            $(sel_accordion).on("shown.bs.collapse", shadow_sizer);
            $(sel_accordion).on("reshadow", shadow_sizer);
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
                        set_collapse($(id), settings[k], false);
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
        collapse: function(target, whether, persist) {
            if(persist === undefined)
                persist = true;
            if(collapsed_) {
                set_collapse(target, false, persist);
                this.show(true);
                return;
            }
            set_collapse(target, whether, persist);
            if(all_collapsed())
                this.hide(persist);
            else
                this.show(persist);
        },
        resize: function() {
            var cw = this.calcwidth();
            this.colwidth(cw);
            RCloud.UI.middle_column.update();
            var heights = {}, cbles = collapsibles(), ncollapse = cbles.length;
            var greedy_one = null;
            cbles.each(function() {
                if(!$(this).hasClass("out") && !$(this).data("would-collapse"))
                    heights[this.id] = $(this).find(".widget-vsize:not(.out)").height();
                if($(this).attr("data-widgethdeight")=="greedy")
                    greedy_one = $(this);
            });
            var heading_height =  $(sel_accordion + " .panel-heading").height(); // height of first heading
            var available = window.innerHeight - 51 - ncollapse*heading_height;
            var id, left = available;
            for(id in heights)
                left -= heights[id];
            if(left>=0) {
                // they all fit, now just give the rest to the greedy one if any
                if(greedy_one != null) {
                    var h = heights[greedy_one.id().get(0).id] + left;
                    greedy_one.find(".panel-body").height(h);
                }
            }
            else {
                // they didn't fit
                var count = ncollapse, done = false;
                left = available;

                // see which need less than an even split and be done with those
                while(count && !done) {
                    var split = left/ncollapse;
                    done = true;
                    for(id in heights)
                        if(heights[id] < split) {
                            left -= heights[id];
                            --count;
                            delete heights[id];
                            done = false;
                        }
                }
                // split the rest among the remainders
                split = left/count;
                for(id in heights)
                    $(id).find(".panel-body").height(split);
            }
        },
        hide: function(persist) {
            // all collapsible sub-panels that are not "out" and not already collapsed, collapse them
            $(sel_accordion + " > .panel > div.panel-collapse:not(.collapse):not(.out)").collapse('hide');
            $(sel_collapser + " i").removeClass("icon-minus").addClass("icon-plus");
            collapsed_ = true;
            this.resize();
            if(persist && rcloud.config)
                rcloud.config.set_user_option(sel_to_opt(sel_accordion), true);
        },
        show: function(persist) {
            if(all_collapsed())
                set_collapse($(collapsibles()[0]), false, true);
            collapsibles().each(function() {
                $(this).collapse($(this).data("would-collapse") ? "hide" : "show");
            });
            $(sel_collapser + " i").removeClass("icon-plus").addClass("icon-minus");
            collapsed_ = false;
            this.resize();
            if(persist && rcloud.config)
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
