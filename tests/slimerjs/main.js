casper = require('casper').create();
fs = require('fs');
var login = require(fs.absolute('login'));

login.login(casper)
    .thenOpen("http://127.0.0.1:8080/main.html?notebook=6aebcdb2c2e174b98454")
    .then(function() { return casper.wait(3000); })
    .then(function() {
        casper.page.render('output.png');
    });

casper.run();
