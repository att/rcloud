/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that after logging out, on clicking the "Github" hyperlink option on the
 goodbye.R page, the page gets re-directed to the Github page of the user
 */

//Begin Tests

casper.test.begin("Redirect to GitHub Page after logging out", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));

    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
    });

    casper.wait(10000);

    //login to Github and RCloud
    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(4000);
    });

    casper.viewport(1366, 768).then(function () {
        console.log('Logging out of RCloud');
        this.click("#rcloud-navbar-menu > li:nth-child(7) > a:nth-child(1)");
        this.wait(7000);   
    });

    casper.viewport(1366, 768).then(function () {
        this.echo("The url after logging out of RCloud: " + this.getCurrentUrl());
        this.test.assertTextExists(
            'Log back in', "Log Back In option exists"
        );
        this.test.assertTextExists(
            'GitHub', "Link to go to Github page exists"
        );
    });

    //navigating to Github page
    casper.viewport(1366, 768).then(function () {
        this.click({type: 'xpath', path: ".//*[@id='main-div']/p[2]/a[1]"});
        this.wait(7000);
    });

    //Confirming that user has got redirected to github page

    casper.viewport(1366, 768).then(function () {
        this.echo("The url after navigating to Github page : " + this.getCurrentUrl());
        test.assertUrlMatch("https://github.com/", "Github page has been loaded successfully");
    });


    casper.run(function () {
        test.done();
    });
});
