/* 
 Author: Arko
 Description:    This is a casperjs automated test script to load the main page of RCloud given that the user is logged-in to the Github account
 */

//Begin Tests

casper.test.begin("Login to Main page (user is logged-in to the Github account)", 3, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));

    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
        console.log("First we need to create the scenario where user is logged in to Github but not to RCloud");
    });

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.wait(10000);

    casper.viewport(1366, 768).then(function () {
        console.log('Logging out of RCloud');
        var z = casper.evaluate(function () {
            $('#rcloud-logout').click();

        });
        this.wait(7000);
        console.log('Now the user has logged out of RCloud ,but still signed in to Github. Now we can go ahead with the test case');
    });

    casper.thenOpen(rcloud_url, function () {
        console.log("logging into RCloud edit.html page");
        this.wait(7000);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(4000);

    });

    casper.run(function () {
        test.done();
    });
});
