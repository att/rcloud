/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that on clicking the GitHub Logout button present in 
 "goodbye.R" page, the user gets a notification if he/she wants to log out of GitHub,confirming which,the user
 gets logged out from GitHub and Sign-In page of github.com opens
 */

//Begin Tests

casper.test.begin("Logout of Github", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

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
        test.comment('⌚️  Logging out of RCloud and GitHub...');
        this.wait(13000)
        // console.log('Logging out of RCloud');
        this.click("#rcloud-navbar-menu > li:nth-child(7) > a:nth-child(1)");
    });

    casper.then(function () {
        this.wait(7000);
        this.click('#main-div > p:nth-child(2) > a:nth-child(2)')
    });

    casper.then(function () {
        this.wait(7000);
        this.echo("The url where the user can confirm logging out from Github : " + this.getCurrentUrl());
        this.test.assertTextExists('Are you sure you want to sign out?', "Option to Sign Out of GitHub exists");
        this.click('.btn');
        this.wait(4000);
    });

    casper.viewport(1366, 768).then(function () {
        this.echo("The url after logging out of Github : " + this.getCurrentUrl());
        this.test.assertTextExists('GitHub', "Confirmed that successfully logged out of Github");
    });


    casper.run(function () {
        test.done();
    });
});
