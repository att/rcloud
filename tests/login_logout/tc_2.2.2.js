/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that on clicking 
 the link "Log Back In", the page gets re-directed to the Github page asking for credentials and then, "edit.html" page is loaded 
 */

//Begin Tests

casper.test.begin("Log Back In -> user is not logged-in to the Github account", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var logout_url = "http://127.0.0.1:8080/goodbye.R";
    var functions = require(fs.absolute('basicfunctions'));

    casper.start(logout_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
        console.log("Here we will start the test cases using the goodbye.R url instead of login.R. Then, if the user is not logged in to Github, he will be redirected to the Github page")
    });

    casper.viewport(1024, 768).then(function () {
        this.echo("The current url : " + this.getCurrentUrl());
        this.test.assertTextExists(
            'Log back in', "Log Back In option exists"
        );
        console.log('Selecting Log Back In option');
        this.click({type: 'css', path: '#main-div > p:nth-child(1) > a:nth-child(1)'});
    });

    casper.wait(7000);

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
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
