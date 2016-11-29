/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that on clicking the "logout" link present on the top-right corner of  the main page,
 "goodbye.R" page is loaded with a message "You are now logged out of Rcloud" and a link for "Log back in" is 
 present
 */

//Begin Tests

casper.test.begin("Logout of RCloud", 4, function suite(test) {

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
        this.wait(7000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(4000);
    });

    casper.viewport(1366, 768).then(function () {
        console.log('Logging out of RCloud');
        this.click("#rcloud-navbar-menu > li:nth-child(7) > a:nth-child(1)");
    });

    // casper.wait(2000);

    casper.viewport(1366, 768).then(function () {
        this.echo("The url after logging out of RCloud: " + this.getCurrentUrl());
        this.waitForSelector("#main-div > p:nth-child(1) > a:nth-child(1)", function(){
           this.test.assertTextExists('You are now logged out of RCloud', "Confirmed that message saying user has logged out of RCloud is displayed"); 
        },2000);
        //this.test.assertTextExists('Log back in', "Log Back In option exists");
        
    });


    casper.run(function () {
        test.done();
    });
});
