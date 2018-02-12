RCloud.UI.notebook_merger = (function() {

    var notebook_merger = class {
        constructor() {
            let that = this,
                _template = _.template($('#merger-template').html());

            this._diffEditor = null;
            this._diffNavigator = null;
            $('body').append(_template({}));
            this._dialog = $('#merger-dialog');
            this._previousDiffButton = $('#previous-diff');
            this._nextDiffButton = $('#next-diff');

            $(this._dialog).on('shown.bs.modal', () => {
                require(['vs/editor/editor.main'], function() {
                    that._diffEditor = monaco.editor.createDiffEditor($('#merge-container')[0], {
                        renderSideBySide: false,
                        language: 'r'
                    });
                    that.set_model();

                    that._diffNavigator = monaco.editor.createDiffNavigator(that._diffEditor, {
                        ignoreCharChange: true,
                        followsCaret: true
                    });
                });
            });

            $(this._dialog).on('hidden.bs.modal', () => {
                this.clear();
            });

            this._previousDiffButton.click(() => {
                this._diffNavigator.previous();
            });

            this._nextDiffButton.click(() => {
                this._diffNavigator.next();
            });
        }
        set_model() {
            this._diffEditor.setModel({
                original: monaco.editor.createModel([
                    'print("There was an Old Man with a beard")',
                    'print("Who said, "It is just as I feared!—")',
                    'print("Two Owls and a Hen, four Larks and a Wren,")',
                    'print("Have all built their nests in my beard.")'
                ].join('\n')),
                modified: monaco.editor.createModel([
                    'print("A bit of a silly limerick")',
                    'print("~~~~~~~~~~~~~~~~~~~~~~~~~")',
                    'print("There was an Old Woman with a beard")',
                    'print("Who said, "It is just as I feared!—")',
                    'print("Two Pigeons and a Hen, three Larks and a Wren,")',
                    'print("Have all built their nests in my beard.")', 
                    'print("")',
                    'print("Edward Lear")'
                ].join('\n'))
            });
        }
        clear() {
            this._diffEditor.dispose();
            $('#merge-container').children().remove();
        }
        show_dialog() {
            this._dialog.modal({keyboard: true});
        }
    }

    return notebook_merger;

})();
