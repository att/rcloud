
function initWidget(div, html, k) {
    $(div).html(html);
    k(null, div);
}

(function() {
    return {
        create: function(div, html, k) {
            initWidget(div, html, k)
        }
    }
})()
