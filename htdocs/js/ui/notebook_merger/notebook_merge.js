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
      this.controller.submit_dialog();
    }
    
    is_open() {
      return this.controller.is_dialog_open();
    }
  };
  
  return {
      init: () => {
          const merger_dialog = new notebook_merger_dialog_widget();
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
