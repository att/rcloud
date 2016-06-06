RCloud.UI.shortcut_dialog = (function() {

    var content_, shortcuts_by_category_ = [], shortcut_dialog_;

    var result = {

        show: function() {

            $('#loading-animation').hide();

            if(!shortcut_dialog_) {
                shortcut_dialog_ = $('<div id="shortcut-dialog" class="modal fade" />')
                    .append($('<div class="modal-dialog" />')
                            .append($('<div class="modal-content" style="background-color: rgba(255, 255, 255, 1.0)" />')
                                    .append($('<div class="modal-header" style="padding-left:20px!important;padding-right:20px!important" />')
                                        .append($('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'))
                                        .append($('<h4 class="modal-title" style="font-size: 20px">Keyboard shortcuts</h4>')))
                                    .append($('<div class="modal-body" style="padding-top: 0; max-height:calc(100vh - 120px); overflow-y: auto;" />'))));

                $("body").append(shortcut_dialog_);
            }

            shortcuts_by_category_ = RCloud.UI.shortcut_manager.get_registered_shortcuts_by_category([
                'Code Editor',
                'Code Prompt',
                'Cell Management',
                'Notebook Management',
                'General']);

            content_ = '';

            _.each(shortcuts_by_category_, function(group) {

                content_ += '<div class="category">';
                content_ += '<h3>' + group.category + '</h3>';
                content_ += '<table>';

                _.each(group.shortcuts, function(shortcut) {

                    // if(!shortcut.keys.hasOwnProperty('win') && !shortcut.keys.hasOwnProperty('mac') && !shortcut.keys.hasOwnProperty('win_mac')) {
                    //     console.error('invalid shortcut: ', shortcut);
                    // }

                    var keys_markup = [];

                    _.each(shortcut.bind_keys, function(keys) {
                        keys_markup.push('<kbd>' + keys.join(' ') + '</kbd>');
                    });

                    content_ += '<tr>';
                    content_ += '<td>';
                    content_ += keys_markup.join(' / ');
                    content_ += '</td>';
                    content_ += '<td>';
                    content_ += shortcut.description;
                    content_ += '</td>';
                    content_ += '</tr>';
                });

                content_ += '</table>';
                content_ += '</div>';
            });

            $('#shortcut-dialog .modal-body').html(content_);

            shortcut_dialog_.modal({
                keyboard: false
            });
        }
    };

    return result;

})();
