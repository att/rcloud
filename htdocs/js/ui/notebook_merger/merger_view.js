RCloud.UI.merger_view = (function(model) {

  (function( $ ){
    $.fn.setMergerDialogStage = function(stage) {
      this.removeClass(Object.keys(model.DialogStage).map(key => `stage-${key.toLowerCase()}`).join(' '))
      this.addClass(`stage-${stage}`);
      return this;
    }; 
  })( jQuery );


  const merger_view = class {
    constructor(model) {
      this._model = model;

      let that = this,
          template = _.template($("#merger-template").html());

      this._templates = {
        file_list: _.template($('#compare-file-list-snippet').html()),
        compare_stage: _.template($('#compare-stage-snippet').html())
      };

      $("body").append(template({}));
      this._dialog = $("#merger-dialog");
      this._merge_method = $('#merge-changes-by');
      this._merge_notebook_file = $('#merge-notebook-file');
      this._merge_notebook_url = $('#merge-notebook-url');
      this._merge_notebook_id = $('#merge-notebook-id');

      this._compare_editor_selector = '#compare-editor';
      this._compare_result_selector = '#compare-result';

      this._previous_diff_button = $("#previous-diff");
      this._next_diff_button = $("#next-diff");
      this._error_selector = '#merge-error';

      this._merge_notebook_details = $('#merge-notebook-details');

      this._compare_file_list = $('#compare-file-list');
      this._compare_stage = $('#compare-stage');

      this._button_init = this._dialog.find('.btn-init');

      this._stageCssPrefix = 'stage-';
      
      this._btn_show_changes = this._dialog.find('.btn-primary.btn-primary.show-changes');
      this._inputs = [this._merge_notebook_file, this._merge_notebook_url, this._merge_notebook_id];
      this._notebook_from_file;

      this._diff_editor = null;
      this._diff_navigator = null;

      this._notebook_description;
      this._can_dispose = false;

      this._comparison = null;

      this._codelens_provider = null;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      //
      //
      //

      console.info('constructing a view...');

      this._btn_show_changes.click(() => {
        this._model.get_changes($(`#merge-notebook-${this._model.get_merge_method()}`).val());
      });

      this._button_init.click(() => {
        this._model.update_stage(this._model.DialogStage.INIT);
      });

      this._merge_method.change(() => {
        this._model.update_merge_method(this._merge_method.val());
      });

      $(this._dialog).on('hidden.bs.modal', () => {
        this.clear();
      });

      $(this._dialog).on('click', 'tbody tr:not(.selected)', (event) => {
        $(event.currentTarget).closest('table').find('tr').removeClass('selected');  
        $(event.currentTarget).addClass('selected');

        // for now, only comparison for 'common' files makes sense:
        this._model.set_comparison_as(
          $(event.currentTarget).data('filetype'),
          $(event.currentTarget).data('filename'));
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      //
      //
      //
      this._model.on_set_merge_source.attach((sender, args) => {
        this.clear_error();
        this._merge_method.val(args.type);

        $(this._dialog).find('div[data-by]').hide();
        $(this._dialog).find(`div[data-by="${args.type}"]`).show();

        if(!_.isUndefined(args.value)) {
          // and set the value coming in:
          $(`#merge-notebook-${this._model.get_merge_method()}`).val(args.type === 'file' ? '' : args.value);
        }

        this._dialog.modal({ keyboard: true });

      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_set_stage.attach((sender, args) => {
        if(args.stage == this._model.DialogStage.INIT) {
          this.reset_getting_changes_state();
          this._merge_notebook_details.html('');
          this._button_init.hide();
          this._can_dispose = false;
        }
        
        if(args.stage == this._model.DialogStage.COMPARE) {
          this._merge_notebook_details.html(`from ${this._model._notebook_description}`);
          this._button_init.show();
        } else {
          this._merge_notebook_details.html('');
        }

        // this.dialog_
        //   .removeClass(Object.keys(DialogStage).map(key => key.toLowerCase()).join(' '))
        //   .addClass(args.stage.toLowerCase());  
        // });

        this._dialog.setMergerDialogStage(args.stage.toLowerCase());
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_getting_changes.attach((sender, args) => {
        this.clear_error();
        this._btn_show_changes.text('Getting changes');
        this._dialog.setMergerDialogStage('gettingchanges');
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_get_changes_error.attach((sender, args) => {
        this._btn_show_changes.text('Show changes');
        this.show_error(args.message);
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_reset_complete.attach(() => {
        if(this._diff_editor && this._can_dispose) {
          this._diff_editor.dispose();
        }
  
        this._compare_file_list.html('');
  
        $("#merge-container")
          .children()
          .remove();
  
        this.reset_getting_changes_state();
  
        this._inputs.forEach((input) => {
            input.val('');
        });

        this._merge_notebook_details.html('');
        this._button_init.hide();
        this._dialog.setMergerDialogStage(this._model._dialog_stage);
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_comparison_complete.attach((sender, args) => {

        this._compare_file_list.html(this._templates.file_list({
          comparison: args.comparison
        }));
        this._compare_stage.html(this._templates.compare_stage({
  
        }));
    
        //window.process.getuid = window.process.getuid || function() { return 0; };
        require(["vs/editor/editor.main"], () => {  
          monaco.languages.register({
            id: 'rcloud'
          });
         
          this._diff_editor = monaco.editor.create(
            $(this._compare_editor_selector)[0],  
            {
              language: 'rcloud',
              fontSize: 11,
              scrollBeyondLastLine: false,
              minimap: {
                enabled: false
              }
            }
          );
        }); 
      });

      this._model.on_diff_complete.attach((sender, args) => {

        $(this._compare_editor_selector).show();
        this._diff_editor.setValue(args.diff.content);

        if(this.codelens_provider)
          this.codelens_provider.dispose();

        // deleted, added
        this._diff_editor.deltaDecorations([], _.map(args.diff.lineInfo, (li) => {
          return {
            range: new monaco.Range(li.startLine,1,li.endLine,1),
            options: {
              isWholeLine: true,
              className: li.diffType
            }
          } 
        }));

        const selectCurrentChanges = this._diff_editor.addCommand(0,() => alert('accepting'), '');
        const rejectCurrentChanges = this._diff_editor.addCommand(1,() => alert('rejecting'), ''); 

        this.codelens_provider = monaco.languages.registerCodeLensProvider('rcloud', {
          provideCodeLenses: function(model, token) {
              return _.flatten(_.map(args.diff.modifiedLineInfo, (li, index) => 
                [{
                  range: { startLineNumber: li.startLine },
                  id: 0,
                  command: {
                      id: selectCurrentChanges,
                      title: 'Accept',
                  },
                }, {
                  range: { startLineNumber: li.startLine },
                  id: 1,
                  command: {
                      id: rejectCurrentChanges,
                      title: 'Reject',
                  },
                }]))
          },
          resolveCodeLens: function(model, codeLens, token) {
              return codeLens;
            },
          },
        );

        this._can_dispose = true;

      });
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    //
    clear_error() {
      $(this._error_selector).remove();
    }

    show_error(errorText) {
      this.clear_error();
      $('<div />', {
        id: this._error_selector.substring(1),
        text: errorText
      }).appendTo($(this._dialog).find(`div[data-by="${this._model.get_merge_method()}"]`));
    }

    has_error() {
      return $(this._error_selector).length;
    }

    reset_getting_changes_state() {
      this._btn_show_changes.text('Show changes');
    }

    clear() {
      this._model.reset();
    }
  };

  return new merger_view(model);

});
