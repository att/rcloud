// eventually more of editor_tab might land here.  for now, just
// initialization for loadable panel
RCloud.UI.notebooks_frame = {
    body: function() {
        return RCloud.UI.panel_loader.load_snippet('notebooks-snippet');
    },
    heading_content: function() {
        var new_notebook_button = RCloud.UI.panel_loader.load_snippet('notebooks-panel-tmp');
        return new_notebook_button;
    },
    heading_content_selector: function() {
        return $('#notebooks-panel-inner');
    }
};
