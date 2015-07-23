/*
Author: Prateek    (tc_52.3.1)
Description:This is a casperjs automation script for checking that the published shiny.html notebook is visible to the anonymous user
*/


casper.test.begin("Shiny.html notebook opening as a Anonymous user", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions.js'));

    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
    });

    casper.wait(10000);

    //Login to GitHub and RCloud
    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    //Validating for RCloud main page to be loaded
    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
    });

    //logging out of RCloud
    casper.viewport(1366, 768).then(function () {
        console.log('Logging out of RCloud');
        this.click({type: 'xpath', path:".//*[@id='rcloud-navbar-menu']/li[5]/a"});
        this.wait(7000);
    });

    //Accessing Shiny.html for published notebook as anonymous user
    casper.thenOpen("http://127.0.0.1:8080/shiny.html?notebook=19899d00ed1252f66961", function () {
        this.wait(2000);
        this.test.assertUrlMatch("http://127.0.0.1:8080/shiny.html?notebook=19899d00ed1252f66961");
        this.echo('url loaded successfully now checking for the element');
        this.wait(3000);
        this.then(function () {
            this.test.assertExists('.container-fluid>h2', 'Required Element found hence "Shiny.html" loaded  successfully');
            this.wait(2000);
        });
    });

    casper.run(function () {
        test.done();
    });
});
