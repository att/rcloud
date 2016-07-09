/*
 Author: Prateek
 Description: This is a casperjs automated test script for showing that,User creates two assets with the same name should not be allowed
 */
//Begin Tests

casper.test.begin("Duplicate names of assets shouldnot be created", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
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

    casper.then(function () {
        this.evaluate(function (fileName) {
            __utils__.findOne('input[type="file"]').setAttribute('value', fileName)
        }, {fileName: fileName});
        this.page.uploadFile('input[type="file"]', fileName);
        console.log('Selecting a file');
    });

    casper.wait(3000).then(function () {
        this.wait(5000, function () {
            this.click(x(".//*[@id='upload-to-notebook']"));
            console.log("Clicking on Upload to notebook check box");
            this.click(x(".//*[@id='upload-submit']"));
            console.log("Clicking on Submit icon");
        });
    });

    casper.wait(5000).then(function () {
        this.waitUntilVisible(x('//*[contains(text(), "added")]'), function then() {
            console.log("File has been uploaded");
        });
        this.test.assertSelectorHasText(x(".//*[@id='asset-list']/li[3]/a/span[1]"), 'PHONE.csv', 'Uploaded file is present in assets');
    });

    casper.wait(3000).then(function () {
        this.click(x(".//*[@id='upload-submit']"));
        console.log("Clicking on Submit icon");
        this.wait(2000);
        this.waitUntilVisible(x('//*[contains(text(), "replaced")]'), function then() {
            console.log("Asset with duplicate name is not created, instead entire asset got replaced");
        });
    });

    casper.run(function () {
        test.done();
    });
});

