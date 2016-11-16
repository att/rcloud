/*
 Author: Prateek
 Description:On clicking the 'x' option beside the asset name in the Asset div, the asset should get removed from the notebook. 
 */

//Begin Test
casper.test.begin("Deleting an Assets div", 5, function suite(test) {
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


    //Deleting a created asset
    casper.then(function () {
        this.click(x(".//*[@id='asset-list']/li[3]/div/span[2]/i"));
        console.log('clicking on delete icon');
        this.test.assertSelectorDoesntHaveText({
            type: 'xpath',
            path: ".//*[@id='asset-list']"
        }, 'PHONE.csv', "Newly created asset gets deleted");
    });

    casper.run(function () {
        test.done();
    });
});

