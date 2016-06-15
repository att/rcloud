function main() {
    Promise.longStackTraces();

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    shell.is_view_mode(true);
    RCloud.UI.session_pane.init(); // really should be error logger which detects if there is a pane
    RCloud.UI.init();

    return RCloud.session.init(true).then(RCloud.UI.discovery_page.init);
}
