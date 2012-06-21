(function() {
    if (!$.cookies.test()) {
        alert("Cookies disabled");
    }
    var cookies = $.cookies.get();
    if (cookies.user === undefined) {
        window.location.replace("login.html");
        // window.location.replace("http://mbp-cscheid.local/cgi-bin/login.py?url=" + encodeURIComponent(document.location.href));
    }
})();
