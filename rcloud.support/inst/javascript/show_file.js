// ({
//     show_file: function(v, k) {
//         var result, show_file;

//         function done() {
//             result = show_file.val();
//             dialog.modal('hide');
//             rcloud.allow_progress_modal();
//         }

//         function create_modal_dialog() {
//             var body = $('<div class="modal-body"></div>').append(prompt).append(show_file);

//             var header = $('  <div class="modal-header">\
//                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\
//                            <h3>File Display</h3>\
//                            </div>');
//             var cancel = $('<span class="btn">Cancel</span>')
//                     .on('click', function() { $(dialog).modal('hide'); });
//             var ok = $('<span class="btn btn-primary">OK</span>')
//                     .on('click', done);
//             var footer = $('<div class="modal-footer"></div>')
//                     .append(cancel).append(ok);
//             var dialog = $('<div id="show_file-dialog" class="modal fade"></div>')
//                     .append($('<div class="modal-dialog"></div>')
//                             .append($('<div class="modal-content"></div>')
//                                     .append(header).append(body).append(footer)));
//             $("body").append(dialog);
//             dialog
//                 .on('hide.bs.modal', function() {
//                     k(result);
//                 });
//         });

//         var dialog = $("#show_file-dialog");
//         if(!dialog.length)
//             dialog = create_modal_dialog();

//         rcloud.prevent_progress_modal();
//         dialog.modal({keyboard: true});
//     }
// })
