// eventually more of editor_tab might land here.  for now, just
// initialization for loadable panel
RCloud.UI.notebooks_frame = {
    body: function() {
        return RCloud.UI.panel_loader.load_snippet('notebooks-snippet');
    },
    heading_content: function() {
        var notebook_inner_panel = RCloud.UI.panel_loader.load_snippet('notebooks-panel-heading');
        return notebook_inner_panel;
    },
    heading_content_selector: function() {
        return $('#notebooks-panel-controls');
    }
};
