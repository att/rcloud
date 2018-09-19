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
      }
      this.controller.show_dialog();
    }
  };
  
  return {
      init: () => {
        const merger_dialog = new notebook_merger_dialog_widget();
        RCloud.UI.advanced_menu.add({
          merge_notebook: {
            sort: 1100,
            text: "Merge notebook",
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
