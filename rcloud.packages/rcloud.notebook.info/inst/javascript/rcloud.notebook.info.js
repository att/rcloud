((function() {
    return {
        //console.log('launching the module');
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

                            $(document).on('destroy_all_popovers', function() {
                                 $(info).popover('destroy');
                                 popupOpen = false;
                            });

                            Promise.all([window.rcloud.protection.get_notebook_cryptgroup(node.gistname),
                                         window.rcloud.stars.get_notebook_starrer_list(node.gistname),
                                         window.rcloud.protection.has_notebook_protection()])
                            .spread(function(cryptogroup, list, has_prot) {

                                info_content =  buildPopover();
                                function buildPopover() {
                                    if(typeof(list) === 'string')
                                        list = [list];

                                    var close_button = '<span class="pop-close" style="cursor: pointer; float:right;">x</span>';

                                    //Display the current Notebook ID
                                    var getID = node.gistname;
                                    var displayID = '<div class="info-category"><b>ID: </b><i class="icon-copy clipboard-tooltip">\
                                                        <span class="clipboard-tooltip-text">Copy ID to Clipboard</span></i></div>' + getID;

                                    var group_message = '<div class="info-category"><b>Group:</b></div>';

                                    if(cryptogroup && cryptogroup.id === 'private' && cryptogroup.name === null)
                                        group_message += wrapGroupType('private');
                                    else if(cryptogroup)
                                        group_message += wrapGroupType(cryptogroup.name);
                                    else
                                        group_message += wrapGroupType('public');

                                    var starrer_list = '<div class="info-category"><b>Starred by:</b></div>';
                                    list.forEach(function (v) {
                                        starrer_list = starrer_list + '<div class="info-item">' + v + '</div>';
                                    });
                                    return displayID + group_message + info_content + starrer_list;
                                };

                                function wrapGroupType(name) {
                                    if(node.user === editor.username() && has_prot)
                                        return '<div class="group-link info-item"><a href="#">'+name+'</a></div>';
                                    else
                                        return '<div class="group-link info-item">'+name+'</div>';
                                };

                                $('html').off('mouseup');
                                $('html').on('mouseup', function(e) {
                                    if(!$(e.target).closest('.popover').length)
                                        $(document).trigger('destroy_all_popovers');
                                });

                                if(!popupOpen) {
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
                                    //hacky but will do for now
                                    if(!window.allPopovers) {
                                        window.allPopovers = [];
                                        window.allPopovers.push(info);
                                    }
                                    else{
                                        window.allPopovers.push(info);
                                    }

                                    var thisPopover = $(info).popover().data()['bs.popover'].$tip[0];
                                    thisPopover = $(thisPopover);
                                    thisPopover.addClass('popover-offset notebook-info');
                                    popupOpen = true;

                                    // Copy node.gistname to clipboard ready for merge dialogue.
                                    $('.icon-copy', thisPopover).click(function () {
                                        var copy = node.gistname;
                                        var copyClip = $('<input>').val(copy).appendTo('body').select();
                                        document.execCommand('copy');

                                        var tooltip = document.querySelector('.clipboard-tooltip-text');
                                        tooltip.innerHTML = "Copied Notebook ID";
                                    })
                                }
                                else {
                                    $(document).trigger('destroy_all_popovers');
                                }

                                $('.group-link', thisPopover).click(function(e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    $(thisIcon).popover("destroy");
                                    //if the user of this notebook is the same as current user
                                    if(node.user === editor.username() && has_prot) {
                                        RCloud.UI.notebook_protection.defaultNotebook = node;
                                        RCloud.UI.notebook_protection.defaultCryptogroup = cryptogroup;
                                        RCloud.UI.notebook_protection.init('both-tabs-enabled');
                                    }
                                });
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
