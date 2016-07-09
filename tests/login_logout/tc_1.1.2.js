/* 
 Author: Arko
 Description:    This is a casperjs automated test script to load the main page of Rcloud given that the user is not logged-in to the Github account. 
 The 'login.R' page will be re-directed to the Github page asking for credentials and then it will load the main page of Rcloud
 */

//Begin Tests

casper.test.begin("Login to Main page (user is not logged-in to the Github account)", 3, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));

    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
    });

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.wait(10000);


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
