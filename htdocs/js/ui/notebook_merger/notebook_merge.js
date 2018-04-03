RCloud.UI.notebook_merge = (function() {
  const notebook_merge = class {
    constructor() {
      let that = this,
        _template = _.template($("#merger-template").html());

      $("body").append(_template({}));
      this.dialog_ = $("#merger-dialog");
      this.select_by_ = $('#merge-changes-by');
      this.merge_notebook_file_ = $('#merge-notebook-file');
      this.merge_notebook_url_ = $('#merge-notebook-url');
      this.merge_notebook_id_ = $('#merge-notebook-id');
      this.previousDiffButton_ = $("#previous-diff");
      this.nextDiffButton_ = $("#next-diff");
      this.error_selector_ = '#merge-error';
      
      this.btn_show_changes_ = this.dialog_.find('.btn-primary.btn-primary.show-changes');
      this.inputs_ = [this.merge_notebook_file_, this.merge_notebook_url_, this.merge_notebook_id_];
      this.notebook_from_file_;
      this.same_notebook_error_ = 'You cannot merge from your current notebook; the source must be a different notebook.';
      this.invalid_notebook_id_error_ = 'Invalid notebook ID.';
      this.not_found_notebook_error_ = 'The notebook could not be found.';

      this.diff_editor_ = null;
      this.diff_navigator_ = null;

      $(this._dialog).on("shown.bs.modal", () => {
        require(["vs/editor/editor.main"], function() {
          that.diff_editor_ = monaco.editor.createDiffEditor(
            $("#merge-container")[0],
            {
              renderSideBySide: false,
              language: "r"
            }
          );
          that.set_model();

          that.diff_navigator_ = monaco.editor.createDiffNavigator(
            that.diff_editor_,
            {
              ignoreCharChange: true,
              followsCaret: true,
              alwaysRevealFirst: true
            }
          );
        });
      });

      $(this._dialog).on("hidden.bs.modal", () => {
        this.clear();
      });

      this.previousDiffButton_.click(() => {
        this.diff_navigator_.previous();
      });

      this.nextDiffButton_.click(() => {
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
            alert('doing something');
            e.preventDefault();
          }
        });
      });

      this.btn_show_changes_.click(() => {
        this.do_get_changes();
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

                // update pulled by method:
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
    update_merged_by(pulled_method, value) {
      this.clear_error();
      this.select_by_.val(pulled_method);
      $(this.dialog_).find('div[data-by]').hide();
      $(this.dialog_).find('div[data-by="' + pulled_method + '"]').show();

      if(!_.isUndefined(value)) {
        // and set the value coming in:
        this.get_input().val(pulled_method === 'file' ? '' : value);
      }
    }
    get_method() {
      return this.select_by_.val();
    }
    get_input() {
      return $('#pull-notebook-' + this.get_method());
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

      function get_notebook_by_id(id) {
        if(!Notebook.valid_gist_id(id)) {
          return Promise.reject(new Error(invalid_notebook_id_error_));
        } else if(id.toLowerCase() === shell.gistname().toLowerCase()) {
          return Promise.reject(new Error(same_notebook_error_));
        }
        return rcloud.get_notebook(id);
      };

      var method = this.get_method();

      var get_notebook_func, notebook;

      this.update_when_getting_changes();

      if(method === 'id') {
        get_notebook_func = get_notebook_by_id;
      } else if(method === 'file') {
          get_notebook_func = function() {
            if(notebook_from_file_) {
              return Promise.resolve(notebook_from_file_);
            } else {
              return Promise.reject(new Error('No file to upload'));
            }
          };
      } else if(method === 'url') {
        get_notebook_func = function(url) {
          var id = RCloud.utils.get_notebook_from_url(url);
          if(!id) {
            return Promise.reject(new Error('Invalid URL'));
          } else {
            return get_notebook_by_id(id);
          }
        };
      }
    
      var value = this.get_input().val();
      
      this.dialog_.addClass('expanded');

      setTimeout(() => {
        get_notebook_func(value).then((notebook) => {
          // return Promise.all([
          //   rcloud.set_notebook_property(shell.gistname(), 'merge-changes-by', method + ':' + value),
          //   editor.pull_and_replace_notebook(notebook).then(function() {
          //     clear();
          //     dialog_.modal('hide');
          //   })
          // ]);
    
          this.clear();
          this.dialog_.modal('hide');
  
          return Promise.resolve();
  
        }).catch(function(e) {
          this.reset_getting_changes_state();
        
          if(e.message.indexOf('Not Found (404)') !== -1) {
            show_error(not_found_notebook_error_);
          } else {
            show_error(e.message);
          }
        });
      }, 4000);

      

    }
    update_when_getting_changes() {
      this.btn_show_changes_.text('Getting changes');
      this.dialog_.addClass('gettingchanges');
    }
    reset_getting_changes_state() {
      this.btn_show_changes_.text('Show changes');
      this.dialog_.removeClass('gettingchanges');
    }
    clear() {
      if(this.diff_editor_) {
        this.diff_editor_.dispose();
      }

      $("#merge-container")
        .children()
        .remove();

      this.reset_getting_changes_state();

      this.inputs_.forEach(function(input) {
          input.val('');
      });

      this.notebook_from_file_ = undefined;

      // default to URL for the next time:
      this.update_merged_by('url');

      this.dialog_.removeClass('expanded');
    }
  };

  return {
      init: () => {
          return new notebook_merge();
      }
  };
})();
