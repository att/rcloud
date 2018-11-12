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
        file_list: _.template($('#compare-file-list-snippet').html()),
        diffs_list: _.template($('#compare-stage-snippet').html())
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

      this._editors = {};

      this._error_selector = '#merge-error';

      this._merge_notebook_title = $('#merge-notebook-title');
      this._merge_notebook_details = $('#merge-notebook-details');

      this._compare_file_list = $('#compare-file-list');
      this._compare_stage = $('#compare-stage');

      this._stageCssPrefix = 'stage-';

      this._button_show_changes = this._dialog.find('.btn-primary.btn-primary.show-changes');
      this._button_merge = this._dialog.find('.btn-merge');
      this._inputs = [this._merge_notebook_file, this._merge_notebook_url, this._merge_notebook_id];

      this._codelens_provider = null;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      //
      //
      //


      require(["vs/editor/editor.main"], () => {
          monaco.languages.register({
            id: DEFAULT_LANGUAGE
          });
          this.registerCodeLensProvider();
      });

      this._button_show_changes.click(() => {
        this._model.get_changes($(`#merge-notebook-${this._model.get_merge_source()}`).val());
      });

      this._button_merge.click(() => {
        this._model.applyMerge();
      });

      this._merge_source.change(() => {
        this._model.update_merge_source(this._merge_source.val());
      });


      // Run when Show Changes is clicked.
      this._button_show_changes.click(() => {
        this._model.get_changes($(`#merge-notebook-${this._model.get_merge_source()}`).val());
      });


      // If the Enter key is pressed then run the function to move to the next page.
      const enterListen = (e) => {
        if (e.keyCode == 13) {
          this._model.get_changes($(`#merge-notebook-${this._model.get_merge_source()}`).val());
           }
      }

      // The fields that need to be listened on.
      this._button_show_changes.keypress(enterListen);  // Just incase default fails.
      this._merge_notebook_url.keypress(enterListen);
      this._merge_source.keypress(enterListen);
      this._merge_notebook_id.keypress(enterListen);
      this._merge_notebook_file.keypress(enterListen);

      // Run when Merge is clicked.
      this._button_merge.click(() => {
        this._model.applyMerge();
      })

      // Listen for enter when focused in the compare stage editor.
      this._compare_stage.keypress((e) => {
        if (e.keyCode == 13) {
          this._model.applyMerge();
        }
      })


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

      $(this._dialog).on('click', 'table tr', (event) => {
        const row = $(event.currentTarget).closest('tr');
        let section = row.data('section');

        let diffSection = this._compare_stage.find(`div[data-section="${section}"]`);

        this._compare_stage.scrollTo(diffSection, 500);
      });

      $(this._dialog).on('click', 'tr .add', (event) => {
        const row = $(event.currentTarget).closest('tr');
        row.toggleClass('excluded');

        let isIncluded = !row.hasClass('excluded');

        let file = {
          type: row.data('filetype'),
          filename: row.data('filename')
        };

        this._model.setFileInclusion(file, isIncluded);

        $(event.currentTarget).attr('title', isIncluded ?
          'This file will be added. Click to cancel.' : 'This file will not be added. Click to add.');

        let diff_panel = this._compare_stage.find(`div[data-filetype="${file.type}"][data-filename="${file.filename}"]`).closest('.diff-panel');
        if (!isIncluded) {
          diff_panel.addClass('excluded');
        } else {
          diff_panel.removeClass('excluded');
        }
      });

      $(this._dialog).on('click', 'tr .remove', (event) => {
        const row = $(event.currentTarget).closest('tr');
        row.toggleClass('excluded');

        let isIncluded = !row.hasClass('excluded');

        let file = {
          type: row.data('filetype'),
          filename: row.data('filename')
        };
        this._model.setFileInclusion(file, isIncluded);

        $(event.currentTarget).attr('title', isIncluded ?
          'This file will be removed. Click to cancel.' : 'This file will not be removed. Click to remove.');


        let diff_panel = this._compare_stage.find(`div[data-filetype="${file.type}"][data-filename="${file.filename}"]`).closest('.diff-panel');
        if (!isIncluded) {
          diff_panel.addClass('excluded');
        } else {
          diff_panel.removeClass('excluded');
        }
      });

      $(this._dialog).on('click', 'tr .modify', (event) => {
        const row = $(event.currentTarget).closest('tr');
        row.toggleClass('excluded');

        let isIncluded = !row.hasClass('excluded');

        let file = {
          type: row.data('filetype'),
          filename: row.data('filename')
        };

        this._model.setFileInclusion(file, isIncluded);

        let diff_panel = this._compare_stage.find(`div[data-filetype="${file.type}"][data-filename="${file.filename}"]`).closest('.diff-panel');
        if (!isIncluded) {
          diff_panel.addClass('excluded');
        } else {
          diff_panel.removeClass('excluded');
        }

        this.updateModifySpanTitle(row, this._model.getFileChangesCount(file), this._model.getNumberOfChanges(file));
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
        this._button_show_changes.text('Show Changes');
        this.show_error(args.message);
      });

      this._model.on_changeset_change.attach(({}, filesList) => {
          let changes = this._model.getChangesToApply();
          if(changes.length) {
            this._button_merge.text('Merge');
          } else {
            this._button_merge.text('No Changes');
          }
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_reset_complete.attach(() => {

        Object.keys(this._editors).forEach((k) => {
          if(this._editors[k].editor) {
            this._editors[k].editor.dispose();
          }
        });

        this._editors = {};

        this._compare_file_list.html('');
        this._compare_stage.html('');

        this.reset_getting_changes_state();

        this._inputs.forEach((input) => {
            input.val('');
        });

        this._merge_notebook_details.html('');
        this.update_stage(DialogStage.INIT);
        this._button_merge.text('Merge');
      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_file_list_complete.attach(({}, args) => {
        this.update_stage(DialogStage.COMPARE);

        this._compare_file_list.html(this._templates.file_list({
          files: args.files
        }));

        this._compare_stage.html(this._templates.diffs_list({
          files: args.files
        }));

      });

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      this._model.on_file_diff_complete.attach(({}, args) => {
        let diff = args.changeDetails;
        let filename = args.filename;


        let content_area = this._compare_stage.find(`div[data-filetype="${args.fileType}"][data-filename="${filename}"]`);
        let panel_loader = content_area.closest('.panel').find('.diffLoader');

        // Resizing of the Monaco editor panel.
        let sizeDiffPanel = (panelContent, lineCount, changesCount, editorConfiguration) => {

            // The following sits the editor panel over the top of the margin (numbers).
            panelContent.css('left', 0 + 'px');
            panelContent.css('right', 0 + 'px');

            // Calculates the height needed for the Monaco editor depending on the changes present.
            let height = (lineCount + changesCount) * editorConfiguration.lineHeight;
            panelContent.css('height', height + 'px');
        };

        if(diff.isChanged && !args.isBinary) {
          let editor_container = $('<div class="compare_editor"></div>');
          content_area.append(editor_container);
          content_area.closest(".panel").addClass("panel-warning").addClass('diff-changed');

          let init = () => {
                this._editors[filename] = {
                  editor: monaco.editor.create(
                                editor_container[0],
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
                              )
                };

                this._editors[filename].apply_change = this._editors[filename].editor.addCommand(0, (ctx, args) => {
                                this._model.apply_review_change(filename, args);
                              });
                let editor_model = monaco.editor.createModel(diff.content, DEFAULT_LANGUAGE);
                this._editors[filename].model_id = editor_model.id;
                this._editors[filename].editor.setModel(editor_model);

                // Layout
                sizeDiffPanel(editor_container,  editor_model.getLineCount(), diff.modifiedLineInfo.length, this._editors[filename].editor.getConfiguration());

                // Hide the default Monaco decorations.
                $('.monaco-scrollable-element').each(function() {
                  this.style.left = '0px';
                  this.style.width = '110%';
                })

                this._editors[filename].editor.layout();

                this.updateReviewDecorations(filename);
                panel_loader.remove();
              };

              this.setTransitionTimeout(init);
        } else {
          if(diff.isChanged) {
            content_area.closest(".panel").addClass("panel-warning").addClass("diff-binary");
            content_area.html("binary file");
            panel_loader.remove();
          } else if(diff.isNewOrDeleted) {
            if(diff.isDeleted) {
              content_area.closest(".panel").addClass("panel-danger").addClass("diff-deleted");
            } else {
              content_area.closest(".panel").addClass("panel-success").addClass("diff-added");
            }
            if(args.isBinary) {
              content_area.html("binary file");
              panel_loader.remove();
            } else {
                let editor_container = $('<div class="compare_editor"></div>');
                content_area.append(editor_container);
                let init = () => {

                  this._editors[filename] = {
                    editor: monaco.editor.create(
                        editor_container[0],
                        {
                          language: DEFAULT_LANGUAGE,
                          fontSize: 11,
                          scrollBeyondLastLine: false,
                          minimap: {
                            enabled: false
                          },
                          readOnly: true
                        }
                      )
                  };
                  let editor_model = monaco.editor.createModel(diff.owned ? diff.owned.content :
                      diff.other.content, DEFAULT_LANGUAGE);
                  this._editors[filename].model_id = editor_model.id;
                  this._editors[filename].editor.setModel(editor_model);

                  // Layout
                  sizeDiffPanel(editor_container,  editor_model.getLineCount(), 0, this._editors[filename].editor.getConfiguration());

                  // Hide the default Monaco decorations.
                $('.monaco-scrollable-element').each(function() {
                  this.style.left = '0px';
                  this.style.width = '110%';
                })

                  this._editors[filename].editor.layout();

                  panel_loader.remove();
                };
                this.setTransitionTimeout(init);
            }
          } else {
            content_area.closest(".panel").addClass("panel-default").addClass("diff-no-change");
            content_area.html("no change");
            panel_loader.remove();
          }
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
        let editor_descriptor = this._editors[args.filename];
        let reviewList = this._model.getFileLineChanges({filename: args.filename, type: args.fileType});
        this.updateReviewDecorations(args.filename);

        let changeCount = reviewList.length - _.filter(reviewList, item => item.isRejected).length,
            sourceRow = this._compare_file_list.find(`tr[data-filetype="${args.fileType}"][data-filename="${args.filename}"]`);

        this.updateModifySpanTitle(sourceRow, changeCount, reviewList.length);
        let diff_panel = this._compare_stage.find(`div[data-filetype="${args.fileType}"][data-filename="${args.filename}"]`).closest('.diff-panel');
        if (changeCount === 0) {
          diff_panel.addClass('excluded');
        } else {
          diff_panel.removeClass('excluded');
        }
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
    updateReviewDecorations(filename) {

      let editor_descriptor = this._editors[filename];


      editor_descriptor.editor.getModel().setValue(editor_descriptor.editor.getModel().getValue());

      // get the current decorations (needed for update, below):
      let decorations = _.chain(this._model.getFileLineChanges({filename: filename})).map(reviewItem => {
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

      this.update_decorations(filename, editor_descriptor.editor.deltaDecorations(this.get_decorations(filename), decorations));
    }

    registerCodeLensProvider() {
      if(this._codelens_provider) {
        return;
      }

      const getCodeLensTitle = (diffType, isRejected) => {
        if(diffType == 'added') {
          return isRejected ? 'Add content' : 'Ignore added content';
        } else {
          return isRejected ? 'Delete content' : 'Keep deleted content';
        }
      };

      this._codelens_provider = monaco.languages.registerCodeLensProvider(DEFAULT_LANGUAGE, {
        provideCodeLenses: (model) => {
            let model_filename = _.filter(Object.keys(this._editors), (k) => {
              return this._editors[k].model_id === model.id;
            })[0];
            let editor_descriptor = this._editors[model_filename];
            if(!editor_descriptor) {
              console.error('Editor for file ' + model_filename + ' and model ' + model.id + ' not found!');
              return [];
            }
            if(editor_descriptor.apply_change) {
                return _.map(this._model.getFileLineChanges({filename: model_filename}), (reviewItem, key) => {
                return {
                  range: {
                    startLineNumber: reviewItem.startLineNumber,
                    endLineNumber: reviewItem.endLineNumber
                  },
                  id: key,
                  command: {
                    id: editor_descriptor.apply_change,
                    title: getCodeLensTitle(reviewItem.diffType, reviewItem.isRejected),
                    filename: model_filename,
                    model_id: editor_descriptor.model_id,
                    arguments: {
                      startLineNumber: reviewItem.startLineNumber,
                      endLineNumber: reviewItem.endLineNumber,
                      diffType: reviewItem.diffType
                    }
                  }
                };
              });
            } else {
              return [];
            }
        },
        resolveCodeLens: (model, codeLens) => {
          return (model.id === codeLens.command.model_id) ? codeLens: null;
        }
      });
    }


    update_decorations(filename, decorations) {
      this._editors[filename].delta_decorations = (decorations)? decorations: [];
    }

    get_decorations(filename) {
      let res = this._editors[filename].delta_decorations;
      return (res) ? res : [];
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
      this._button_show_changes.text('Show Changes');
    }

    clear() {
      this._model.reset();
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

    open() {
      this._model.get_notebook_merge_property();
    }

    is_open() {
      return this._dialog.is(':visible');
    }
  };

  return new merger_view(model);

});
