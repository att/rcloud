//////////////////////////////////////////////////////////////////////////
// resize left and right panels by dragging on the divider

RCloud.UI.column_sizer = {
    init: function() {
        $('.notebook-sizer').draggable({
            axis: 'x',
            opacity: 0.75,
            zindex: 10000,
            revert: true,
            revertDuration: 0,
            grid: [window.innerWidth/12, 0],
            stop: function(event, ui) {
                var wid_over_12 = window.innerWidth/12;
                // position is relative to parent, the notebook
                var diff, size;
                if($(this).hasClass('left')) {
                    diff = Math.round(ui.position.left/wid_over_12);
                    size = Math.max(1,
                                    Math.min(+RCloud.UI.left_panel.colwidth() + diff,
                                             11 - RCloud.UI.right_panel.colwidth()));
                    if(size===1)
                        RCloud.UI.left_panel.hide(true, true);
                    else
                        RCloud.UI.left_panel.show(true, true);
                    RCloud.UI.left_panel.colwidth(size);
                    RCloud.UI.middle_column.update();
                }
                else if($(this).hasClass('right')) {
                    diff = Math.round(ui.position.left/wid_over_12) - RCloud.UI.middle_column.colwidth();
                    size = Math.max(1,
                                    Math.min(+RCloud.UI.right_panel.colwidth() - diff,
                                             11 - RCloud.UI.left_panel.colwidth()));
                    if(size===1)
                        RCloud.UI.right_panel.hide(true, true);
                    else
                        RCloud.UI.right_panel.show(true, true);
                    RCloud.UI.right_panel.colwidth(size);
                    RCloud.UI.middle_column.update();
                }
                else throw new Error('unexpected shadow drag with classes ' + $(this).attr('class'));
                // revert to absolute position
                $(this).css({left: "", right: "", top: ""});
            }
        });

        // make grid responsive to window resize
        $(window).resize(function() {
            var wid_over_12 = window.innerWidth/12;
            $('.notebook-sizer').draggable('option', 'grid', [wid_over_12, 0]);
        });
    }
};

