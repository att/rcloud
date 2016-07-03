
function getDocHeight(D) {
    return Math.max(
        Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
        Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
        Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    );
}

function size_this(div) {
    var D = $(div).find('iframe').contents()[0];

    if (!D || !D.body) {
        setTimeout(function() { size_this($(div)); }, 100);
    } else {
        var h = getDocHeight(D);
        $(div).find('iframe').height(h);
        $(div).find('iframe').attr('height', h);
    }
}

function resize_all() {
    var widgets = $('.rcloud-htmlwidget').find('div');
    $.map(
        widgets,
        function(w) {
            setTimeout(function() { size_this(w) }, 200)
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

$(document).ready(function() {
    add_hooks()
    function resizer() {
        var num_widgets = resize_all();
        if (num_widgets == 0) { setTimeout(resizer, 200); }
    }
    resizer()
});

function initWidget(div, html, k) {
    $(div).html(html)
    setTimeout(function() { size_this($(div)); }, 100);
    k(null, div);
}

(function() {
    return {
        create: function(div, html, k) {
            initWidget(div, html, k)
        }
    }
})()
