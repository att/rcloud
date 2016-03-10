RCloud.UI.shortcut_dialog = (function() {

    var content_, shortcuts_by_category_ = [], shortcut_dialog_;

    var result = {

        show: function() {
           
            $('#loading-animation').hide();

            if(!shortcut_dialog_) {              
                shortcut_dialog_ = $('<div id="shortcut-dialog" class="modal fade" />')
                    .append($('<div class="modal-dialog" />')
                            .append($('<div class="modal-content" style="background-color: rgba(255, 255, 255, 0.9)" />')
                                    .append($('<div class="modal-header" style="padding-left:20px!important;padding-right:20px!important" />')
                                        .append($('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'))
                                        .append($('<h4 class="modal-title" style="font-size: 20px">Keyboard Shortcuts</h4>')))
                                    .append($('<div class="modal-body" style="padding-top: 0; max-height:calc(100vh - 220px); overflow-y: auto;" />'))
                                    .append($('<div class="modal-footer" />')
                                        .append($('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>')))));
                                       
                $("body").append(shortcut_dialog_);
            } 

            if(!content_ || RCloud.UI.shortcut_manager.shortcuts_changed()) {
                shortcuts_by_category_ = RCloud.UI.shortcut_manager.get_registered_shortcuts_by_category();

                content_ = '';

                _.each(shortcuts_by_category_, function(group) {

                    content_ += '<h3>' + group.category + '</h3>';

                    _.each(group.shortcuts, function(shortcut) {
                        content_ += '<p class="shortcut-item"><span class="shortcut">' + shortcut.bindings.join(', ') + '</span>  ' + shortcut.description + '</p>';
                    });
                });

                $('#shortcut-dialog .modal-body').html(content_);
            }
            
            shortcut_dialog_.modal({ 
                keyboard: false 
            });
        }
    };

    return result;

})();