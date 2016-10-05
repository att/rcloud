RCloud.UI.import_export = (function() {
    function download_as_file(filename, content, mimetype) {
        var file = new Blob([content], {type: mimetype});
        saveAs(file, filename); // FileSaver.js
    }

    return {
        init: function() {
            RCloud.UI.advanced_menu.add({
                import_notebooks: {
                    sort: 4000,
                    text: "Import External Notebooks",
                    modes: ['edit'],
                    action: function() {
                        function do_import() {
                            var url = $('#import-source').val(),
                                notebooks = $('#import-gists').val(),
                                prefix = $('#import-prefix').val();

                            notebooks = _.without(notebooks.split(/[\s,;]+/), "");
                            rcloud.port_notebooks(url, notebooks, prefix)
                                .then(function(result) {
                                    var succeeded = [], failed = [];
                                    for(var res in result) {
                                        if(res==='r_type' || res==='r_attributes')
                                            continue; // R metadata
                                        if(result[res].ok)
                                            succeeded.push(result[res].content);
                                        else
                                            failed.push(res);
                                    }

                                    var promises = [];

                                    succeeded.forEach(function(notebook) {
                                        promises.push(editor.star_notebook(true, {notebook: notebook}).then(function() {
                                            return editor.set_notebook_visibility(notebook.id, true, function(){});
                                        }));
                                    });

                                    Promise.all(promises).then(function() {
                                        editor.highlight_imported_notebooks(succeeded);
                                    });
                                    
                                    if(failed.length)
                                        RCloud.UI.session_pane.post_error("Failed to import notebooks: " + failed.join(', '));
                                });
                            dialog.modal('hide');
                        }
                        function create_import_notebook_dialog() {
                            var body = $('<div class="container"/>').append(
                                $(['<p>Import notebooks from another GitHub instance.</p><p>Currently import does not preserve history.</p>',
                                   '<p>source repo api url:&nbsp;<input type="text" class="form-control-ext" id="import-source" style="width:100%;" value="https://api.github.com"></input></td>',
                                   '<p>notebooks:<br /><textarea class="form-control-ext" style="height: 20%;width: 50%;max-width: 100%" rows="10" cols="30" id="import-gists" form="port"></textarea></p>',
                                   '<p>prefix (e.g. <code>folder/</code> to put notebooks in a folder):&nbsp;<input type="text" class="form-control-ext" id="import-prefix" style="width:100%;"></input>'].join('')));

                            var cancel = $('<span class="btn btn-cancel">Cancel</span>')
                                    .on('click', function() { $(dialog).modal('hide'); });
                            var go = $('<span class="btn btn-primary">Import</span>')
                                    .on('click', do_import);
                            var footer = $('<div class="modal-footer"></div>')
                                    .append(cancel).append(go);
                            var header = $(['<div class="modal-header">',
                                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
                                            '<h3>Import Notebooks</h3>',
                                            '</div>'].join(''));
                            var dialog = $('<div id="import-notebooks-dialog" class="modal fade"></div>')
                                    .append($('<div class="modal-dialog"></div>')
                                            .append($('<div class="modal-content"></div>')
                                                    .append(header).append(body).append(footer)));
                            $("body").append(dialog);

                            // clear gists list but keep the other fields, to aide repetitive operations
                            dialog
                                .on('show.bs.modal', function() {
                                    $('#import-gists').val('');
                                })
                                .on('shown.bs.modal', function() {
                                    $('#import-source').focus().select();
                                });
                            return dialog;
                        }
                        var dialog = $("#import-notebooks-dialog");
                        if(!dialog.length)
                            dialog = create_import_notebook_dialog();
                        dialog.modal({keyboard: true});
                    }
                },
                export_notebook_gist: {
                    sort: 5000,
                    text: "Export Notebook to File",
                    modes: ['edit'],
                    action: function() {
                        return rcloud.get_notebook(shell.gistname(), shell.version(), null, true).then(function(notebook) {
                            notebook = Notebook.sanitize(notebook);
                            var gisttext = JSON.stringify(notebook);
                            download_as_file(notebook.description + ".gist", gisttext, 'text/json');
                            return notebook;
                        });
                    }
                },
                import_notebook_gist: {
                    sort: 6000,
                    text: "Import Notebook from File",
                    modes: ['edit'],
                    action: function() {
                        var that = this;
                        function create_import_file_dialog() {
                            var notebook = null;
                            var notebook_status = null;
                            var notebook_desc_content = null;
                            var import_button = null;
                            function do_upload(file) {
                                notebook_status.hide();
                                notebook_desc.hide();

                                Notebook.read_from_file(
                                    file, {
                                        on_load_end: function() {
                                            notebook_status.show();
                                        },
                                        on_error: function(message) {
                                            notebook_status.text(message);
                                        },
                                        on_notebook_parsed: function(read_notebook) {
                                            notebook = read_notebook;
                                            notebook_status.text('');
                                            notebook_desc_content.val(notebook.description);
                                            notebook_desc.show();
                                            ui_utils.enable_bs_button(import_button);
                                        }
                                    }
                                );
                            }
                            function do_import() {

                                var desc = notebook_desc_content.val();

                                if(notebook && desc.length > 0) {
                                    notebook.description = desc;

                                    rcloud.create_notebook(notebook, false).then(function(notebook) {
                                        editor.star_notebook(true, {notebook: notebook}).then(function() {
                                            editor.set_notebook_visibility(notebook.id, true);

                                            // highlight the node:
                                            editor.highlight_imported_notebooks(notebook);
                                        });
                                    });

                                    dialog.modal('hide');
                                }
                            }

                            var body = $('<div class="container"/>');
                            var file_select = $('<input type="file" id="notebook-file-upload" size="50"></input>');

                            file_select
                                .click(function() { 
                                    ui_utils.disable_bs_button(import_button); 
                                    [notebook_desc, notebook_status].forEach(function(el) { el.hide(); });
                                    file_select.val(null);
                                })
                                .change(function() { 
                                    do_upload(file_select[0].files[0]); 
                                });

                            notebook_status = $('<span />');
                            notebook_status.append(notebook_status);

                            var notebook_desc = $('<span>Notebook description: </span>');
                            notebook_desc_content = $('<input type="text" class="form-control-ext" size="50" id="import-notebook-description"></input>')
                                .on('change paste keyup', function(e) {

                                    var desc_length = $(this).val().length;

                                    if(desc_length) {
                                        ui_utils.enable_bs_button(import_button);
                                    } else {
                                        ui_utils.disable_bs_button(import_button);
                                    }

                                    if (e.which === $.ui.keyCode.ENTER && desc_length) {
                                        do_import();
                                        return false;
                                    } 

                                    return true;
                                });

                            notebook_desc.append(notebook_desc_content);
                            body.append($('<p/>').append(file_select))
                                .append($('<p/>').append(notebook_status.hide()))
                                .append($('<p/>').append(notebook_desc.hide()));
                            var cancel = $('<span class="btn btn-cancel">Cancel</span>')
                                    .on('click', function() { $(dialog).modal('hide'); });
                            import_button = $('<span class="btn btn-primary">Import</span>')
                                .on('click', do_import);

                            ui_utils.disable_bs_button(import_button);

                            var footer = $('<div class="modal-footer"></div>')
                                    .append(cancel).append(import_button);
                            var header = $(['<div class="modal-header">',
                                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
                                            '<h3>Import Notebook File</h3>',
                                            '</div>'].join(''));
                            var dialog = $('<div id="import-notebook-file-dialog" class="modal fade"></div>')
                                    .append($('<div class="modal-dialog"></div>')
                                            .append($('<div class="modal-content"></div>')
                                                    .append(header).append(body).append(footer)));
                            $("body").append(dialog);
                            dialog
                                .on('show.bs.modal', function() {
                                    $("#notebook-file-upload")[0].value = null;
                                    notebook_status.text('');
                                    notebook_status.hide();
                                    notebook_desc_content.val('');
                                    notebook_desc.hide();
                                });

                            // keep selected file, in case repeatedly importing is helpful
                            // but do reset Import button!
                            dialog.data("reset", function() {
                                notebook = null;
                                ui_utils.disable_bs_button(import_button);
                            });
                            return dialog;
                        }
                        var dialog = $("#import-notebook-file-dialog");
                        if(!dialog.length)
                            dialog = create_import_file_dialog();
                        else
                            dialog.data().reset();
                        dialog.modal({keyboard: true});
                    }
                },
                export_notebook_r: {
                    sort: 7000,
                    text: "Export Notebook as R Source File",
                    modes: ['edit'],
                    action: function() {
                        return rcloud.get_notebook(shell.gistname(), shell.version()).then(function(notebook) {
                            var strings = [];
                            var parts = [];
                            _.each(notebook.files, function(file) {
                                var filename = file.filename;
                                if(/^part/.test(filename)) {
                                    var number = parseInt(filename.slice(4).split('.')[0]);
                                    if(!isNaN(number)) {
                                        if (file.language === 'R')
                                            parts[number] = "```{r}\n" + file.content + "\n```";
                                        else
                                            parts[number] = file.content;
                                    }
                                }
                            });
                            for (var i=0; i<parts.length; ++i)
                                if (!_.isUndefined(parts[i]))
                                    strings.push(parts[i]);
                            strings.push("");
                            rcloud.purl_source(strings.join("\n")).then(function(purled_lines) {
                                // rserve.js length-1 array special case making our lives difficult again
                                var purled_source = _.isString(purled_lines) ? purled_lines :
                                        purled_lines.join("\n");
                                download_as_file(notebook.description + ".R", purled_source, 'text/plain');
                            });
                        });
                    }
                }
            });
            return this;
        }
    };
})();
