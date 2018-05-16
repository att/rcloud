RCloud.UI.merger_model = (function() {

  const ChangeType = Object.freeze({
    NEWFILE: 'newfile', 
    DELETEDFILE: 'deletedfile',
    BINARY: 'binary',
    IDENTICAL: 'nochange',
    MODIFIED: 'changed'
  });

  const ChangedTypeDescription = Object.freeze({
    [ChangeType.NEWFILE]: 'Added file', 
    [ChangeType.DELETEDFILE]: 'Deleted file',
    [ChangeType.BINARY]: 'Binary',
    [ChangeType.IDENTICAL]: 'Identical',
    [ChangeType.MODIFIED]: 'Files are different'
  });

  const merger_model = class {
    constructor() {

      this.DialogStage = Object.freeze({
        INIT: 'init',
        GETTINGCHANGES: 'gettingchanges',
        COMPARE: 'compare'
      });

      this.on_set_merge_source = new RCloud.UI.event(this);
      this.on_set_stage = new RCloud.UI.event(this);
      this.on_getting_changes = new RCloud.UI.event(this);
      this.on_get_changes_error = new RCloud.UI.event(this);
      this.on_reset_complete = new RCloud.UI.event(this);
      this.on_comparison_complete = new RCloud.UI.event(this);
      this.on_diff_complete = new RCloud.UI.event(this);

      this.on_review_change = new RCloud.UI.event(this);

      this._dialog_stage = this.DialogStage.INIT;
      this._merge_method;
      this._notebook_from_file = undefined;

      this._same_notebook_error = 'You cannot merge from your current notebook; the source must be a different notebook.';
      this._invalid_notebook_id_error = 'Invalid notebook ID.';
      this._not_found_notebook_error = 'The notebook could not be found.';

      this._diff_engine = new RCloud.UI.merging.diff_engine();

      this._delta_decorations = [];
      this._diff_info = [];
    }

    get_notebook_merge_info() {
      rcloud.get_notebook_property(shell.gistname(), 'merge-changes-by').then(val => {
        if(val && val.indexOf(':') !== -1) {
          // split and set:
          var separatorIndex = val.indexOf(':');
          var type = val.substring(0, separatorIndex);
          var value = val.substring(separatorIndex + 1);

          this._merge_method = type;
  
          // update merged by method:
          this.on_set_merge_source.notify({
            type, 
            value
          });
        }
        else {
          this.on_set_merge_source.notify({
            type: 'url' 
          });        
        }
      });
    }

    reset() {
      this._merge_method = 'url';
      this._notebook_from_file = undefined;
      this._dialog_stage = this.DialogStage.INIT;
      this.on_reset_complete.notify();
    }

    get_merge_method() {
      return this._merge_method;
    }

    update_merge_method(merge_method) {
      this._merge_method = merge_method;
      this.on_set_merge_source.notify({
        type: merge_method  
      });
    }

    prepare_notebook_for_comparison(notebook) {
      notebook.files = _.values(RCloud.utils.clean_r(notebook.files));
      notebook.parts = notebook.files.filter(f => Notebook.is_part_name(f.filename)).sort((p1, p2) => { 
        return p1.filename.localeCompare(p2.filename, undefined, { sensitivity: 'base' })
      });
      notebook.assets = notebook.files.filter(f => !Notebook.is_part_name(f.filename)).sort((a1, a2) => { 
        return a1.filename.localeCompare(a2.filename, undefined, { sensitivity: 'base' })
      });
      return notebook;
    }

    set_comparison_as(filetype, filename) {

      let from = _.findWhere(this._comparison.from[filetype], { 'filename' : filename });
      let to = _.findWhere(this._comparison.to[filetype], { 'filename' : filename });

      let diff_info = this._diff_engine.get_diff_info(from, to);

      this._diff_list = diff_info.modifiedLineInfo;

      this.on_diff_complete.notify({
        diff: diff_info,
        from: from ? from.content : '',
        to: to ? to.content : ''
      });
    }

    get_changes(from_notebook) {

      var get_notebook_by_id = (id) => {
        if(!Notebook.valid_gist_id(id)) {
          return Promise.reject(new Error(this.invalid_notebook_id_error_));
        } else if(id.toLowerCase() === shell.gistname().toLowerCase()) {
          return Promise.reject(new Error(this.same_notebook_error_));
        }
        return rcloud.get_notebook(id);
      };

      var get_notebook_func, notebook;

      this.on_getting_changes.notify();
      
      if(this._merge_method === 'id') {
        get_notebook_func = get_notebook_by_id;
      } else if(this._merge_method === 'file') {
          get_notebook_func = () => {
            if(notebook_from_file_) {
              return Promise.resolve(notebook_from_file_);
            } else {
              return Promise.reject(new Error('No file to upload'));
            }
          };
      } else if(this._merge_method === 'url') {
        get_notebook_func = (url) => {
          var id = RCloud.utils.get_notebook_from_url(url);
          if(!id) {
            return Promise.reject(new Error('Invalid URL'));
          } else {
            return get_notebook_by_id(id);
          }
        };
      }
        
      get_notebook_func.call(this, from_notebook).then((notebook) => {

        this._notebook_description = notebook.description;

        // current notebook:
        rcloud.set_notebook_property(shell.gistname(), 'merge-changes-by', `${this._merge_method}:${from_notebook}`);

        // massage the returned notebook so that it's easier to work with:
        this._comparison = {
          from: this.prepare_notebook_for_comparison(shell.notebook.model.controller.current_gist()),
          to: this.prepare_notebook_for_comparison(notebook)
        };

        this.update_compare_details(this._comparison);

        this.update_stage(this.DialogStage.COMPARE);

      }).catch((e) => {

        let message;

        if(e.message.indexOf('Not Found (404)') !== -1) {
          message = this._not_found_notebook_error;
        } else {
          message = e.message;
          console.error(e);
        }

        this.on_get_changes_error.notify({
          message 
        });
      });
    }

    apply_review_change(change) {

      // find index:
      const index = this._diff_list.findIndex(diff => diff.startLineNumber == change.startLineNumber && 
        diff.endLineNumber == change.endLineNumber);
      
      // remove decoration:
      this._diff_list.splice(index, 1);
      
      // 
      this.on_review_change.notify({
        reviewList: this._diff_list,
        change: change
      });
    }

    update_decorations(decorations) {
      this._delta_decorations = decorations;
    }

    get_decorations() {
      return this._delta_decorations;
    }

    update_compare_details(comparison) {

      // from, to
      // assets, files
      comparison.fileDiffs = {
      };

      const sources = ['from', 'to'];

      const get_change_type = (filename, file_type) => {
        const from = _.findWhere(comparison.from[file_type], { filename }),
              to = _.findWhere(comparison.to[file_type], { filename });

        if(!from && to) {
          return ChangeType.NEWFILE;
        } else if(from && !to) {
          return ChangeType.DELETEDFILE;
        } else if(from.content.r_type) {
          return ChangeType.BINARY;
        } else {
          return from.content == to.content ? ChangeType.IDENTICAL : ChangeType.MODIFIED;
        }
      };

      // derive a list of all assets and parts:
      _.each(['assets', 'parts'], (file_type) => {
        comparison.fileDiffs['all' + file_type[0].toUpperCase() + file_type.substring(1)] = 
        _.map(
        _.sortBy(
        _.union(...
        _.map(sources, s => {
          return _.pluck(comparison[s][file_type], 'filename');
        })), f => { return file_type === 'assets' ? f : f.match(/\d+/).map(Number)[0]; }), filename => { 
          return {
            filename,
            change_type: get_change_type(filename, file_type),
            get change_type_desc() {
              return ChangedTypeDescription[this.change_type];
            }
          }; 
        });
      });

      this.on_comparison_complete.notify({
        comparison: this._comparison
      });
    }

    update_stage(stage) {
      this._dialog_stage_ = stage;

      this.on_set_stage.notify({
        stage
      });
    }
  };

  return new merger_model();


});