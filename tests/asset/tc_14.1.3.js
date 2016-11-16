/*
 Author: Prateek
 Description: This is a casperjs automated test script for showing that,If the contents of an asset are modified,
 they should be saved and changed contents should be visible on reload
 */

//Begin Tests
casper.test.begin(".Re-upload the previously modified file", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var before, after;
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

    //Verifying whether file upload div is open or not
    casper.then(function () {
        if (this.visible(x(".//*[@id='file']"))) {
            this.echo('File Upload pane div is open');
            this.wait(5000);
        }
        else {
            this.echo('File upload div is not open,hence opening it');
            this.wait(6000);
            this.click(x(".//*[@id='accordion-right']/div[2]/div[1]"));
            this.wait(5000);
        }
    });

    //Uploading file
    casper.then(function () {
        casper.page.uploadFile("#file", fileName);
        console.log('Selecting a file');
    });

    casper.then(function () {
        this.wait(5000, function () {
            this.click(x(".//*[@id='upload-to-notebook']"));
            console.log("Clicking on Upload to notebook check box");
            this.click(x(".//*[@id='upload-submit']"));
            console.log("Clicking on Submit icon");
        });
    });

    casper.then(function () {
        this.wait(5000);
        this.waitUntilVisible(x('//*[contains(text(), "added")]'), function then() {
            console.log("File has been uploaded");
        });
    });

    casper.then(function () {
        console.log('Verifying whether the uploaded contentsa are present in Asset div or not');
        this.test.assertSelectorHasText(x(".//*[@id='asset-list']/li[3]/div"), 'PHONE.csv', 'Uploaded file is present in assets');
    });

    casper.wait(3000);

    casper.then(function () {
        before = this.fetchText('.active > div:nth-child(1) > span:nth-child(1)');
        console.log("before Modifying asset name is:" + before);
    });

    casper.then(function () {
        this.sendKeys('div.ace_editor:nth-child(1) > div:nth-child(3) > div:nth-child(1)', "J_RANDWA");
        this.click(x(".//*[@id='rcloud-navbar-main']/li[4]"));
    });

    casper.then(function () {
        this.wait(5000, function () {
            this.click(x(".//*[@id='upload-submit']"));
            console.log("Clicking on Submit icon");
        });
    });

    casper.wait(3000);

    casper.then(function () {
        this.test.assertSelectorHasText('#asset-list', 'PHONE.csv', "Modified Asset is replcaed");
    });

    casper.run(function () {
        test.done();
    });
});