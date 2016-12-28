/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that on clicking the link "Log Back In", "edit.html"
 page gets loaded for the same user who just logged out, without asking for credentials if the user is 
 logged-in to the Github account
 */

//Begin Tests

casper.test.begin("Log Back In -> user is logged-in to the Github account", 7, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));

    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
    });

    casper.wait(10000);

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(4000);
    });

    //loging out of RCloud
    casper.viewport(1366, 768).then(function () {
        test.comment('⌚️  Logging out of RCloud...');
        this.wait(7000)
        this.click("#rcloud-navbar-menu > li:nth-child(7) > a:nth-child(1)");
    });

    casper.then(function () {
        this.wait(7000);
        test.comment("'⌚️  Logged out of RCloud and Verifying for Log back in option")
        this.test.assertExists("#main-div > p:nth-child(1) > a:nth-child(1)", "Log back in option exists");
    });

    casper.then(function (){
        this.click('#main-div > p:nth-child(1) > a:nth-child(1)');
        console.log("Clicking on LogBack in option");
    });

    //Confirming that user has got redirected to RCloud main page

    casper.viewport(1366, 768).then(function () {
        this.echo("The url after logging back to RCloud : " + this.getCurrentUrl());
        this.test.assertTitleMatch(/RCloud/, 'RCloud Home page loaded again');
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);

    });

    casper.run(function () {
        test.done();
    });
});
