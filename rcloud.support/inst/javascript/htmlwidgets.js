
function getDocHeight(D) {
    return Math.max(
        Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
        Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
        Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    );
}

var lastWidths = { };

function size_this(div, reset) {
    // Check if the widget has a <body> already. If not, we need to wait
    // a bit
    var D = $(div).find('iframe').contents()[0];

    if (!D || !D.body) {
        setTimeout(function() { size_this($(div), reset); }, 100);
    } else {
        // Check if the width of the iframe is different. If not, then
        // we don't need to do anything.
        var rcid = div.id;
        var width = $(div).find('iframe').width();
        if (reset || (! rcid in lastWidths) || (lastWidths[rcid] < width)) {
            var h = getDocHeight(D);
            $(div).find('iframe').height(h);
            $(div).find('iframe').attr('height', h);
        }
        lastWidths[rcid] = width;
    }
}

function resize_all(reset) {
    var widgets = $('.rcloud-htmlwidget').find('div');
    $.map(
        widgets,
        function(w) {
            setTimeout(function() { size_this(w, reset) }, 200)
        }
    );

    return widgets.length;
}

var hooks = false;

function add_hooks() {
    if (!hooks) {
        hooks = true;
        window.addEventListener('resize', resize_all, true);
    };
}

// The resizer is mainly for mini.html, but might be handy for
// notebook as well, if some widgets resize very slowly.

var lastWidth = window.innerWidth;

$(document).ready(function() {
    add_hooks()
    function resizer(reset) {
        var num_widgets = resize_all(reset);
        var interval = 200;
        if (num_widgets > 0) {
            setTimeout(resizer, 5000);
        } else {
            setTimeout(function() { resizer(true) }, interval);
        }
    }
    resizer(lastWidth < window.innerWidth);
    lastWidth = window.innerWidth;
});

function initWidget(div, html, k) {
    $(div).html(html)
    setTimeout(function() { size_this($(div), true); }, 100);
    k(null, div);
}

(function() {
    return {
        create: function(div, html, k) {
            initWidget(div, html, k)
        }
    }
})()
