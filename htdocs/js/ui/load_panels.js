RCloud.UI.load_panels = function() {
    function add_panel(side, name, title, icon_class, heading_content,
                       colwidth, greedy, body) {
        var parent_id = 'accordion-' + side;
        var collapse_id = 'collapse-' + name;
        var heading_attrs = {'class': 'panel-heading',
                                'data-toggle': 'collapse',
                                'data-parent': '#' + parent_id, // note: left was broken '#accordion'
                                'data-target': '#' + collapse_id};
        var heading;
        var title_span = $.el.span({'class': 'title-offset'},
                                   title),
            icon = $.el.i({'class': icon_class}),
            heading_link = $.el.a({'class': 'accordion-toggle ' + side,
                                   'href': '#' + collapse_id},
                                  icon, '\u00a0', title_span);

        if(side==='left') {
            heading = $.el.div(heading_attrs,
                               heading_link,
                               heading_content);
        }
        else if(side==='right') {
            heading = $.el.div(heading_attrs,
                               heading_content,
                               heading_link);
        }
        else throw new Error('Unknown panel side ' + side);
        var collapse_attrs = {'id': collapse_id,
                             'class': 'panel-collapse collapse',
                             'data-colwidth': colwidth};
        if(greedy)
            collapse_attrs['data-widgetheight'] = 'greedy';
        var collapse = $.el.div(collapse_attrs,
                                $.el.img({'height': '100%',
                                          'width': '5px',
                                          'src': side==='left' ? '/img/right_bordergray.png' : '/img/left_bordergray.png',
                                          'class': 'panel-shadow ' + side}),
                                body);
        var panel = $.el.div({'class': 'panel panel-default'},
                             heading, collapse);

        $('#' + parent_id).append(panel);
    }

    function add_filler_panel(side) {
        var parent_id = 'accordion-' + side;
        var body = $('<div/>', {'class': 'panel-body',
                                'style': 'border-top-color: transparent; background-color: #777'});
        for(var i=0; i<60; ++i)
            body.append($.el.br());
        var collapse = $.el.div({'class': 'panel-collapse out'},
                                body[0]);
        var panel = $.el.div({'class': 'panel panel-default'},
                             collapse);

        $('#' + parent_id).append(panel);
    }

    function load_snippet(id) {
        // embed html snippets in edit.html as "html scripts"
        // technique described here: http://ejohn.org/blog/javascript-micro-templating/
        return $($('#' + id).html())[0];
    }

    // left panels
    var new_notebook_button = $.el.a({'class':'header-button',
                                      'href': '#',
                                      'id': 'new-notebook',
                                      'style': 'display:none'},
                                     $.el.i({'class': 'icon-plus'}));
    var notebooks_body = load_snippet('notebooks-snippet');
    add_panel('left', 'notebook-tree', 'Notebooks',
              'icon-folder-open', new_notebook_button, 3, true, notebooks_body);

    var search_body = load_snippet('search-snippet');
    add_panel('left', 'search', 'Search',
              'icon-search', null, 4, false, search_body);

    var help_body = load_snippet('help-snippet');
    add_panel('left', 'help', 'Help',
              'icon-question', null, 5, false, help_body);

    add_filler_panel('left');


    // right panels
    var assets_body = load_snippet('assets-snippet');
    add_panel('right', 'assets', 'Assets',
              'icon-copy', null, 4, true, assets_body);

    var upload_body = load_snippet('file-upload-snippet');
    add_panel('right', 'file-upload', 'File Upload',
              'icon-upload', null, 2, false, upload_body);

    var comments_body = load_snippet('comments-snippet');
    add_panel('right', 'comments', 'Comments',
              'icon-comments', null, 2, false, comments_body);

    var session_info_body = load_snippet('session-info-snippet');
    add_panel('right', 'session-info', 'Session',
              'icon-info', null, 3, false, session_info_body);

    add_filler_panel('right');
};
