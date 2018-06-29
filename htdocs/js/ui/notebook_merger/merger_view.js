window.RCloud.UI.merger_view = (function(model) {

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

      let template = _.template($("#merger-template").html());

      this._templates = {
        file_list: _.template($('#compare-file-list-snippet').html())
      };

      this.transitionTimeSeconds = 0.4;

      this.setTransitionTimeout = (func) => {
        setTimeout(func, (this.transitionTimeout * 1000) + 200);
      }

      $("body").append(template({
        transitionTimeSeconds: this.transitionTimeSeconds
      }));

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
      this._merge_compare_section_selector = '#merge-compare-section';

      this._button_show_changes = this._dialog.find('.btn-primary.btn-primary.show-changes');
      this._button_merge = this._dialog.find('.btn-merge');
      this._inputs = [this._merge_notebook_file, this._merge_notebook_url, this._merge_notebook_id];

      this._codelens_provider = null;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      //
      //
      //
      this._button_show_changes.click(() => {
        this._model.get_changes($(`#merge-notebook-${this._model.get_merge_source()}`).val());
      });

      this._button_merge.click(() => {
        this._model.applyMerge();
      });

      this._button_init.click(() => {
        this._model.update_stage(this._model.DialogStage.INIT);
      });

      this._merge_source.change(() => {
        this._model.update_merge_source(this._merge_source.val());
      });

      this._merge_notebook_file.click(() => {
        this.clear_error();
        this._merge_notebook_file.val(null);
      }).change(() => {
        this._model.upload_file(this._merge_notebook_file[0].files[0]);
      });

      $(this._dialog).on('hidden.bs.modal', () => {
        this.clear();
      });

      $(this._dialog).on('click', 'tbody tr:not(.binary)' /*'tbody tr:not(.selected)'*/, (event) => {
        $(event.currentTarget).closest('table').find('tr').removeClass('selected');  
        $(event.currentTarget).addClass('selected');

        // for now, only comparison for 'common' files makes sense:
        this._model.set_comparison_as(
          $(event.currentTarget).data('filetype'),
          $(event.currentTarget).data('filename'));
      });

      $(this._dialog).on('click', 'tbody .add', (event) => {
        const row = $(event.currentTarget).closest('tr');
        row.toggleClass('excluded');

        let isIncluded = !row.hasClass('excluded');

        this._model.setFileInclusion({
          type: row.data('filetype'),
          filename: row.data('filename')
        }, isIncluded);

        $(event.currentTarget).attr('title', isIncluded ? 
          'This file will be added. Click to cancel.' : 'This file will not be added. Click to add.');
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
          // if(this._compare_diff_editor) {
          //   this._compare_diff_editor.dispose();
          //   this._compare_diff_editor = null;
          //   $(this._compare_diff_selector).html('');
          // }
        }
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      //
      //
      //
      this._model.on_set_merge_source.attach(({}, args) => {
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
      this._model.on_set_stage.attach(({}, args) => {
        if(args.stage == this._modealogStage.INIT) {
          this.reset_getting_changes_state();
          this._merge_notebook_details.html('');
          this._button_init.hide();
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
      this._model.on_getting_changes.attach(() => {
        this.clear_error();
        this._button_show_changes.text('Getting changes');
        this._dialog.setMergerDialogStage(this._model.DialogStage.GETTINGCHANGES);
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_get_changes_error.attach(({}, args) => {
        this._dialog.setMergerDialogStage(this._model.DialogStage.INIT);
        this._button_show_changes.text('Show changes');
        this.show_error(args.message);
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_reset_complete.attach(() => {

        // clear it:
        this._compare_editor && this._compare_editor.setModel(null);
        this._compare_diff_editor && this._compare_diff_editor.setModel(null);
        this._single_editor && this._single_editor.setModel(null);
  
        $(this._merge_compare_section_selector).removeClass('active-comparison');

        this._compare_file_list.html('');
    
        this.reset_getting_changes_state();
  
        this._inputs.forEach((input) => {
            input.val('');
        });

        this._merge_notebook_details.html('');
        this._button_init.hide();
        this._compare_tabs.hide();
        this._dialog.setMergerDialogStage(this._model._dialog_stage);
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_file_list_complete.attach(({}, args) => {

        this._dialog.setMergerDialogStage(this._model._dialog_stage);

        this._compare_file_list.html(this._templates.file_list({
          files: args.files
        }));
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_diff_complete.attach(({}, args) => {
   
        if(this._codelens_provider)
          this._codelens_provider.dispose();

        $(this._merge_compare_section_selector).addClass('active-comparison');

        if(args.diff.isChanged) {

          $(this._single_editor_selector).hide();
          this._compare_tabs.show();
          this._editorTab.tab('show');
          $(this._compare_editor_selector).show();

          let init = () => {
            
            this._compare_editor.setValue(
                args.diff.content
            );

            this.updateReviewDecorations(args.diff.modifiedLineInfo);
    
            $(this._compare_diff_selector).data({
              original: args.owned,
              modified: args.other
            });
          };

          if(!this._compare_editor) {    
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
                  readOnly: true,
                  minimap: {
                    enabled: false
                  },
                  glyphMargin: true
                }
              );

              this.apply_change = this._compare_editor.addCommand(0, (ctx, args) => {
                this._model.apply_review_change(args);
              });

              this.setTransitionTimeout(init);
            }); 
          } else {
            this.setTransitionTimeout(init);
          }


        } else {
          // show just the file that's either owned or other:
          this._compare_tabs.hide();
          $(this._single_editor_selector).show();

          let init = () => {
            this._single_editor.setModel(
              monaco.editor.createModel(args.diff.owned ? args.diff.owned.content :
                args.diff.other.content)
            );
          }

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

              this.setTransitionTimeout(init);
            }); 
          } else {
            this.setTransitionTimeout(init);
          }
        }
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_file_diff_complete.attach(({}, args) => {
        let sourceRow, 
            isToSpan,
            diffLoader,
            changesCell,
            changeCountSpan,
            equalSpan,
            addSpan;

        sourceRow = this._compare_file_list.find(`tr[data-filetype="${args.fileType}"][data-filename="${args.filename}"]`);
        isToSpan = sourceRow.find('.isTo span');
        changesCell = sourceRow.find('.changes');
        changeCountSpan = changesCell.find('.changeCount');
        equalSpan = changesCell.find('.equal');
        addSpan = changesCell.find('.add');
        diffLoader = changesCell.find('.diffLoader');

        diffLoader.remove();

        let { owned, other, isChanged, changeCount } = args.changeDetails;

        // set the changes type
        if(owned || !owned && other) {
          isToSpan.html(args.filename);
          if(!owned) {
            sourceRow.addClass('addition'); 
            addSpan.attr('title', 'This file will be added. Click to cancel.');
            addSpan.show();       
          }
        }

        // changed, so show changed details:
        if(isChanged) {
          changeCountSpan.find('span').html(changeCount);
          changeCountSpan.attr('title', `This file has ${changeCount} change${changeCount != 1 ? 's': ''}`);
          changeCountSpan.show();
        }

        if(other) {
          sourceRow.find('.isFrom').html(args.filename);
        }

        if(owned && other && !isChanged) {
          equalSpan.show();
        }
      });

      this._model.on_merge_start.attach(() => {
        this._button_show_changes.text('Applying changes');
        this._dialog.setMergerDialogStage(this._model.DialogStage.APPLYINGCHANGES);
      });

      this._model.on_merge_complete.attach(() => {
        this._dialog.modal('hide');
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_review_change.attach(({}, args) => {
        this.updateReviewDecorations(args.reviewList);

        let changeCount = args.reviewList.length - _.filter(args.reviewList, item => item.isRejected).length, 
            sourceRow = this._compare_file_list.find(`tr[data-filetype="${args.file.type}"][data-filename="${args.file.filename}"]`),
            changeCountSpan = sourceRow.find('.changeCount');

        changeCountSpan.attr('title', `This file has ${changeCount} change${changeCount != 1 ? 's': ''}`);
        sourceRow[changeCount ? 'removeClass' : 'addClass']('excluded');
        changeCountSpan.find('span').html(changeCount);
      });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    updateReviewDecorations(reviewList) {
      if(this._codelens_provider) {
        this._codelens_provider.dispose();
      }

      const getCodeLensTitle = (diffType, isRejected) => {
        if(diffType == 'added') {
          return isRejected ? 'Add content' : 'Ignore added content';
        } else {
          return isRejected ? 'Delete content' : 'Keep deleted content'; 
        }
      };

      //console.log('review list: ', reviewList);

      this._codelens_provider = monaco.languages.registerCodeLensProvider('rcloud', {
        provideCodeLenses: () => {
            return _.map(reviewList, (reviewItem, key) => {
              return {
                range: {
                  startLineNumber: reviewItem.startLineNumber,
                  endLineNumber: reviewItem.endLineNumber
                }, 
                id: key,
                command: {
                  id: this.apply_change,
                  title: getCodeLensTitle(reviewItem.diffType, reviewItem.isRejected),
                  arguments: {
                    startLineNumber: reviewItem.startLineNumber,
                    endLineNumber: reviewItem.endLineNumber,
                    diffType: reviewItem.diffType
                  }
                }
              };
            }); 
        },
        resolveCodeLens: (model, codeLens) => {
          return codeLens;
        }
      });

      // get the current decorations (needed for update, below):
      let decorations = _.chain(reviewList).map(reviewItem => {
        return {
          range: new monaco.Range(reviewItem.startLineNumber, 1, reviewItem.endLineNumber, 1),
          options: {
            isWholeLine: true,
            // rejected items should not have a class name, but they should
            // retain their glyph margin class:
            className: reviewItem.isRejected ? '' : reviewItem.diffType,
            glyphMarginClassName: reviewItem.diffType
          }
        } 
      }).value();

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
      this._button_show_changes.text('Show changes');
    }

    clear() {
      this._model.reset();
      this._editorTab.tab('show');
    }
  };

  return new merger_view(model);

});
