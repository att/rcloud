// eventually more of editor_tab might land here.  for now, just
// initialization for loadable panel
RCloud.UI.notebooks_frame = {
    body: function() {
        return RCloud.UI.panel_loader.load_snippet('notebooks-snippet');
    },
    heading_content: function() {
        var new_notebook_button = $.el.span({style: 'float: right; position: relative'},
                                            $.el.a({'class':'header-button',
                                                    'id': 'new-notebook',
                                                    'href': '#',
                                                    'style': 'display:none'},
                                                   $.el.span($.el.i({'class': 'icon-plus'}))));
        return new_notebook_button;
    },
    heading_content_selector: function() {
        return $("#new-notebook");
    }
};
