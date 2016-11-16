/*
 Author: Prateek
 Description: This is a casperjs automated test script for showing that,If there are no assets present , the Assets div should be uneditable
 */

//Begin Tests
casper.test.begin("If there are no assets present, the Assets div should be uneditable", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var URL;
    var fileName = "SampleFiles/PHONE.csv";
    var system = require('system');
    var currentFile = require('system').args[4];
    var curFilePath = fs.absolute(currentFile);
    var curFilePath = curFilePath.replace(currentFile, '');
    fileName = curFilePath + fileName;

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

    casper.wait(10000);

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
    });

    functions.create_notebook(casper);

    casper.then( function () {
        URL = this.getCurrentUrl();
        this.thenOpen(URL);
    });

    casper.wait(5000);

    casper.then(function () {
        this.click(x(".//*[@id='asset-list']/li[2]/div/span[2]/i"));
        console.log('Deleting existing "scratch.R" asset');
        this.test.assertSelectorDoesntHaveText(x(".//*[@id='asset-list']"), 'scratch.R', "Successfully deleted the scratch.R asset");
    });

    casper.wait(3000).then(function () {
        this.sendKeys(x(".//*[@id='scratchpad-editor']"), "SENDING_TEXT");
        console.log("After deleting asset, Now adding text to check whether asset div is editable or not")
        this.wait(3000);
        this.test.assertSelectorDoesntHaveText(x(".//*[@id='scratchpad-editor']"), "SENDING_TEXT", "Asset div is uneditable, if there are no Assets");
    });

    casper.run(function () {
        test.done();
    });
});