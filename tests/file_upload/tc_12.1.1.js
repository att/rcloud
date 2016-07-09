/*
 Author: Prateek
 Description: This is a casperjs automated test script for showing that,Upload a new file in Rcloud which gets saved in the home directory of the user
 */

//Begin Tests
casper.test.begin("Upload a new File", 3, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var fileName = 'SampleFiles/PHONE.csv'; // File path directory
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

    casper.viewport(1024, 768).wait(20000, function () {
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
        }
    });

    casper.wait(5000).then(function () {
        this.evaluate(function (fileName) {
            __utils__.findOne('input[type="file"]').setAttribute('value', fileName)
        }, {fileName: fileName});
        this.page.uploadFile('input[type="file"]', fileName);
        console.log('Selecting a file' + fileName + ' from the local directory');
    });

    casper.then(function () {
        this.wait(5000, function () {
            this.click(x(".//*[@id='upload-submit']"));
            console.log("Clicking on Submit icon");
        });
    });

    casper.then(function () {
        this.wait(5000);
        this.waitUntilVisible(x('//*[contains(text(), "uploaded")]'), function then() {
            console.log("File has been uploaded");
        });
    });

    casper.run(function () {
        test.done();
    });
});

