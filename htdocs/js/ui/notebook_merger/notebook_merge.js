RCloud.UI.notebook_merge = (function() {
  const DialogStage = Object.freeze({
    INIT: 'init',
    GETTINGCHANGES: 'gettingchanges',
    COMPARE: 'compare'
  });

  const notebook_merge = class {
    constructor() {
      let that = this,
        _template = _.template($("#merger-template").html());

      this.templates_ = {
        file_list: _.template($('#compare-file-list-snippet').html()),
        compare_stage: _.template($('#compare-stage-snippet').html())
      };

      $("body").append(_template({}));
      this.dialog_ = $("#merger-dialog");
      this.select_by_ = $('#merge-changes-by');
      this.merge_notebook_file_ = $('#merge-notebook-file');
      this.merge_notebook_url_ = $('#merge-notebook-url');
      this.merge_notebook_id_ = $('#merge-notebook-id');

      this.compare_editor_selector = '#compare-editor';

      this.previous_diff_button_ = $("#previous-diff");
      this.next_diff_button_ = $("#next-diff");
      this.error_selector_ = '#merge-error';

      this.merge_notebook_details_ = $('#merge-notebook-details');

      this.compare_file_list_ = $('#compare-file-list');
      this.compare_stage_ = $('#compare-stage');

      this.button_init_ = this.dialog_.find('.btn-init');
      
      this.btn_show_changes_ = this.dialog_.find('.btn-primary.btn-primary.show-changes');
      this.inputs_ = [this.merge_notebook_file_, this.merge_notebook_url_, this.merge_notebook_id_];
      this.notebook_from_file_;
      this.same_notebook_error_ = 'You cannot merge from your current notebook; the source must be a different notebook.';
      this.invalid_notebook_id_error_ = 'Invalid notebook ID.';
      this.not_found_notebook_error_ = 'The notebook could not be found.';

      this.diff_editor_ = null;
      this.diff_navigator_ = null;

      this.dialog_stage_ = DialogStage.INIT;

      $(this.dialog_).on("shown.bs.modal", () => {
        
      });

      $(this.dialog_).on("hidden.bs.modal", () => {
        this.clear();
      });

      this.previous_diff_button_.click(() => {
        this.diff_navigator_.previous();
      });

      this.next_diff_button_.click(() => {
        this.diff_navigator_.next();
      });

      this.select_by_.change(() => {
          this.merge_notebook_file_.val(null);
          this.update_merged_by(this.select_by_.val());
      });
      
      [this.merge_notebook_file_, this.merge_notebook_url_, this.merge_notebook_id_].forEach(function(control) {
        control.keydown((e) => {
          if(e.keyCode === $.ui.keyCode.ENTER) {
            this.do_get_changes();
            e.preventDefault();
          }
        });
      });

      this.btn_show_changes_.click(() => {
        this.do_get_changes();
      });

      this.button_init_.click(() => {
        this.update_stage(DialogStage.INIT);
      });

      RCloud.UI.advanced_menu.add({
        merge_notebook: {
          sort: 1100,
          text: "Merge notebook",
          modes: ["edit"],  
          disabled_reason: "You can't merge into a read only notebook",
          action: function() {

            rcloud.get_notebook_property(shell.gistname(), 'pull-changes-by').then(function(val) {
              if(val && val.indexOf(':') !== -1) {
                // split and set:
                var separatorIndex = val.indexOf(':');
                var type = val.substring(0, separatorIndex);
                var value = val.substring(separatorIndex + 1);

                // update merged by method:
                that.update_merged_by(type, value);
              }
              else {
                that.update_merged_by('url');
              }

              that.dialog_.modal({ keyboard: true });
            });
          }
        }
      });
    }
    update_merged_by(merged_method, value) {
      this.clear_error();
      this.select_by_.val(merged_method);
      $(this.dialog_).find('div[data-by]').hide();
      $(this.dialog_).find('div[data-by="' + merged_method + '"]').show();

      if(!_.isUndefined(value)) {
        // and set the value coming in:
        this.get_input().val(merged_method === 'file' ? '' : value);
      }
    }
    get_method() {
      return this.select_by_.val();
    }
    get_input() {
      return $('#merge-notebook-' + this.get_method());
    }
    clear_error() {
      $(this.error_selector_).remove();
    }
    show_error(errorText) {
      this.clear_error();
      $('<div />', {
        id: this.error_selector_.substring(1),
        text: errorText
      }).appendTo($(this.dialog_).find('div[data-by="' + this.get_method() + '"]'));
    }
    has_error() {
      return $(this.error_selector_).length;
    }
    do_get_changes() {

      // give the user the benefit of the doubt:
      this.clear_error();

      var get_notebook_by_id = (id) => {
        if(!Notebook.valid_gist_id(id)) {
          return Promise.reject(new Error(this.invalid_notebook_id_error_));
        } else if(id.toLowerCase() === shell.gistname().toLowerCase()) {
          return Promise.reject(new Error(this.same_notebook_error_));
        }
        return rcloud.get_notebook(id);
      };

      var method = this.get_method();

      var get_notebook_func, notebook;

      this.update_when_getting_changes();

      if(method === 'id') {
        get_notebook_func = get_notebook_by_id;
      } else if(method === 'file') {
          get_notebook_func = () => {
            if(notebook_from_file_) {
              return Promise.resolve(notebook_from_file_);
            } else {
              return Promise.reject(new Error('No file to upload'));
            }
          };
      } else if(method === 'url') {
        get_notebook_func = (url) => {
          var id = RCloud.utils.get_notebook_from_url(url);
          if(!id) {
            return Promise.reject(new Error('Invalid URL'));
          } else {
            return get_notebook_by_id(id);
          }
        };
      }
    
      var value = this.get_input().val();
      
      get_notebook_func.call(this, value).then((notebook) => {
        // return Promise.all([
        //   rcloud.set_notebook_property(shell.gistname(), 'merge-changes-by', method + ':' + value),
        //   editor.pull_and_replace_notebook(notebook).then(function() {
        //     clear();
        //     dialog_.modal('hide');
        //   })
        // ]);

        // current notebook:
        

        rcloud.set_notebook_property(shell.gistname(), 'merge-changes-by', method + ':' + value);

        // massage the returned notebook so that it's easier to work with:
        let comparison = {
          from: this.prepare_notebook_for_comparison(shell.notebook.model.controller.current_gist()),
          to: this.prepare_notebook_for_comparison(notebook)
        };

        this.update_stage(DialogStage.COMPARE);

        this.update_compare_details(comparison);

      }).catch((e) => {
        this.reset_getting_changes_state();
      
        if(e.message.indexOf('Not Found (404)') !== -1) {
          this.show_error(not_found_notebook_error_);
        } else {
          this.show_error(e.message);
        }
      });
    }
    update_stage(dialogStage) {
      if(dialogStage == DialogStage.INIT) {
        this.reset_getting_changes_state();
      }
      
      if(dialogStage == DialogStage.COMPARE) {
        this.merge_notebook_details_.html(this.get_input().val());
      } else {
        this.merge_notebook_details_.html('');
      }

      this.dialog_
        .removeClass(Object.keys(DialogStage).map(key => key.toLowerCase()).join(' '))
        .addClass(dialogStage.toLowerCase());
    }
    update_when_getting_changes() {
      this.btn_show_changes_.text('Getting changes');
      this.dialog_.addClass('gettingchanges');
    }
    reset_getting_changes_state() {
      this.btn_show_changes_.text('Show changes');
    }
    clear() {
      if(this.diff_editor_) {
        this.diff_editor_.dispose();
      }

      $("#merge-container")
        .children()
        .remove();

      this.reset_getting_changes_state();

      this.inputs_.forEach((input) => {
          input.val('');
      });

      this.notebook_from_file_ = undefined;

      // default to URL for the next time:
      this.update_merged_by('url');

      this.update_stage(DialogStage.INIT);
    }
    prepare_notebook_for_comparison(notebook) {
      notebook.files = _.values(RCloud.utils.clean_r(notebook.files));
      notebook.parts = notebook.files.filter(f => Notebook.is_part_name(f.filename));
      notebook.assets = notebook.files.filter(f => !Notebook.is_part_name(f.filename));
      return notebook;
    }
    update_compare_details(comparison) {

      console.log('comparing: ', comparison);

      this.compare_file_list_.html(this.templates_.file_list({

      }));
      this.compare_stage_.html(this.templates_.compare_stage({

      }));
      
      require(["vs/editor/editor.main"], () => {
        this.diff_editor_ = monaco.editor.createDiffEditor(
          $(this.compare_editor_selector)[0],
          {
            renderSideBySide: false,
            language: "r"
          }
        );
        this.set_model();

        this.diff_navigator_ = monaco.editor.createDiffNavigator(
          this.diff_editor_,
          {
            ignoreCharChange: true,
            followsCaret: true,
            alwaysRevealFirst: true
          }
        );
      });
      
    }
    set_model() {
      
      this.diff_editor_.setModel({
        original: monaco.editor.createModel(
          [
            'print("There was an Old Man with a beard")',
            'print("Who said, "It is just as I feared!—")',
            'print("Two Owls and a Hen, four Larks and a Wren,")',
            'print("Have all built their nests in my beard.")'
          ].join("\n")
        ),
        modified: monaco.editor.createModel(
          [
            'print("A bit of a silly limerick")',
            'print("~~~~~~~~~~~~~~~~~~~~~~~~~")',
            'print("There was an Old Woman with a beard")',
            'print("Who said, "It is just as I feared!—")',
            'print("Two Pigeons and a Hen, three Larks and a Wren,")',
            'print("Have all built their nests in my beard.")',
            'print("")',
            'print("Edward Lear")'
          ].join("\n")
        )
      });
      
    }
  };

  return {
      init: () => {
          return new notebook_merge();
      }
  };
})();
