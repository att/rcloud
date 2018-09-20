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

      this.DialogStage = Object.freeze({
        INIT: 'init',
        GETTINGCHANGES: 'gettingchanges',
        COMPARE: 'compare',
        APPLYINGCHANGES: 'applyingchanges'
      });

      this.on_diff_complete = new RCloud.UI.event(this);
      this.on_file_diff_complete = new RCloud.UI.event(this);
      this.on_file_list_complete = new RCloud.UI.event(this);
      this.on_get_changes_error = new RCloud.UI.event(this);
      this.on_getting_changes = new RCloud.UI.event(this);
      this.on_reset_complete = new RCloud.UI.event(this);
      this.on_review_change = new RCloud.UI.event(this);
      this.on_set_stage = new RCloud.UI.event(this);
      this.on_set_merge_source = new RCloud.UI.event(this);
      this.on_merge_start = new RCloud.UI.event(this);
      this.on_merge_complete = new RCloud.UI.event(this);
      
      this._diff_engine = new RCloudNotebookMerger.diff_engine();

      this._dialog_stage = this.DialogStage.INIT;
      this._merge_source = DEFAULT_SOURCE;
      this._notebook_from_file = undefined;
      this._delta_decorations = [];
      this._diff_info = [];
      this._diff_list = [];
      this._other_notebook_description = undefined;
      this._currentFile = undefined;
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
      this._dialog_stage = this.DialogStage.INIT;
      this._diff_engine = new RCloudNotebookMerger.diff_engine();

      this._delta_decorations = [];
      this._diff_info = [];
      this._diff_list = [];
      this._other_notebook_description = undefined;

      this._currentFile = undefined;
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

    upload_file(file) {
      Notebook.read_from_file(file, {
          on_load_end: () => {},
          on_error: (message) => {
              this._notebook_from_file = undefined;
              show_error(message);
          },
          on_notebook_parsed: (read_notebook) => {
              this._notebook_from_file = read_notebook;
          }
      });
    }
    
    prepare_notebook_for_comparison(notebook) {
      notebook.files = _.values(RCloud.utils.clean_r(notebook.files));
      notebook.parts = notebook.files.filter(f => Notebook.is_part_name(f.filename)).sort((p1, p2) => { 
        return p1.filename.localeCompare(p2.filename, undefined, { sensitivity: 'base' });
      });
      notebook.assets = notebook.files.filter(f => !Notebook.is_part_name(f.filename)).sort((a1, a2) => { 
        return a1.filename.localeCompare(a2.filename, undefined, { sensitivity: 'base' });
      });
      return notebook;
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
          .values().map(f => { return { 
            isBinary: f.content.hasOwnProperty('r_type') || f.isBinary,
            type: Notebook.is_part_name(f.filename) ? 'part' : 'asset',
            filename: f.filename,
            content: f.content,
            language: f.language
          }}).value();
      });

      info.union.files = _.uniq(_.union(info.other.files, info.owned.files), false, (item) => { return item.type && item.filename; });

      return info;
    }

    set_comparison_as(type, filename) {

      const _ = window._;

      this._currentFile = { type, filename };
      let owned = _.findWhere(this._comparison.owned.files, this._currentFile);
      let other = _.findWhere(this._comparison.other.files, this._currentFile);
      let diffInfo = _.findWhere(this._comparison.union.files, this._currentFile).changeDetails;

      this._diff_list = diffInfo ? diffInfo.modifiedLineInfo : [];

      this.on_diff_complete.notify({
        diff: diffInfo,
        owned: owned ? owned.content : '',
        other: other ? other.content : ''
      });
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

        // file-based merges don't have filename property, set, for later:
        if(!notebook.files[Object.keys(notebook.files)[0]].hasOwnProperty('filename')) {
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

    apply_review_change(change) {

      let fileModified = _.findWhere(this._comparison.union.files, this._currentFile),
          fileChange = _.findWhere(fileModified.changeDetails.modifiedLineInfo, {
            startLineNumber: change.startLineNumber,
            endLineNumber: change.endLineNumber
          });

      fileChange.isRejected = !fileChange.isRejected;
        
      this.on_review_change.notify({
        reviewList: this._diff_list,
        change: change,
        file: this._currentFile
      });
    }

    update_decorations(decorations) {
      this._delta_decorations = decorations;
    }

    get_decorations() {
      return this._delta_decorations;
    }

    update_compare_details() {
      const get_change_details = (filename, type) => {
        const where = { filename, type },
              owned = _.findWhere(this._comparison.owned.files, where),
              other = _.findWhere(this._comparison.other.files, where);

        return this._diff_engine.get_diff_info(owned, other);
      };

      this._dialog_stage = this.DialogStage.COMPARE;

      this.on_file_list_complete.notify({
        files: this._comparison.union.files
          .sort((f1, f2) => f1.filename.localeCompare(f2.filename, undefined, {numeric: true}))
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
    }

    setFileInclusion(file, include) {
      _.findWhere(this._comparison.union.files, file).include = include;
    }

    applyMerge() {

      this.on_merge_start.notify();

      let includeFile = (f) => {
        let { modifiedLineInfo } = f.changeDetails;

        if(f.hasOwnProperty('include')) {
          return f.include;
        } else if(!f.hasOwnProperty('include') && f.isBinary) {
          return true;
        } else if(modifiedLineInfo.length !== _.where(modifiedLineInfo, { isRejected: true }).length) {
          return true;
        } else {
          return false;
        }
      }

      let changes = _.chain(this._comparison.union.files)
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

      editor.merge_notebook(changes).then(() => {
        this.on_merge_complete.notify();
      });
    }

    update_stage(stage) {
      this._dialog_stage_ = stage;

      this.on_set_stage.notify({
        stage
      });
    };
  }

  return new merger_model();
});
