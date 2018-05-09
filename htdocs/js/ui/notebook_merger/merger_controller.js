RCloud.UI.merger_controller = (function(model, view) {

  const merger_controller = class {
    constructor(model, view) {
      this._model = model;
      this._view = view;
    }

    show_dialog() {
      this._model.get_notebook_merge_info();
    }
  };

  return new merger_controller(model, view);

});