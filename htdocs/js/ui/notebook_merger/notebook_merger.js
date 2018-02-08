RCloud.UI.notebook_merger = (function() {

    var notebook_merger = class {
        constructor() {
            console.log('creating a new notebook_merger.');
        }
        show_dialog() {
            require(['vs/editor/editor.main'], function() {

                // only do this once:

                var _template = _.template($('#merger-template').html());

                $('body').append(_template({
                }));
    
                var _dialog = $('#merger-dialog');

                $(_dialog).on('shown.bs.modal', function() {
                    var diffEditor = monaco.editor.createDiffEditor(document.getElementById('merge-container'));
            
                    //monaco.Promise.join([xhr('original.txt'), xhr('modified.txt')]).then(function(r) {
                        // var originalTxt = r[0].responseText;
                        // var modifiedTxt = r[1].responseText;
            
                        diffEditor.setModel({
                            original: monaco.editor.createModel('line 1', 'javascript'),
                            modified: monaco.editor.createModel('line 1 /* comment */', 'javascript'),
                        });

                    //});
                });

                _dialog.modal({keyboard: true});


            });

            function xhr(url) {
                var req = null;
                return new monaco.Promise(function(c,e,p) {
                    req = new XMLHttpRequest();
                    req.onreadystatechange = function () {
                        if (req._canceled) { return; }
        
                        if (req.readyState === 4) {
                            if ((req.status >= 200 && req.status < 300) || req.status === 1223) {
                                c(req);
                            } else {
                                e(req);
                            }
                            req.onreadystatechange = function () { };
                        } else {
                            p(req);
                        }
                    };
        
                    req.open("GET", url, true );
                    req.responseType = "";
        
                    req.send(null);
                }, function () {
                    req._canceled = true;
                    req.abort();
                });
            }
        }
    }

    return notebook_merger;

})();
