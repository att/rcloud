/*
 Author: Prateek
 Description: This is a casperjs automated test script for showing that,If the entire content of an asset is 
 removed, on reloading the asset should get automatically deleted 
 */

//Begin Tests
casper.test.begin("Delete an asset by removing all its content", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var URL;
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

    casper.then(function () {
        for (var k = 1; k <= 80; k++) {
            this.click(x(".//*[@id='scratchpad-editor']/div[1]/div/div[2]/div"), {keepFocus: true});
            this.page.sendEvent("keypress", casper.page.event.key.Delete);
        }

        for (var k = 1; k <= 80; k++) {
            this.click(x(".//*[@id='scratchpad-editor']/div[1]/div/div[2]/div"), {keepFocus: true});
            this.page.sendEvent("keypress", casper.page.event.key.Backspace);
        }

        this.wait(3000);
        this.click(x(".//*[@id='save-notebook']"));
    });

    casper.reload(function () {
        this.echo("Reloading page again");
    });

    casper.wait(8000).then(function () {
        this.test.assertSelectorDoesntHaveText(x(".//*[@id='asset-list']"), 'scratch.R', "Successfully deleted the scratch.R asset");
    });

    casper.run(function () {
        test.done();
    });
});



