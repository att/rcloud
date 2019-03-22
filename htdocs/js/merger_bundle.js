RCloudNotebookMerger = {};

RCloud.UI.addons.notebook_merge = (function() {
  const notebook_merger_dialog_widget = class {
    constructor() {
        this.model = null;
        this.view = null;
        this.controller = null;
    }
    
    show() {
      if (!this.model) {
        this.model = new RCloudNotebookMerger.model(),
        this.view = new RCloudNotebookMerger.view(this.model),
        this.controller = new RCloudNotebookMerger.controller(this.model, this.view);
      } else {
        this.view.clear();
      }
      this.controller.show_dialog();
    }
    
    submit() {
      this.controller && this.controller.submit_dialog();
    }
    
    is_open() {
      return this.controller && this.controller.is_dialog_open();
    }
  };
  
  return {
      init: () => {
          const merger_dialog = new notebook_merger_dialog_widget();

          /* Create a merge button in the notebook tree and 
              start a new Merge dialogue with the desired Notebook */
          RCloud.UI.notebook_commands.add({
            merge: {
              section: 'appear',
              sort: 4000,
              create: function (node) {
                var merge = ui_utils.fa_button('icon-code-fork icon-rotate-90', 'merge from', 'merge', RCloud.UI.notebook_commands.merge_icon_style(), true);
                merge.click(function (e) {
                  // Open merge dialogue
                  merger_dialog.show();
                  // Submit to next dialogue or fail if ID invalid.
                  setTimeout(function() {
                    $('#merge-notebook-id').val(node.gistname);
                    $('.show-changes').click();
                  }, 100);
                  return;
                })
                return merge;
              }
            }
          }),
          RCloud.UI.shortcut_manager.add([{
            category: 'Advanced',
            id: 'merger-dialog-submit',
            description: 'Submit merge dialogs.',
            keys: {
                win_mac: [
                    ['enter']
                ]
            },
            ignore_clash: true,
            enable_in_dialogs: true,
            on_page: ['edit'],
            is_active: function() {
              return merger_dialog.is_open();
            },
            action: function() { merger_dialog.submit(); }
        }]);
        RCloud.UI.advanced_menu.add({
          merge_notebook: {
            sort: 1100,
            text: "Merge Notebook",
            modes: ["edit"],  
            disabled_reason: "You can't merge into a read only notebook",
            action: function() {
              merger_dialog.show();
            }
          }
        });
      }
  };
})();

RCloudNotebookMerger.diff_engine = (function() {

  const DiffType = Object.freeze({
    NOCHANGE: 'nochange',
    REMOVED: 'removed',
    ADDED: 'added'
  });

  const ChangeType = Object.freeze({
    NEW: 'new',
    DELETED: 'deleted',
    BINARY: 'binary',
    IDENTICAL: 'nochange',
    MODIFIED: 'changed'
  });

  const MAX_FILE_LENGTH = 250000; // about 0.25 MB file

  const diff_engine = class {
    constructor() {
      require(["diff.min"], diff => {
        this._engine = diff;
      });
    }
    getResolvedContent(file) {

      if(file.isBinary) {
        return file.content;
      } else {
        // deleted means that this file only exists in your notebook:
        if([ChangeType.DELETED, ChangeType.NEW].indexOf(file.changeDetails.fileChangeType) != -1) {
          return file.content;
        } else {
          // diffs:
          let { diffs, lineInfo } = file.changeDetails,
              acceptedChanges = _.filter(lineInfo, li => li.diffType != ChangeType.IDENTICAL && !li.isRejected),
              resolved = [];

          if(!acceptedChanges) {
            return file.content;
          } else {
            _.each(lineInfo, (li, index) => {
              if(li.diffType == 'removed' && li.isRejected ||
                 li.diffType == 'added' && !li.isRejected ||
                 li.diffType == 'nochange') {
                resolved.push(diffs[index].value);
              }
            });

            return resolved.join('');
          }
        }
      }
    }
    get_diff_info(owned, other) {

      const getContent = (file) => {
        if(!file || file.isBinary) {
          return '';
        } else {
          if(file.content.length) {
            return file.content.endsWith('\n') ? file.content : file.content + '\n';
          }
          return file.content;
        }
      };

      const diffLines = (changeType, isTooLarge, owned, other) => {
        // No need to run full diff if any of the files is empty
        switch(changeType) {
          case ChangeType.MODIFIED:
              if(!isTooLarge) {
                return this._engine.diffLines(getContent(owned), getContent(other));
              } else {
                  return [{
                            removed: true,
                            value: getContent(owned),
                            count: getContent(owned).split('\n').length,
                          },
                          {
                            added: true,
                            value: getContent(other),
                            count: getContent(other).split('\n').length,

                          }];
              }
              break;
            case ChangeType.NEW:
              return [{
                        added: true,
                        value: getContent(other),
                        count: getContent(other).split('\n').length,
                      }];
            case ChangeType.DELETED:
              return [{
                        removed: true,
                        value: getContent(owned),
                        count: getContent(owned).split('\n').length,
                      }];
            default:
                return this._engine.diffLines(getContent(owned), getContent(other));

        }
      };

      let fileChangeType;
      let isTooLarge = false;

      if (!owned && other) {
        fileChangeType = ChangeType.NEW;
      } else if (owned && !other) {
        fileChangeType =  ChangeType.DELETED;
      } else if (owned.isBinary) {
        fileChangeType = ChangeType.BINARY;
      } else {
        if (getContent(owned) == getContent(other)) {
          fileChangeType = ChangeType.IDENTICAL;
        } else {
          fileChangeType = ChangeType.MODIFIED;
        }
      }

      if ([ChangeType.NEW, ChangeType.DELETED, ChangeType.MODIFIED].indexOf(fileChangeType) != -1 ) {
        if (getContent(owned).length > MAX_FILE_LENGTH || getContent(other).length > MAX_FILE_LENGTH) {
          console.warn(`File ${owned} or ${other} is too large, skipping diff generation`);
          isTooLarge = true;
        }
      }

      const diffs = diffLines(fileChangeType, isTooLarge, owned, other);

      const getDiffType = obj => {
              if (obj.added) {
                return DiffType.ADDED;
              } else if (obj.removed) {
                return DiffType.REMOVED;
              } else {
                return DiffType.NOCHANGE;
              }
            };

      let currentLineNumber = 1, lineInfo = [];

      diffs.forEach(diff => {
        lineInfo.push({
          startLineNumber: currentLineNumber,
          endLineNumber: currentLineNumber + (diff.count - 1),
          diffType: getDiffType(diff)
        });

        currentLineNumber += diff.count;
      });

      return {
        fileChangeType,
        diffs,
        content: _.pluck(diffs, 'value').join(''),
        lineInfo,
        modifiedLineInfo: _.filter(lineInfo, li => li.diffType !== DiffType.NOCHANGE),
        get changeCount() { return this.modifiedLineInfo.length; },
        get isChanged() { return [ChangeType.MODIFIED, ChangeType.BINARY].indexOf(this.fileChangeType) != -1; },
        owned,
        other,
        get isNewOrDeleted() { return this.isDeleted || this.isNew;  },
        get isDeleted() { return [ChangeType.DELETED].indexOf(this.fileChangeType) != -1; },
        get isNew() { return [ChangeType.NEW].indexOf(this.fileChangeType) != -1; }
      }
    };
  }

  return diff_engine;

})();

RCloudNotebookMerger.model = (function() {

  // Key holding last used selection of 'theirs' notebook in Merge Dialog.
  // TODO: Was this actual requirement?
  const MERGE_CHANGES_BY = 'merge-changes-by';
  
  const DEFAULT_SOURCE = 'id';

  const BINARY_SUFFIX = '.b64';
  
  const MESSAGES = Object.freeze({
        same_notebook_error : 'You cannot merge from your current notebook; the source must be a different notebook.',
        invalid_notebook_id_error : 'Invalid notebook ID.',
        not_found_notebook_error : 'The notebook could not be found.',
        no_file_to_upload_error : 'No file to upload.',
        invalid_url_error : 'Invalid RCloud Notebook URL.'
      });
    
  const merger_model = class {
    
    constructor() {

      this.on_diff_complete = new RCloud.UI.event(this);
      this.on_file_diff_complete = new RCloud.UI.event(this);
      this.on_file_list_complete = new RCloud.UI.event(this);
      this.on_get_changes_error = new RCloud.UI.event(this);
      this.on_getting_changes = new RCloud.UI.event(this);
      this.on_reset_complete = new RCloud.UI.event(this);
      this.on_review_change = new RCloud.UI.event(this);
      this.on_changeset_change = new RCloud.UI.event(this);
      this.on_set_merge_source = new RCloud.UI.event(this);
      this.on_merge_start = new RCloud.UI.event(this);
      this.on_merge_complete = new RCloud.UI.event(this);
      
      this._diff_engine = new RCloudNotebookMerger.diff_engine();

      this._merge_source = DEFAULT_SOURCE;
      this._notebook_from_file = undefined;
      this._other_notebook_description = undefined;
      this._comparison = {};
    }

    get_notebook_merge_property() {
      // Use previous selection used.
      rcloud.get_notebook_property(shell.gistname(), MERGE_CHANGES_BY).catch((e) => {
          console.error(e);
          this.on_set_merge_source.notify({
            type: DEFAULT_SOURCE 
          });  
        
      }).then(val => {
        // value has format '<source-type>:<source-value>''
        if(val && val.indexOf(':') !== -1) {
          var separatorIndex = val.indexOf(':');
          var type = val.substring(0, separatorIndex);
          var value = val.substring(separatorIndex + 1);

          this._merge_source = type;
  
          // update view's merged by method from retrieved value:
          this.on_set_merge_source.notify({
            type, 
            value
          });
        } else {
          this.on_set_merge_source.notify({
            type: DEFAULT_SOURCE 
          });        
        }
      });
    }

    reset() {
      this._merge_source = DEFAULT_SOURCE;
      this._notebook_from_file = undefined;
      this._comparison = {};
      this._other_notebook_description = undefined;

      this.on_reset_complete.notify();
    }

    get_merge_source() {
      return this._merge_source;
    }

    update_merge_source(merge_source) {
      this._merge_source = merge_source;
      this.on_set_merge_source.notify({
        type: merge_source  
      });
    }

    upload_file(file, on_error, on_success) {
      Notebook.read_from_file(file, {
          on_load_end: () => {},
          on_error: (message) => {
              this._notebook_from_file = undefined;
              if(on_error) {
                on_error(message);
              }
          },
          on_notebook_parsed: (read_notebook) => {
              this._notebook_from_file = read_notebook;
              if(on_success) {
                on_success(read_notebook);
              }
          }
      });
    }

    get_notebooks_info(other_notebook) {
      let info = {
            'owned': {},
            'other': {},
            'union': {}
          },
          notebooks_for_compare = {
            'owned': shell.notebook.model.controller.current_gist(),
            'other': other_notebook
          };

      _.each(Object.keys(notebooks_for_compare), (source) => {
        info[source].files = _.chain(RCloud.utils.clean_r(notebooks_for_compare[source].files))
          .values().map(f => { 
            return { 
              isBinary: f.content.hasOwnProperty('r_type') || f.isBinary,
              type: Notebook.is_part_name(f.filename) ? 'part' : 'asset',
              filename: f.filename,
              content: f.content,
              language: f.language
            }}).value();
      });

      info.union.files = _.uniq(_.union(info.other.files, info.owned.files), false, (item) => { return item.type && item.filename; }).sort((f1, f2) => f1.filename.localeCompare(f2.filename, undefined, {numeric: true}));

      return info;
    }

    get_changes(from_notebook) {

      var get_notebook_by_id = (id) => {
        if(!Notebook.valid_gist_id(id)) {
          return Promise.reject(new Error(MESSAGES.invalid_notebook_id_error));
        } else if(id.toLowerCase() === shell.gistname().toLowerCase()) {
          return Promise.reject(new Error(MESSAGES.same_notebook_error));
        }
        return rcloud.get_notebook(id);
      };

      var get_notebook_func;

      this.on_getting_changes.notify();
      
      if(this._merge_source === 'id') {
        get_notebook_func = get_notebook_by_id;
      } else if(this._merge_source === 'file') {
          get_notebook_func = () => {
            if(this._notebook_from_file) {
              return Promise.resolve(this._notebook_from_file);
            } else {
              return Promise.reject(new Error(MESSAGES.no_file_to_upload_error));
            }
          };
      } else if(this._merge_source === 'url') {
        get_notebook_func = (url) => {
          var id = RCloud.utils.get_notebook_from_url(url);
          if(!id) {
            return Promise.reject(new Error(MESSAGES.invalid_url_error));
          } else {
            return get_notebook_by_id(id);
          }
        };
      }
        
      get_notebook_func.call(this, from_notebook).then((notebook) => {

        this._other_notebook_description = notebook.description;

        // Persist selection with current notebook
        rcloud.set_notebook_property(shell.gistname(), MERGE_CHANGES_BY, `${this._merge_source}:${from_notebook}`);

        // file-based merges don't have filename property, however empty notebooks don't have such property set either. Set it, for later:
        if(!notebook.files[Object.keys(notebook.files)[0]].hasOwnProperty('filename') &&
            !notebook.files.hasOwnProperty('r_type')) {
          Object.keys(notebook.files).forEach(f => {
            if(f.endsWith(BINARY_SUFFIX)) {
              notebook.files[f].filename = f.substring(0, f.length - BINARY_SUFFIX.length);
              notebook.files[f].isBinary = true;
            } else {
              notebook.files[f].filename = f;
            }
          });
        }

        this._comparison = this.get_notebooks_info(notebook);
        this.update_compare_details();

      }).catch((e) => {

        let message;

        if(e.message.indexOf('Not Found (404)') !== -1) {
          message = MESSAGES.not_found_notebook_error;
        } else {
          message = e.message;
        }

        this.on_get_changes_error.notify({
          message 
        });
      });
    }

    apply_review_change(filename, change) {

      let fileModified = _.findWhere(this._comparison.union.files, {filename: filename}),
          fileChange = _.findWhere(fileModified.changeDetails.modifiedLineInfo, {
            startLineNumber: change.startLineNumber,
            endLineNumber: change.endLineNumber
          });

      fileChange.isRejected = !fileChange.isRejected;
        
      this.on_review_change.notify({
        change: change,
        filename: fileModified.filename,
        fileType: fileModified.type
      });
      this.on_changeset_change.notify(this._comparison.union.files);
    }

    update_compare_details() {
      const get_change_details = (filename, type) => {
        const where = { filename, type },
              owned = _.findWhere(this._comparison.owned.files, where),
              other = _.findWhere(this._comparison.other.files, where);

        return this._diff_engine.get_diff_info(owned, other);
      };
      
      this.on_file_list_complete.notify({
        files: this._comparison.union.files
      });

      _.each(this._comparison.union.files, (file) => {

        file.changeDetails = get_change_details(file.filename, file.type);

        this.on_file_diff_complete.notify({
          isBinary: file.isBinary,
          fileType: file.type,
          filename: file.filename,
          changeDetails: file.changeDetails
        });
      });
      
      this.on_changeset_change.notify(this._comparison.union.files);
    }

    setFileInclusion(file, include) {
      let fileChange = _.findWhere(this._comparison.union.files, file);
      fileChange.include = include;
      if(fileChange.changeDetails.isChanged) {
          fileChange.changeDetails.modifiedLineInfo.forEach((el) => {
            el.isRejected = !include;
            
            this.on_review_change.notify({
              change: el,
              filename: fileChange.filename,
              fileType: fileChange.type
            });
          });
      }
      this.on_changeset_change.notify(this._comparison.union.files);
    }
    
    getFileChange(file) {
      return _.findWhere(this._comparison.union.files, file);
    }
    
    getFileLineChanges(file) {
      return _.findWhere(this._comparison.union.files, file).changeDetails.modifiedLineInfo;
    }
    
    getFileChangesCount(file) {
      let fileChange = _.findWhere(this._comparison.union.files, file);
      
      if(!fileChange.isBinary && fileChange.changeDetails.isChanged) {
          return _.filter(fileChange.changeDetails.modifiedLineInfo, (el) => {
            return !el.isRejected;
          }).length;
      }
      if(fileChange.isBinary) {
        if(!fileChange.hasOwnProperty('include') || fileChange.include) {
          return 1;
        }
      }
      return 0;
    }
    
    getNumberOfChanges(file) {
      let fileChange = _.findWhere(this._comparison.union.files, file);
      
      if(!fileChange.isBinary && fileChange.changeDetails.isChanged) {
          return fileChange.changeDetails.modifiedLineInfo.length;
      }
      if(fileChange.isBinary) {
          return 1;
      }
      return 0;
    }
    
    getChangesToApply() {
      
      let includeFile = (f) => {
        let { modifiedLineInfo } = f.changeDetails;

        if(f.hasOwnProperty('include')) {
          return f.include;
        } else if(!f.hasOwnProperty('include') && f.isBinary) { // we don't compare binary files, they are only treated as modified
          return true;
        } else if(modifiedLineInfo.length !== _.where(modifiedLineInfo, { isRejected: true }).length) {
          return true;
        } else {
          return false;
        }
      };
      
      return _.chain(this._comparison.union.files)
              .filter(f => includeFile(f))
              .map(f => {
                // Backend uses .b64 suffix hint to handle Base64 encoded content.
                let filename = f.content.hasOwnProperty('r_type') || !f.isBinary ? f.filename : f.filename + BINARY_SUFFIX; 
                let erase = f.changeDetails.isDeleted;
                
                return {
                  filename: filename,
                  language: f.isBinary ? null : f.language,
                  content: this._diff_engine.getResolvedContent(f),
                  erase
              }})
              .value();
    }

    applyMerge() {
      this.on_merge_start.notify();

      let changes = this.getChangesToApply();

      if(changes.length > 0) {
        editor.merge_notebook(changes).then(() => {
          this.on_merge_complete.notify();
        });
      } else {
        this.on_merge_complete.notify();
      }
    };

  }

  return new merger_model();
});

require(["vs/editor/editor.main"], () => {
    const DEFAULT_LANGUAGE = 'rcloud';
    monaco.languages.register({
        id: DEFAULT_LANGUAGE
    });
RCloudNotebookMerger.view = (function(model) {

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
      this.registerCodeLensProvider();

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
                });

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
                  });

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
              console.warn('editor for model id ' + model.id + ' not found');
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
});

RCloudNotebookMerger.controller = (function(model, view) {

  const merger_controller = class {
    constructor(model, view) {
      this._model = model;
      this._view = view;
    }

    show_dialog() {
      this._view.open();
    }

    submit_dialog() {
      this._view.submit();
    }

    is_dialog_open() {
      return this._view.is_open();
    }
  };

  return new merger_controller(model, view);

});

//# sourceMappingURL=merger_bundle.js.map