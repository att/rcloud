RCloud.UI.notebook_commands = (function() {
    var info_popover_ = null; // current opened information popover
    var icon_style_ = {'line-height': '90%'};

    //for hiding information popover on click outside
    $('body').on('click', function(e) {
        if(info_popover_ &&
           $(e.target).data('toggle') !== 'popover' &&
           $(e.target).parents('.popover.in').length === 0) {
            info_popover_.popover('destroy');
            info_popover_ = null;
        }
    });
    var result = {
        decorate: function($li, node, right) {
            if(node.gistname && !node.version) {
                var adder = function(target) {
                    var lst = [];
                    function add(items) {
                        lst.push(document.createTextNode(String.fromCharCode(160)));
                        lst.push.apply(lst, arguments);
                    }
                    add.commit = function() {
                        target.append.apply(target, lst);
                    };
                    return add;
                };
                // commands for the right column, always shown
                var always = $($.el.span({'class': 'notebook-commands-right'}));
                var add_buttons = adder(always);
                var star_style = _.extend({'font-size': '80%'}, icon_style_);
                var states = {true: {'class': 'icon-star', title: 'unstar'},
                              false: {'class': 'icon-star-empty', title: 'star'}};
                var state = editor.i_starred(node.gistname);
                var star_unstar = ui_utils.fa_button(states[state]['class'],
                                                     function(e) { return states[state].title; },
                                                     'star',
                                                     star_style,
                                                     true);
                // sigh, ui_utils.twostate_icon should be a mixin or something
                // ... why does this code exist?
                star_unstar.click(function(e) {
                    e.preventDefault();
                    e.stopPropagation(); // whatever you do, don't let this event percolate
                    var new_state = !state;
                    editor.star_notebook(new_state, {gistname: node.gistname, user: node.user});
                });
                star_unstar[0].set_state = function(val) {
                    state = !!val;
                    $(this).find('i').attr('class', states[state].class);
                };
                star_unstar.append($.el.sub(String(editor.num_stars(node.gistname))));
                add_buttons(star_unstar);

                add_buttons.commit();
                right.append(always);

                // commands that appear
                var appear = $($.el.span({'class': 'notebook-commands appear'}));
                add_buttons = adder(appear);
                //information icon
                var info = ui_utils.fa_button('icon-info-sign', 'notebook info', 'info', icon_style_, false);
                info.click(function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var thisIcon = this;
                    var info_content = '';
                    if(info_popover_) {
                        info_popover_.popover('destroy');
                        info_popover_ = null;
                    }
                    rcloud.stars.get_notebook_starrer_list(node.gistname).then(function(list) {
                        if(typeof(list) === 'string')
                            list = [list];
                        var starrer_list = '<div class="info-category"><b>Starred by:</b></div>';
                        list.forEach(function (v) {
                            starrer_list = starrer_list + '<div class="info-item">' + v + '</div>';
                        });
                        info_content = info_content + starrer_list;
                        $(thisIcon).popover({
                            title: node.name,
                            html: true,
                            content: info_content,
                            container: 'body',
                            placement: 'right',
                            animate: false,
                            delay: {hide: 0}
                        });
                        $(thisIcon).popover('show');
                        var thisPopover = $(thisIcon).popover().data()['bs.popover'].$tip[0];
                        $(thisPopover).addClass('popover-offset');
                        info_popover_ = $(thisIcon);
                    });
                });
                add_buttons(info);
                if(true) { // all notebooks have history - should it always be accessible?
                    var current = editor.current();
                    var disable = current.notebook===node.gistname && current.version;
                    var history = ui_utils.fa_button('icon-time', 'history', 'history', icon_style_, true);
                    // jqtree recreates large portions of the tree whenever anything changes
                    // so far this seems safe but might need revisiting if that improves
                    if(disable)
                        history.addClass('button-disabled');
                    history.click(function() {
                        ui_utils.fake_hover(node);
                        if(!disable) {
                            editor.show_history(node, true);
                        }
                        return false;
                    });

                    add_buttons(history);
                }
                if(node.user===editor.username()) {
                    var make_private = ui_utils.fa_button('icon-eye-close', 'make private', 'private', icon_style_, true),
                        make_public = ui_utils.fa_button('icon-eye-open', 'make public', 'public', icon_style_, true);
                    if(node.visible)
                        make_public.hide();
                    else
                        make_private.hide();
                    make_private.click(function() {
                        ui_utils.fake_hover(node);
                        if(node.user !== editor.username())
                            throw new Error("attempt to set visibility on notebook not mine");
                        else
                            editor.set_notebook_visibility(node.gistname, false);
                    });
                    make_public.click(function() {
                        ui_utils.fake_hover(node);
                        if(node.user !== editor.username())
                            throw new Error("attempt to set visibility on notebook not mine");
                        else
                            editor.set_notebook_visibility(node.gistname, true);
                        return false;
                    });
                    add_buttons(make_private, make_public);
                }
                if(node.user===editor.username()) {
                    var remove = ui_utils.fa_button('icon-remove', 'remove', 'remove', icon_style_, true);
                    remove.click(function(e) {
                        var yn = confirm("Do you want to remove '"+node.full_name+"'?");
                        if (yn) {
                            e.stopPropagation();
                            e.preventDefault();
                            editor.remove_notebook(node.user, node.gistname);
                            return false;
                        } else {
                            return false;
                        }
                    });
                    add_buttons(remove);
                }
                add_buttons.commit();
                appear.hide();
                always.append($.el.span({"class": "notebook-commands appear-wrapper"}, appear[0]));
                $li.find('*:not(ul)').hover(
                    function() {
                        var notebook_info = editor.get_notebook_info(node.gistname);
                        $('.notebook-commands.appear', this).show();
                        $('.notebook-date', this).css('visibility', 'hidden');
                    },
                    function() {
                        $('.notebook-commands.appear', this).hide();
                        $('.notebook-date', this).css('visibility', 'visible');
                    });
            }
        }
    };
    return result;
})();
