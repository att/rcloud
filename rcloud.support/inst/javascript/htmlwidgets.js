
function getDocHeight(D) {
    return Math.max(
        Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
        Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
        Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    );
}

var hooks = false;

function size_this(div) {
    var D = $(div).find('iframe').contents()[0];
    var B = D.body;
    if (!B) {
        setTimeout(sizer, 100);
    } else {
        var h = getDocHeight(D);
        $(div).find('iframe').height(h);
        $(div).find('iframe').attr('height', h);
    }
}

function initWidget(div, html, k) {
    $(div).html(html)

    function sizer() {
        size_this($(div));
    }

    if (!hooks) {
        hooks = true;
        window.addEventListener('resize', function() {
            $.map(
                $('.rcloud-htmlwidget').find('div'),
                function(w) {
                    setTimeout(function() { size_this(w) }, 200)
                }
            );
        }, true)
    };

    setTimeout(sizer, 100);
    k(null, div);
}

(function() {
    return {
        create: function(div, html, k) {
            initWidget(div, html, k)
        }
    }
})()
