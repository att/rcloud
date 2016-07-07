/*
 Auther : Sanket
 Description:    This is a casperjs automated test script for verifying the disapperance of popover when the 'notebook info' option is clicked twice
 */

casper.test.begin("Check the dis-apperance of popover when the 'notebook info' option is clicked twice", 9, function suite(test) {

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
    casper.viewport(1364, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1364, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(4000);
    });

    //create a new notebook
    functions.create_notebook(casper);

    //Check for notebook info popover
    casper.then(function () {
        if (this.test.assertVisible({type: 'css', path: '.jqtree-selected > div:nth-child(1) > span:nth-child(1)'})) {
            console.log('selected notbook found');
            this.mouse.move('.jqtree-selected > div:nth-child(1) > span:nth-child(1)');
            this.waitUntilVisible(('.icon-info-sign'), function () {
                this.wait(2000);
                this.click('.icon-info-sign');
                console.log("clicking on notebook info icon");
                this.wait(3000);
                if (this.test.assertExists({type: 'xpath', path: '/html/body/div[4]'}, "Verifying for Popover")) {
                    this.test.pass("Popover content is present");
                } else {
                    this.test.fail("Popover content is not present");
                }
            });
        } else {
            console.log("Notebook not found");
        }
    });

    casper.then(function () {
        if (this.test.assertVisible({type: 'css', path: '.jqtree-selected > div:nth-child(1) > span:nth-child(1)'})) {
            console.log('selected notbook found');
            this.wait(2000);
            this.click('.icon-info-sign');
            console.log("clicking on notebook info icon again");
            this.wait(3000);
            if (this.test.assertExists({type: 'xpath', path: '/html/body/div[4]'},"verifying for popover")) {
                this.test.pass("Popover content hides after clicking on notebook info");
            } else {
                this.test.fail("Popover content is still present");
            }
        } else {
            console.log("Notebook not found");
        }
    });

    casper.run(function () {
        test.done();
    });
});


