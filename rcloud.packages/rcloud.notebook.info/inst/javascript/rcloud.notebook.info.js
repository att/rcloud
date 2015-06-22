((function() {
    return {

        init: function(k) {

            RCloud.UI.notebook_commands.add({
                notebook_info: {
                    section: 'appear',
                    sort: 1000,
                    create: function(node) {
                        var info = ui_utils.fa_button('icon-info-sign', 'notebook info', 'info',
                                                    RCloud.UI.notebook_commands.icon_style(), false);
                        var popupOpen = false;

                        info.click(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            var thisIcon = this;
                            var info_content = '';

                            $(document).on('destroy_all_popovers', function(){
                                 $(info).popover('destroy');
                                 popupOpen = false;
                            })


                            Promise.all( [window.rcloud.protection.get_notebook_cryptgroup(node.gistname), 
                                        window.rcloud.stars.get_notebook_starrer_list(node.gistname)])
                            .spread(function(cryptogroup, list) {

                                info_content =  buildPopover();
                                function buildPopover(){
                                    if(typeof(list) === 'string')
                                        list = [list];

                                    var close_button = '<span class="pop-close" style="cursor: pointer; float:right;">x</span>';
                                    var group_message = '<div class="info-category"><b>Group:</b></div>';

                                    if(cryptogroup[0] === 'private'){
                                        group_message += '<div class="group-link info-item"><a href="#">private</a></div>'
                                    }
                                    else if(cryptogroup[0] !== null && cryptogroup[1] !== null){
                                        group_message += '<div class="group-link info-item"><a href="#">'+cryptogroup[1]+'</a></div>'
                                    }
                                    else{
                                        group_message += '<div class="group-link info-item"><a href="#">no group</a></div>'
                                    }
                                    var starrer_list = '<div class="info-category"><b>Starred by:</b></div>';
                                    list.forEach(function (v) {
                                        starrer_list = starrer_list + '<div class="info-item">' + v + '</div>';
                                    });
                                    return group_message + info_content + starrer_list;
                                };

                                $('html').off('mouseup');
                                $('html').on('mouseup', function(e) {
                                    if(!$(e.target).closest('.popover').length) {
                                        // $('.popover').each(function(){
                                        //     $(this).popover('destroy');
                                        // });
                                        $(document).trigger('destroy_all_popovers');
                                    }
                                });

                                if(!popupOpen){
                                    $(document).trigger('destroy_all_popovers');

                                    $(info).popover({
                                        title: node.name,
                                        html: true,
                                        content: info_content,
                                        container: 'body',
                                        placement: 'right',
                                        animate: false,
                                        delay: {hide: 0}
                                    });

                                    $(info).popover('show');
                                    var thisPopover = $(info).popover().data()['bs.popover'].$tip[0];
                                    thisPopover = $(thisPopover);
                                    thisPopover.addClass('popover-offset notebook-info');

                                    popupOpen = true;
                                }
                                else{
                                    $(document).trigger('destroy_all_popovers');
                                }

                                $('.group-link', thisPopover).click(function(){
                                    $(thisIcon).popover("destroy");

                                    RCloud.UI.notebook_protection.defaultNotebook = node;
                                    RCloud.UI.notebook_protection.defaultCryptogroup = cryptogroup;
                                    RCloud.UI.notebook_protection.init('both-tabs-enabled');
                                })
                            })
                        })
                        return info;
                    }
                }
            });
            k();
        }
    };
})()); /*jshint -W033 */ // no semi; this is an expression not a statement
