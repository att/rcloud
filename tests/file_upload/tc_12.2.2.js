/*
 Author: Prateek
 Description: This is a casperjs automated test script for showing that,Overwrite an already existing file i.e, 
 some file with the same name is already uploaded with respect to that particular Notebook
 */

//Begin Tests
casper.test.begin("Overwrite a File to Notebook", 5, function suite(test) {

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

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
    });

    functions.create_notebook(casper);

    //Verifying whether file upload div is open or not
    casper.wait(2000).then(function () {
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

    //File upload
    casper.wait(2000).then(function () {
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

    casper.wait(10000).then(function () {
        this.waitUntilVisible(x('//*[contains(text(), "added")]'), function then() {
            console.log("File has been uploaded");
        });
        this.test.assertSelectorHasText(x(".//*[@id='asset-list']/li[3]/div/span[1]"), 'PHONE.csv', 'Uploaded file is present in assets');
    });

    //Uploading file again
    casper.wait(2000).then(function () {
        this.wait(5000, function () {
            this.click(x(".//*[@id='upload-submit']"));
            console.log("Clicking on Submit icon again");
        });
    });

    casper.wait(5000).then(function () {
        this.test.assertSelectorHasText(x(".//*[@id='file-upload-results']/div[2]"), 'replaced', "File has been replaced")
    });

    casper.run(function () {
        test.done();
    });
});

