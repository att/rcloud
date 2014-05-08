//////////////////////////////////////////////////////////////////////////////
// GitHub authentication

exports.login = function(casper, opts) {
    var github_username = casper.cli.options['username'];
    var github_password = casper.cli.options['password'];
    var github_otp      = casper.cli.options['otp'];
    opts = opts || {};
    opts.width = opts.width || 1440;
    opts.height = opts.height || 900;

    return casper
        .start("http://127.0.0.1:8080/login.R")
        .then(function() {
            if (!casper.page.url.match(/\/login/)) {
                return true;
            }
            return casper
                .waitForSelector("#login > form")
                .then(function() {
                    return this.fill('#login > form', {
                        'login':    github_username,
                        'password': github_password
                    }, true);
                });
    }).then(function() {
        if (!casper.page.url.match(/\/session/)) {
            return true;
        }
        return casper.waitForSelector("form:nth-child(1)")
            .then(function() {
                return this.fill('form:nth-child(1)', {
                    'otp': github_otp
                }, true);
            });
    }).then(function() {
        casper.page.viewportSize = { width: opts.width, height: opts.height };
    });
};
