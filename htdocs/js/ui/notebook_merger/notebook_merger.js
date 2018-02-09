RCloud.UI.notebook_merger = (function() {

    var notebook_merger = class {
        constructor() {
            let that = this,
                _template = _.template($('#merger-template').html());

            this._diffEditor = null;
            $('body').append(_template({}));
            this._dialog = $('#merger-dialog');

            $(this._dialog).on('shown.bs.modal', () => {
                require(['vs/editor/editor.main'], function() {
                    that._diffEditor = monaco.editor.createDiffEditor($('#merge-container'));
                    that.set_model();
                });
            });

            $(this._dialog).on('hidden.bs.modal', () => {
                this.clear();
            });
        }
        set_model() {
            this._diffEditor.setModel({
                original: monaco.editor.createModel('line 1', 'javascript'),
                modified: monaco.editor.createModel('line 1 /* comment */', 'javascript'),
            });
        }
        clear() {
            $('#merge-container').children().remove();
        }
        show_dialog() {
            this._dialog.modal({keyboard: true});
        }
    }

    return notebook_merger;

})();
