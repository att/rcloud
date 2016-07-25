/*
 Author: Prateek
 Description: This is a casperjs automated test script for showing that,Overwrite an already existing file in Rcloud i.e, 
 some file with the same name is already present in the home directory of the user
 */

//Begin Tests
casper.test.begin("Upload a new File", 3, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var fileName = 'SampleFiles/sample.csv'; // File path directory
    var URL;
    var system = require('system')
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

    casper.then(function () {
        URL = (this.getCurrentUrl());
        console.log(URL);
    })

    casper.then(function () {
        this.thenOpen(URL);
        this.wait(5000);
    })
    casper.then(function () {
        casper.page.uploadFile("#file", fileName);
        console.log('Selecting a file');
    });

    casper.then(function () {
        this.wait(5000, function () {
            this.click(x(".//*[@id='upload-submit']"));
            console.log("Clicking on Submit icon");
        });
    });

    casper.then(function () {
        this.wait(5000);
        this.waitUntilVisible(x('//*[contains(text(), "Overwrite")]'), function then() {
            console.log("Overwrite button exists");
        });

        casper.waitForSelector(x(".//*[@id='file-upload-results']/div/div/p/a"), function () {
            casper.click(x(".//*[@id='file-upload-results']/div/div/p/a"));
            console.log("Clicking on Overwrite button");
        });

        this.waitUntilVisible(".alert.alert-info", function then() {
            console.log("File has been replaced");
        });
    });

    casper.run(function () {
        test.done();
    });
});

