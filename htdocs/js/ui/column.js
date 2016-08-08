RCloud.UI.column = function(sel_column) {
    var colwidth_;
    function classes(cw) {
        return "col-md-" + cw + " col-sm-" + cw;
    }
    var result = {
        init: function() {
            var $sel = $(sel_column);
            if($sel.length === 0)
                return; // e.g. view mode
            // find current column width from classes
            var classes = $sel.attr('class').split(/\s+/);
            classes.forEach(function(c) {
                var cw = /^col-(?:md|sm)-(\d+)$/.exec(c);
                if(cw) {
                    cw = +cw[1];
                    if(colwidth_ === undefined)
                        colwidth_ = cw;
                    else if(colwidth_ !== cw)
                        throw new Error("mismatched col-md- or col-sm- in column classes");
                }
            });
        },
        colwidth: function(val) {
            if(!_.isUndefined(val) && val != colwidth_) {
                $(sel_column).removeClass(classes(colwidth_)).addClass(classes(val));
                colwidth_ = val;
            }
            return colwidth_;
        }
    };
    return result;
};

RCloud.UI.collapsible_column = function(sel_column, sel_accordion, sel_collapser) {
    var collapsed_ = false;
    var result = RCloud.UI.column(sel_column);
    var parent_init = result.init.bind(result);
    var parent_colwidth = result.colwidth.bind(result);
    function collapsibles() {
        return $(sel_accordion + " > .panel > div.panel-collapse:not(.out)");
    }
    function togglers() {
        return $(sel_accordion + " > .panel > div.panel-heading");
    }
    function set_collapse(target, collapse, persist) {
        if(target.data("would-collapse") == collapse)
            return false;
        target.data("would-collapse", collapse);
        if(persist && rcloud.config && target.length) {
            var opt = 'ui/' + target[0].id;
            rcloud.config.set_user_option(opt, collapse);
        }
        return true;
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
    function reshadow() {
        $(sel_accordion + " .panel-shadow").each(function(v) {
            var h = $(this).parent().find('.panel-body').outerHeight();
            if (h === 0)
                h = "100%";
            $(this).attr("height", h);
        });
    }
    _.extend(result, {
        init: function() {
            var that = this;
            parent_init();
            collapsibles().each(function() {
                $(this).data("would-collapse", !$(this).hasClass('in') && !$(this).hasClass('out'));
            });
            togglers().click(function() {
                var target = $(this.dataset.target);
                that.collapse(target, target.hasClass('in'));
                return false;
            });
            collapsibles().on("size-changed", function() {
                that.resize(true);
            });
            $(sel_collapser).click(function() {
                if (collapsed_)
                    that.show(true);
                else
                    that.hide(true);
            });
        },
        load_options: function() {
            var that = this;
            var sels = $.makeArray(collapsibles()).map(function(el) { return '#' + el.id; });
            sels.push(sel_accordion);
            var opts = sels.map(sel_to_opt);
            return rcloud.config.get_user_option(opts)
                .then(function(settings) {
                    var hide_column;
                    for(var k in settings) {
                        var id = opt_to_sel(k);
                        if(id === sel_accordion)
                            hide_column = settings[k];
                        else if(typeof settings[k] === "boolean")
                            set_collapse($(id), settings[k], false);
                    }
                    // do the column last because it will affect all its children
                    var save_setting = false;  // make sure we have a setting
                    if(hide_column === undefined) {
                        hide_column = false;
                        save_setting = true;
                    }
                    if(hide_column)
                        that.hide(save_setting);
                    else
                        that.show(save_setting);
                });
        },
        colwidth: function(val) {
            val = parent_colwidth(val);
            collapsibles().trigger('panel-resize');
            return val;
        },
        collapse: function(target, whether, persist) {
            if(persist === undefined)
                persist = true;
            if(collapsed_) {
                collapsibles().each(function() {
                    if(this===target[0])
                        set_collapse($(this), false, persist);
                    else
                        set_collapse($(this), true, persist);
                });
                this.show(true);
                return;
            }
            var change = set_collapse(target, whether, persist);
            if(all_collapsed())
                this.hide(persist, !change);
            else
                this.show(persist, !change);
        },
        resize: function(skip_calc) {
            if(!skip_calc) {
                var cw = this.calcwidth();
                this.colwidth(cw);
            }
            RCloud.UI.middle_column.update();
            var heights = {}, padding = {}, cbles = collapsibles(), ncollapse = cbles.length;
            var greedy_one = null;
            cbles.each(function() {
                if(!$(this).hasClass("out") && !$(this).data("would-collapse")) {
                    var spf = $(this).data("panel-sizer");
                    var sp = spf ? spf(this) : RCloud.UI.collapsible_column.default_sizer(this);
                    heights[this.id] = sp.height;
                    padding[this.id] = sp.padding;
                    // remember the first greedy panel
                    if(!greedy_one && $(this).attr("data-widgetheight")==="greedy")
                        greedy_one = $(this);
                }
            });
            var available = $(sel_column).height();
            var total_headings = d3.sum($(sel_accordion + " .panel-heading")
                                        .map(function(_, ph) { return $(ph).outerHeight(); }));
            available -= total_headings;
            for(var id in padding)
                available -= padding[id];
            var left = available, do_fit = false;
            for(id in heights)
                left -= heights[id];
            if(left>=0) {
                // they all fit, now just give the rest to greedy one (if any)
                if(greedy_one !== null) {
                    heights[greedy_one.get(0).id] += left;
                    do_fit = true;
                }
            }
            else {
                // they didn't fit
                left = available;
                var remaining = _.keys(heights),
                    done = false, i;
                var split = left/remaining.length;

                // see which need less than an even split and be done with those
                while(remaining.length && !done) {
                    done = true;
                    for(i = 0; i < remaining.length; ++i)
                        if(heights[remaining[i]] < split) {
                            left -= heights[remaining[i]];
                            remaining.splice(i,1);
                            --i;
                            done = false;
                        }
                    split = left/remaining.length;
                }
                // split the rest among the remainders
                for(i = 0; i < remaining.length; ++i)
                    heights[remaining[i]] = split;
                do_fit = true;
            }
            for(id in heights) {
                $('#' + id).find(".panel-body").height(heights[id]);
                $('#' + id).trigger('panel-resize');
            }
            reshadow();
            var expected = $(sel_column).height();
            var got = d3.sum(_.values(padding)) + d3.sum(_.values(heights)) + total_headings;
            if(do_fit && expected != got)
                console.log("Error in vertical layout algo: filling " + expected + " pixels with " + got);
        },
        hide: function(persist, skip_calc) {
            collapsibles().each(function() {
                var heading_sel = $(this).data('heading-content-selector');
                if(heading_sel) {
                    heading_sel.hide();
                }
            });
            // all collapsible sub-panels that are not "out" and not already collapsed, collapse them
            $(sel_accordion + " > .panel > div.panel-collapse:not(.collapse):not(.out)").collapse('hide');
            $(sel_collapser + " i").removeClass("icon-minus").addClass("icon-plus");
            $(sel_collapser).attr('title', 'Expand Pane');
            collapsed_ = true;
            this.resize(skip_calc);
            if(persist && rcloud.config)
                rcloud.config.set_user_option(sel_to_opt(sel_accordion), true);
        },
        show: function(persist, skip_calc) {
            collapsibles().each(function() {
                var heading_sel = $(this).data('heading-content-selector');
                if(heading_sel)
                    heading_sel.show();
            });
            if(all_collapsed())
                set_collapse($(collapsibles()[0]), false, true);
            collapsibles().each(function() {
                $(this).collapse($(this).data("would-collapse") ? "hide" : "show");
            });
            $(sel_collapser + " i").removeClass("icon-plus").addClass("icon-minus");
            $(sel_collapser).attr('title', 'Collapse Pane');
            collapsed_ = false;
            this.resize(skip_calc);
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


RCloud.UI.collapsible_column.default_padder = function(el) {
    var el$ = $(el),
        body$ = el$.find('.panel-body'),
        padding = el$.outerHeight() - el$.height() +
            body$.outerHeight() - body$.height();
    return padding;
};

RCloud.UI.collapsible_column.default_sizer = function(el) {
    var el$ = $(el),
        $izer = el$.find(".widget-vsize"),
        height = $izer.height(),
        padding = RCloud.UI.collapsible_column.default_padder(el);
    return {height: height, padding: padding};
};
