RCloudNotebookMerger.controller = (function(model, view) {

  const merger_controller = class {
    constructor(model, view) {
      this._model = model;
      this._view = view;
    }

    show_dialog() {
      this._view.open();
    }

    submit_dialog() {
      this._view.submit();
    }

    is_dialog_open() {
      return this._view.is_open();
    }
  };

  return new merger_controller(model, view);

});
