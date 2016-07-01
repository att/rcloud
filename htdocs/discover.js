function main() {
    Promise.longStackTraces();

    if(ui_utils.is_ie()) {
        RCloud.UI.fatal_dialog("Sorry, RCloud does not currently support IE or Edge. Please try another browser.", "Close");
        return Promise.resolve();
    }

    shell.is_view_mode(true);
    RCloud.UI.session_pane.init(); // really should be error logger which detects if there is a pane
    RCloud.UI.init();

    return RCloud.session.init(true)
        .then(RCloud.UI.navbar.load)
        .then(RCloud.UI.discovery_page.init);
}
