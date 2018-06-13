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
        file_list: _.template($('#compare-file-list-snippet').html())
      };

      $("body").append(template({}));
      this._dialog = $("#merger-dialog");
      this._merge_source = $('#merge-changes-by');
      this._merge_notebook_file = $('#merge-notebook-file');
      this._merge_notebook_url = $('#merge-notebook-url');
      this._merge_notebook_id = $('#merge-notebook-id');

      this._compare_editor_selector = '#compare-editor';
      this._compare_diff_selector = '#compare-diff';
      this._single_editor_selector = '#single-editor';
      this._compare_result_selector = '#compare-result';

      this._compare_editor = null;
      this._compare_diff_editor = null;
      this._single_editor = null;
      this._diff_navigator = null;

      this._previous_diff_button = $("#previous-diff");
      this._next_diff_button = $("#next-diff");
      this._error_selector = '#merge-error';

      this._merge_notebook_details = $('#merge-notebook-details');

      this._compare_file_list = $('#compare-file-list');
      this._compare_stage = $('#compare-stage');
      this._compare_tabs = $('#compare-tabs');

      this._button_init = this._dialog.find('.btn-init');

      this._stageCssPrefix = 'stage-';

      this._editorTab = this._compare_stage.find('.nav-tabs a:first');
      this._compareDiffTabSelector = '#compare-diff-tab';

      this._btn_show_changes = this._dialog.find('.btn-primary.btn-primary.show-changes');
      this._inputs = [this._merge_notebook_file, this._merge_notebook_url, this._merge_notebook_id];
      this._notebook_from_file;

      this._can_dispose = false;

      this._comparison = null;

      this._codelens_provider = null;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      //
      //
      //
      this._btn_show_changes.click(() => {
        this._model.get_changes($(`#merge-notebook-${this._model.get_merge_source()}`).val());
      });

      this._button_init.click(() => {
        this._model.update_stage(this._model.DialogStage.INIT);
      });

      this._merge_source.change(() => {
        this._model.update_merge_source(this._merge_source.val());
      });

      $(this._dialog).on('hidden.bs.modal', () => {
        this.clear();
      });

      $(this._dialog).on('click', 'tbody tr' /*'tbody tr:not(.selected)'*/, (event) => {
        $(event.currentTarget).closest('table').find('tr').removeClass('selected');  
        $(event.currentTarget).addClass('selected');

        // for now, only comparison for 'common' files makes sense:
        this._model.set_comparison_as(
          $(event.currentTarget).data('filetype'),
          $(event.currentTarget).data('filename'));
      });

      $(this._dialog).on('click', 'tbody .add', (event) => {
        // TODO: raise event to exclude this file from coming in:
        $(event.currentTarget).closest('tr').toggleClass('excluded');
      });

      $(this._dialog).on('shown.bs.tab', 'a[data-toggle="tab"]', (e) => {
        if($(e.target).attr("href") === this._compareDiffTabSelector && !this._compare_diff_editor) {
          require(["vs/editor/editor.main"], () => {  
            this._compare_diff_editor = monaco.editor.createDiffEditor($(this._compare_diff_selector)[0], {
              scrollBeyondLastLine: false,
              fontSize: 11
            });
            this._compare_diff_editor.setModel({
              original: monaco.editor.createModel($(this._compare_diff_selector).data('original')),
              modified: monaco.editor.createModel($(this._compare_diff_selector).data('modified'))
            });
          }); 
        } else {
          if(this._compare_diff_editor) {
            this._compare_diff_editor.dispose();
            this._compare_diff_editor = null;
            $(this._compare_diff_selector).html('');
          }
        }
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      //
      //
      //
      this._model.on_set_merge_source.attach((sender, args) => {
        this.clear_error();
        this._merge_source.val(args.type);

        $(this._dialog).find('div[data-by]').hide();
        $(this._dialog).find(`div[data-by="${args.type}"]`).show();

        if(!_.isUndefined(args.value)) {
          // and set the value coming in:
          $(`#merge-notebook-${this._model.get_merge_source()}`).val(args.type === 'file' ? '' : args.value);
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
          this._merge_notebook_details.html(`from ${this._model._other_notebook_description}`);
          this._button_init.show();
        } else {
          this._merge_notebook_details.html('');
        }

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
        if(this._can_dispose) {
          [this._editor, this._compare_diff_editor, this._single_editor].forEach(c => { if(c) { c.dispose(); }});
        }
  
        this._compare_file_list.html('');
  
        $("#merge-container").children().remove();
  
        this.reset_getting_changes_state();
  
        this._inputs.forEach((input) => {
            input.val('');
        });

        this._merge_notebook_details.html('');
        this._button_init.hide();
        this._dialog.setMergerDialogStage(this._model._dialog_stage);
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_file_list_complete.attach((sender, args) => {

        this._dialog.setMergerDialogStage(this._model._dialog_stage);

        this._compare_file_list.html(this._templates.file_list({
          files: args.files
        }));
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_diff_complete.attach((sender, args) => {
   
        if(this.codelens_provider)
          this.codelens_provider.dispose();

        if(args.diff.isChanged) {

          let init = () => {
            $(this._compare_editor_selector).show();
            this._compare_editor.setValue(args.diff.content);
      
            this.updateReviewDecorations(args.diff.modifiedLineInfo);
    
            $(this._compare_diff_selector).data({
              original: args.owned,
              modified: args.other
            });
    
            this._can_dispose = true;
          };

          this._compare_tabs.show();
          $(this._single_editor_selector).hide();
          this._editorTab.tab('show');

          if(!this._compare_editor) {
            this._editorTab.tab('show');
    
            require(["vs/editor/editor.main"], () => {  
              monaco.languages.register({
                id: 'rcloud'
              });
            
              this._compare_editor = monaco.editor.create(
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

              this.apply_change = this._compare_editor.addCommand(0, (ctx, args) => {
                this._model.apply_review_change(args);
              });

              init();
            }); 
          } else {
            init();
          }


        } else {
          // show just the file that's either owned or yours:
          this._compare_tabs.hide();
          $(this._single_editor_selector).show();

          if(!this._single_editor) {
    
            require(["vs/editor/editor.main"], () => {  
              monaco.languages.register({
                id: 'rcloud'
              });
            
              this._single_editor = monaco.editor.create(
                $(this._single_editor_selector)[0],  
                {
                  language: 'rcloud',
                  fontSize: 11,
                  scrollBeyondLastLine: false,
                  minimap: {
                    enabled: false
                  },
                  readOnly: true
                }
              );

              this._single_editor.setValue(
                args.diff.owned ? args.diff.owned.content :
                  args.diff.other.content
              );


            }); 


          } else {
            this._single_editor.setValue(
              args.diff.owned ? args.diff.owned.content :
                args.diff.other.content            
            );
          }


        }
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_file_diff_complete.attach((sender, args) => {
        let htmlContent = '', 
            sourceRow, 
            isToBeAdded,
            isToSpan,
            diffLoader,
            changesCell,
            changeCountSpan,
            addSpan,
            icons = ['icon-backward', 'icon-pause'];

        sourceRow = this._compare_file_list.find(`tr[data-filetype="${args.fileType}"][data-filename="${args.filename}"]`);
        isToSpan = sourceRow.find('.isTo span');
        changesCell = sourceRow.find('.changes');
        changeCountSpan = changesCell.find('.changeCount');
        addSpan = changesCell.find('.add');
        diffLoader = changesCell.find('.diffLoader');

        diffLoader.remove();

        // set the changes type
        if(args.changeDetails.owned || !args.changeDetails.owned && args.changeDetails.other) {
          isToSpan.html(args.filename);
          if(!args.changeDetails.owned) {
            // show the add arrow:
            isToBeAdded = true;
            sourceRow.addClass('addition'); 
            addSpan.show();       
          }
        }

        // changed, so show changed details:
        if(args.changeDetails.isChanged) {
          changeCountSpan.find('span').html(args.changeDetails.changeCount);
          changeCountSpan.show();
        }

        if(args.changeDetails.other) {
          sourceRow.find('.isFrom').html(args.filename);
        }
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_review_change.attach((sender, args) => {
        this.updateReviewDecorations(args.reviewList);

        this._compare_file_list.find(`tr[data-filetype="${args.file.type}"][data-filename="${args.file.filename}"] .changes span`)
          .html('TODO');

        // remove for reject:
        if(args.change.type == 'reject') {
          this._compare_editor.executeEdits('', [
            { range: new monaco.Range(change.startLineNumber,0,changeEndNumber + 1,0), text: '' }
          ]);        
        }
      });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    updateReviewDecorations(reviewList) {
      if(this.codelens_provider) {
        this.codelens_provider.dispose();
      }

      this.codelens_provider = monaco.languages.registerCodeLensProvider('rcloud', {
        provideCodeLenses: (model, token) => {
            return _.flatten(_.map(reviewList, (reviewItem, index) => 
              [{
                range: { startLineNumber: reviewItem.startLineNumber },
                id: 0,
                command: {
                    id: this.apply_change,
                    title: 'Accept',
                    arguments: {
                      startLineNumber: reviewItem.startLineNumber,
                      endLineNumber: reviewItem.endLineNumber,
                      type: 'approve'
                    }
                }
              }, {
                range: { startLineNumber: reviewItem.startLineNumber },
                id: 1,
                command: {
                    id: this.apply_change,
                    title: 'Reject',
                    arguments: {
                      startLineNumber: reviewItem.startLineNumber,
                      endLineNumber: reviewItem.endLineNumber,
                      type: 'reject'
                    }
                }
              }]))
        },
        resolveCodeLens: function(model, codeLens, token) {
          return codeLens;
        }
      });

      let decorations = _.map(reviewList, reviewItem => {
        return {
          range: new monaco.Range(reviewItem.startLineNumber, 1, reviewItem.endLineNumber, 1),
          options: {
            isWholeLine: true,
            className: reviewItem.diffType
          }
        } 
      });

      this._model.update_decorations(this._compare_editor.deltaDecorations(this._model.get_decorations(), decorations));

    }

    clear_error() {
      $(this._error_selector).remove();
    }

    show_error(errorText) {
      this.clear_error();
      $('<div />', {
        id: this._error_selector.substring(1),
        text: errorText
      }).appendTo($(this._dialog).find(`div[data-by="${this._model.get_merge_source()}"]`));
    }

    has_error() {
      return $(this._error_selector).length;
    }

    reset_getting_changes_state() {
      this._btn_show_changes.text('Show changes');
    }

    clear() {
      this._model.reset();
      this._editorTab.tab('show');
    }
  };

  return new merger_view(model);

});
