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
                        info.click(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            var thisIcon = this;
                            var info_content = '';

                            Promise.all( [window.rcloud.protection.get_notebook_cryptgroup(node.gistname), 
                                        window.rcloud.stars.get_notebook_starrer_list(node.gistname)])
                            .spread(function(cryptogroup, list) {

                                if(typeof(list) === 'string')
                                    list = [list];

                                var close_button = '<span class="pop-close" style="cursor: pointer; float:right;">x</span>';
                                var group_message = '<div class="info-category"><b>Group:</b></div>';
                                if(!cryptogroup[0] && !cryptogroup[1]){
                                    group_message += '<div class="group-link"><a href="#">no group</a></div>'
                                }
                                else{
                                    group_message += '<div class="group-link"><a href="#">'+cryptogroup[1]+'</a></div>'
                                }

                                var starrer_list = '<div class="info-category"><b>Starred by:</b></div>';
                                list.forEach(function (v) {
                                    starrer_list = starrer_list + '<div class="info-item">' + v + '</div>';
                                });
                                info_content = close_button + group_message + info_content + starrer_list;
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
                                thisPopover = $(thisPopover);
                                thisPopover.addClass('popover-offset notebook-info');
                                


                                $('.pop-close', thisPopover).click(function() {
                                    $(thisIcon).popover("destroy");
                                });

                                $('.group-link', thisPopover).click(function(){

                                    //set 
                                    RCloud.UI.notebook_protection.notebookFullName = node.full_name;
                                    RCloud.UI.notebook_protection.notebookGistName = node.gistname;
                                    RCloud.UI.notebook_protection.notebookId = node.id;
                                    RCloud.UI.notebook_protection.tipEl = $(thisIcon).closest('.group-link');
                                    //console.dir(RCloud.UI.notebook_protection.tipEl);

                                    //groups

                                    if(!cryptogroup[0] && !cryptogroup[1]){
                                        RCloud.UI.notebook_protection.belongsToGroup = false;
                                        console.log('does not belong');
                                    }
                                    else{
                                        RCloud.UI.notebook_protection.belongsToGroup = true
                                        RCloud.UI.notebook_protection.currentGroupName = cryptogroup[1];
                                        console.log('does belong');
                                    }

                                    //show modal
                                    RCloud.UI.notebook_protection.init();
                                    //RCloud.UI.notebook_protection.showOverlay();

                            
                                });

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
