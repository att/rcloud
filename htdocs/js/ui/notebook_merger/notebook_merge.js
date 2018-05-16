RCloud.UI.notebook_merge = (function() {

  const model = new RCloud.UI.merger_model(),
        view = new RCloud.UI.merger_view(model),
        controller = new RCloud.UI.merger_controller(model, view);

  return {
      init: () => {
        RCloud.UI.advanced_menu.add({
          merge_notebook: {
            sort: 1100,
            text: "Merge notebook",
            modes: ["edit"],  
            disabled_reason: "You can't merge into a read only notebook",
            action: function() {
              controller.show_dialog();
            }
          }
        });
      }
  };
})();
