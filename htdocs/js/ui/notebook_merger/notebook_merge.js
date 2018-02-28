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
      
      this.btn_pull_ = this.dialog_.find('.btn-primary');
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
      return $('#pull-notebook-' + get_method());
    }
    clear_error() {
      $(this.error_selector_).remove();
    }
    show_error(errorText) {
      clear_error();
      $('<div />', {
      id: this.error_selector_.substring(1),
      text: errorText
      }).appendTo($(this.dialog_).find('div[data-by="' + get_method() + '"]'));
    }
    has_error() {
      return $(this.error_selector_).length;
    }
    update_when_pulling() {
      this.btn_pull_.text('Pulling');
      this.dialog_.addClass('pulling');
    }
    reset_pulling_state() {
      this.btn_pull_.text('Pull');
      this.dialog_.removeClass('pulling');
    }
    clear() {
      this.diff_editor_.dispose();
      $("#merge-container")
        .children()
        .remove();

      // reset pulling state:
      this.reset_pulling_state();

      this.inputs_.forEach(function(input) {
          input.val('');
      });

      this.notebook_from_file_ = undefined;

      // default to URL for the next time:
      this.update_merged_by('url');
    }
  };

  return {
      init: () => {
          return new notebook_merge();
      }
  };
})();
