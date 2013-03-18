(function() {
    if (!$.cookies.test()) {
        window.location.replace("cookies_required.html");
        return;
    }
    var cookies = $.cookies.get();
    if (cookies.user === undefined) {
        window.location.replace("login.R");
    }
})();
