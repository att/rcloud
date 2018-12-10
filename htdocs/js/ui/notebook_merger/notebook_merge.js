RCloudNotebookMerger = {};

RCloud.UI.addons.notebook_merge = (function() {
  const notebook_merger_dialog_widget = class {
    constructor() {
        this.model = null;
        this.view = null;
        this.controller = null;
    }
    
    show() {
      var that = this;
      return new Promise(function(resolve, reject) {
        if (!that.model) {
          require(["vs/editor/editor.main"], () => {
            monaco.languages.register({
              id: 'rcloud'
            });
            that.model = new RCloudNotebookMerger.model(),
            that.view = new RCloudNotebookMerger.view(that.model),
            that.controller = new RCloudNotebookMerger.controller(that.model, that.view);
            that.view.registerCodeLensProvider();
            that.controller.show_dialog();
            resolve();
          });
        } else {
          that.view.clear();
          that.controller.show_dialog();
          resolve();
        }
      });
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
              condition1: function (node) {
                return node.user === editor.username();
              },
              create: function (node) {
                var merge = ui_utils.fa_button('icon-code-fork icon-rotate-90', 'merge here', 'merge', RCloud.UI.notebook_commands.merge_icon_style(), true);
                merge.click(function (e) {
                  // Open merge dialogue
                  merger_dialog.show().then(function() { 
                    // Submit to next dialogue or fail if ID invalid.
                    $('#merge-notebook-id').val(node.gistname);
                    $('.show-changes').click();
                  });
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
