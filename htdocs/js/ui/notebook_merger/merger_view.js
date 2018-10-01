RCloudNotebookMerger.view = (function(model) {

  const DEFAULT_LANGUAGE = 'rcloud';
  const DialogStage = Object.freeze({
        INIT: 'init',
        GETTINGCHANGES: 'gettingchanges',
        COMPARE: 'compare',
        APPLYINGCHANGES: 'applyingchanges'
      });

  (function( $ ){
    $.fn.setMergerDialogStage = function(stage) {
      this.removeClass(Object.keys(DialogStage).map(key => `stage-${key.toLowerCase()}`).join(' '));
      this.addClass(`stage-${stage}`);
      return this;
    }; 
  })( jQuery );

  const merger_view = class {
    constructor(model) {
      
      this._model = model;
      this._dialog_stage = DialogStage.INIT;

      let template = _.template($("#merger-template").html());

      this._templates = {
        file_list: _.template($('#compare-file-list-snippet').html())
      };

      this.transitionTimeSeconds = 0.4;

      this.setTransitionTimeout = (func) => {
        setTimeout(func, (this.transitionTimeout * 1000) + 200);
      };

      $("body").append(template({
        transitionTimeSeconds: this.transitionTimeSeconds
      }));

      this._dialog = $("#merger-dialog");
      this._merge_source = $('#merge-changes-by');
      this._merge_notebook_file = $('#merge-notebook-file');
      this._merge_notebook_url = $('#merge-notebook-url');
      this._merge_notebook_id = $('#merge-notebook-id');

      this._compare_editor_selector = '#compare-editor';
      this._compare_editor_container_selector = '#compare-editor-tab > .container';
      this._compare_diff_selector = '#compare-diff';
      this._compare_diff_container_selector = '#compare-diff-tab > .container';
      this._single_editor_panel_selector = '#single-editor-panel';
      this._single_editor_selector = '#single-editor';
      this._single_editor_container_selector = '#single-editor-panel > .container';
      this._no_changes_panel_selector = '#no-changes-panel';
      this._compare_result_selector = '#compare-result';

      this._compare_editor = null;
      this._compare_diff_editor = null;
      this._single_editor = null;
      this._diff_navigator = null;

      this._previous_diff_button = $("#previous-diff");
      this._next_diff_button = $("#next-diff");
      this._error_selector = '#merge-error';

      this._merge_notebook_title = $('#merge-notebook-title');
      this._merge_notebook_details = $('#merge-notebook-details');

      this._compare_file_list = $('#compare-file-list');
      this._compare_stage = $('#compare-stage');
      this._compare_tabs = $('#compare-tabs');

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
      
      this._merge_source.change(() => {
        this._model.update_merge_source(this._merge_source.val());
      });

      this._merge_notebook_file.click(() => {
        this.clear_error();
        this._merge_notebook_file.val(null);
      }).change(() => {
        let that = this;
        let on_error = (message) => {
          that.show_error(message);
        };
        this._model.upload_file(this._merge_notebook_file[0].files[0], on_error);
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
      
      $(this._dialog).on('click', 'tbody .remove', (event) => {
        const row = $(event.currentTarget).closest('tr');
        row.toggleClass('excluded');

        let isIncluded = !row.hasClass('excluded');

        this._model.setFileInclusion({
          type: row.data('filetype'),
          filename: row.data('filename')
        }, isIncluded);

        $(event.currentTarget).attr('title', isIncluded ? 
          'This file will be removed. Click to cancel.' : 'This file will not be removed. Click to remove.');
      });
      
      $(this._dialog).on('click', 'tbody .modify', (event) => {
        const row = $(event.currentTarget).closest('tr');
        row.toggleClass('excluded');

        let isIncluded = !row.hasClass('excluded');
        
        let file = {
          type: row.data('filetype'),
          filename: row.data('filename')
        };

        this._model.setFileInclusion(file, isIncluded);
        
        this.updateModifySpanTitle(row, this._model.getFileChangesCount(file), this._model.getNumberOfChanges(file));

      });

      $(this._dialog).on('shown.bs.tab', 'a[data-toggle="tab"]', (e) => {
        if($(e.target).attr("href") === this._compareDiffTabSelector && !this._compare_diff_editor) {
          require(["vs/editor/editor.main"], () => {  
            this._compare_diff_editor = monaco.editor.createDiffEditor($(this._compare_diff_selector)[0], {
              scrollBeyondLastLine: false,
              fontSize: 11
            });
            this._compare_diff_editor.setModel({
              original: monaco.editor.createModel($(this._compare_diff_selector).data('original'), DEFAULT_LANGUAGE),
              modified: monaco.editor.createModel($(this._compare_diff_selector).data('modified'), DEFAULT_LANGUAGE)
            });
            this._compare_diff_editor.layout();
          }); 
        } else {
          if(this._compare_diff_editor) {
            this._compare_diff_editor.setModel({
              original: monaco.editor.createModel($(this._compare_diff_selector).data('original'), DEFAULT_LANGUAGE),
              modified: monaco.editor.createModel($(this._compare_diff_selector).data('modified'), DEFAULT_LANGUAGE)
            });
            this._compare_diff_editor.layout();
          }
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
      this._model.on_getting_changes.attach(() => {
        this.update_stage(DialogStage.GETTINGCHANGES);
        this.clear_error();
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_get_changes_error.attach(({}, args) => {
        this.update_stage(DialogStage.INIT);
        this._button_show_changes.text('Show changes');
        this.show_error(args.message);
      });
      
      this._model.on_changeset_change.attach(({}, filesList) => {
          let changes = this._model.getChangesToApply();
          if(changes.length) {
            this._button_merge.text('Merge');
          } else {
            this._button_merge.text('Nothing to do');
          }
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_reset_complete.attach(() => {

        this._compare_editor && this._compare_editor.setModel(null);
        this._compare_diff_editor && this._compare_diff_editor.setModel(null);
        this._single_editor && this._single_editor.setModel(null);
  
        this._compare_file_list.html('');
    
        this.reset_getting_changes_state();
  
        this._inputs.forEach((input) => {
            input.val('');
        });

        this._merge_notebook_details.html('');
        this._compare_tabs.hide();
        $(this._no_changes_panel_selector).hide();
        this.update_stage(DialogStage.INIT);
        this._button_merge.text('Merge');
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_file_list_complete.attach(({}, args) => {
        this.update_stage(DialogStage.COMPARE);

        this._compare_file_list.html(this._templates.file_list({
          files: args.files
        }));
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_diff_complete.attach(({}, args) => {
   
        if(this._codelens_provider) {
          this._codelens_provider.dispose();
          this._codelens_provider = null;
        }

        if(args.diff.isChanged) {

          $(this._single_editor_panel_selector).hide();
          $(this._no_changes_panel_selector).hide();
          this._compare_tabs.show();
          this._editorTab.tab('show');
          $(this._compare_editor_selector).show();

          let init = () => {
            var computedHeight = $(this._compare_editor_container_selector).height();
            $(this._compare_editor_selector).css('height', computedHeight + 'px');
            $(this._compare_diff_selector).css('height', computedHeight + 'px');
            this._compare_editor.setModel(
                monaco.editor.createModel(args.diff.content, DEFAULT_LANGUAGE)
            );

            this.updateReviewDecorations(args.diff.modifiedLineInfo);
    
            $(this._compare_diff_selector).data({
              original: args.owned,
              modified: args.other
            });
            this._compare_editor.layout();
          };

          if(!this._compare_editor) {    
            require(["vs/editor/editor.main"], () => {  
              monaco.languages.register({
                id: DEFAULT_LANGUAGE
              });
            
              this._compare_editor = monaco.editor.create(
                $(this._compare_editor_selector)[0],  
                {
                  language: DEFAULT_LANGUAGE,
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


        } else if (args.diff.isNewOrDeleted) {
          // show just the file that's either owned or other:
          this._compare_tabs.hide();
          $(this._no_changes_panel_selector).hide();
          $(this._single_editor_panel_selector).show();

          let init = () => {
            var computedHeight = $(this._single_editor_container_selector).height();
            $(this._single_editor_selector).css('height', computedHeight + 'px');
            this._single_editor.setModel(
              monaco.editor.createModel(args.diff.owned ? args.diff.owned.content :
                args.diff.other.content, DEFAULT_LANGUAGE)
            );
            this._single_editor.layout();
          };

          if(!this._single_editor) {
            require(["vs/editor/editor.main"], () => {  
              monaco.languages.register({
                id: DEFAULT_LANGUAGE
              });
            
              this._single_editor = monaco.editor.create(
                $(this._single_editor_selector)[0],  
                {
                  language: DEFAULT_LANGUAGE,
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
        } else {
          this._compare_tabs.hide();
          $(this._single_editor_panel_selector).hide();
          $(this._no_changes_panel_selector).show();
        }
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_file_diff_complete.attach(({}, args) => {
        let sourceRow, 
            isToSpan,
            diffLoader,
            changesCell,
            modifySpan,
            equalSpan,
            addSpan,
            removeSpan;

        sourceRow = this._compare_file_list.find(`tr[data-filetype="${args.fileType}"][data-filename="${args.filename}"]`);
        isToSpan = sourceRow.find('.isTo span');
        changesCell = sourceRow.find('.changes');
        modifySpan = changesCell.find('.modify');
        equalSpan = changesCell.find('.equal');
        addSpan = changesCell.find('.add');
        removeSpan = changesCell.find('.remove');
        diffLoader = changesCell.find('.diffLoader');

        diffLoader.remove();

        let { owned, other, isChanged, changeCount } = args.changeDetails;
        
        let isBinary = args.isBinary;

        // set the changes type
        if(owned || !owned && other) {
          isToSpan.html(args.filename);
          if(!owned) {
            sourceRow.addClass('addition'); 
            addSpan.attr('title', 'This file will be added. Click to cancel.');
            addSpan.show();
          } else if (!other) {
            sourceRow.addClass('deletion'); 
            removeSpan.attr('title', 'This file will be deleted. Click to cancel.');
            removeSpan.show();
          }
        }

        // changed, so show changed details: 
        if(isChanged) {
          let tmpChangesCount = (!isBinary)? changeCount : 1;
          this.updateModifySpanTitle(sourceRow, tmpChangesCount, tmpChangesCount);
          modifySpan.show();
        }

        if(other) {
          sourceRow.find('.isFrom').html(args.filename);
        }

        if(owned && other && !isChanged) {
          equalSpan.show();
        }
      });

      this._model.on_merge_start.attach(() => {
        this.update_stage(DialogStage.APPLYINGCHANGES);
      });

      this._model.on_merge_complete.attach(() => {
        this._dialog.modal('hide');
      });
      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      
      this._model.on_review_change.attach(({}, args) => {
        this.updateReviewDecorations(args.reviewList);
        
        let changeCount = args.reviewList.length - _.filter(args.reviewList, item => item.isRejected).length, 
            sourceRow = this._compare_file_list.find(`tr[data-filetype="${args.file.type}"][data-filename="${args.file.filename}"]`);
            
        this.updateModifySpanTitle(sourceRow, changeCount, args.reviewList.length);
      });
    }
    
    updateModifySpanTitle(sourceRow, changeCount, totalNoOfChanges) {
        let modifySpan = sourceRow.find('.modify');

        modifySpan.attr('title', changeCount ? `${changeCount} change${changeCount != 1 ? 's': ''} will be applied to this file. Click to reject all changes.` : `This file will not be modified. Click to apply all incomming changes.`);
        sourceRow[changeCount ? 'removeClass' : 'addClass']('excluded');
        modifySpan.find('.count').html(changeCount);
        if(changeCount < totalNoOfChanges) {
           modifySpan.find('.total').html(totalNoOfChanges).show();
        } else {
           modifySpan.find('.total').html(totalNoOfChanges).hide();
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    updateReviewDecorations(reviewList) {
      if(this._codelens_provider) {
        this._codelens_provider.dispose();
        this._codelens_provider = null;
      }

      const getCodeLensTitle = (diffType, isRejected) => {
        if(diffType == 'added') {
          return isRejected ? 'Add content' : 'Ignore added content';
        } else {
          return isRejected ? 'Delete content' : 'Keep deleted content'; 
        }
      };

      this._codelens_provider = monaco.languages.registerCodeLensProvider(DEFAULT_LANGUAGE, {
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
        };
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
    
    submit() {
      switch(this._dialog_stage) {
        case DialogStage.INIT:
          this._model.get_changes($(`#merge-notebook-${this._model.get_merge_source()}`).val());
          break;
        case DialogStage.COMPARE:
          this._model.applyMerge();
          break;
        default:
          // no-op
      }
    }
    
    update_stage(stage) {
      this._dialog_stage = stage;

        switch(stage) {
          case DialogStage.INIT:
            this.reset_getting_changes_state();
            this._merge_notebook_details.html('');
            this._merge_notebook_title.html('Merge Changes');
            break;
          case DialogStage.COMPARE: 
            this._merge_notebook_title.html('Apply Changes');
            this._merge_notebook_details.html(`from ${this._model._other_notebook_description}`);
            break;
          case DialogStage.APPLYINGCHANGES:
            this._merge_notebook_title.html('Applying changes');
            this._button_show_changes.text('Applying changes');
            break;
          case DialogStage.GETTINGCHANGES:
            this._merge_notebook_title.html('Getting changes');
            this._button_show_changes.text('Getting changes');
            break;
          default:
            this._merge_notebook_title.html('Merge Changes');
            this._merge_notebook_details.html('');
        }

        this._dialog.setMergerDialogStage(stage.toLowerCase());
    }
    
    is_open() {
      return this._dialog.is(':visible');
    }
  };

  return new merger_view(model);

});
