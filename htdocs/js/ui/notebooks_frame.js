// eventually more of editor_tab might land here.  for now, just
// initialization for loadable panel
RCloud.UI.notebooks_frame = {
    body: function() {
        return RCloud.UI.panel_loader.load_snippet('notebooks-snippet');
    },
    heading_content: function() {
        var new_notebook_button = $.el.a({'class':'header-button',
                                          'href': '#',
                                          'id': 'new-notebook',
                                          'style': 'display:none'},
                                         $.el.i({'class': 'icon-plus'}));
        return new_notebook_button;
    }
};
