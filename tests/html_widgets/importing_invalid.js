/*
 Author: Prateek 
 Description: Check whether the user is able to import invalid Rmarkdown file from the local directory or not
 */

//Begin test
casper.test.begin("Importing invalid Rmarkdown file from the local directory", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var URL, NB_ID, fetchTitle;
    var fileName = 'SampleFiles/IRIS.csv'; // File path directory
    var system = require('system');
    var currentFile = require('system').args[4];
    var curFilePath = fs.absolute(currentFile);
    var curFilePath = curFilePath.replace(currentFile, '');
    fileName = curFilePath + fileName;

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

    //login to Github and RCloud
    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(4000);
    });

    casper.wait(4000);

    //create a new notebook
    functions.create_notebook(casper);

    casper.then(function () {
        URL = this.getCurrentUrl();
        NB_ID = URL.substring(41);
        console.log("New Notebook ID is :" + NB_ID);
    });

    //Importing Rmarkdown file from the system
    casper.then(function () {
        this.thenOpen(URL);
        this.wait(5000);
        casper.wait(3000).then(function () {
            //Opening advanced dropdown option
            casper.then(function () {
                functions.open_advanceddiv(casper);
                this.click("#rmdImport");
                console.log("Clicking on import Rmarkdown file option form the dropdown");
                this.wait(3000);
            });

            //Selecting desired file from the directory
            casper.then(function () {
                this.wait(5000);
                this.capture("./Images/import_Rmd_File.png");
                this.evaluate(function (fileName) {
                    __utils__.findOne('input[id="notebook-file-upload"]').setAttribute('value', fileName)
                }, {fileName: fileName});
                this.page.uploadFile('input[id="notebook-file-upload"]', fileName);
                console.log('Selecting a file');
            });

            // casper.wait(5000);
        });


        casper.then(function () {
            // this.capture("./Images/import_Rmd_File1.png");
            // this.click("#import-notebook-file-dialog > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > span:nth-child(2)");
            casper.click(x('//*[text()="Import"]'));
            console.log("Clicking on import button");
            this.wait(3000);
            casper.click("#import-notebook-file-dialog > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1)");
            this.wait(2000);
            console.log("Clicking on cancel button to close the modal window");
        });

        casper.wait(3000).then(function () {
            if (this.test.assertExists("#session-info-panel")) {
                this.test.assertSelectorHasText(".alert > div:nth-child(2)", "Error: importRmd: Error in fun(...) : failed to create new notebook", "Error: importRmd: Error in fun(...) :");
                console.log("Unable to import gist file using Import Rmarkdown file option ");
            }
            else {
                console.log("Error is not present in the Session div");
            }
        });

    });

    casper.run(function () {
        test.done();
    });
});