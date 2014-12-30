((function() {
    var info_popover_ = null; // current opened information popover
    //for hiding information popover on click outside
    $('body').on('click', function(e) {
        if(info_popover_ &&
           $(e.target).data('toggle') !== 'popover' &&
           $(e.target).parents('.popover.in').length === 0) {
            info_popover_.popover('destroy');
            info_popover_ = null;
        }
    });
    return {
        init: function(k) {
            RCloud.UI.notebook_commands.add({
                notebook_info: {
                    section: 'appear',
                    sort: 1000,
                    create: function(node) {
                        var info = ui_utils.fa_button('icon-info-sign', 'notebook info', 'info',
                                                      RCloud.UI.notebook_commands.icon_style(), false);
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
                        return info;
                    }
                }
            });
            k();
        }
    };
})()) /*jshint -W033 */ // no semi; this is an expression not a statement
