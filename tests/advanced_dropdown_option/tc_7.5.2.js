/*
 Author: Prateek
 Description: This is a casperjs automated test script for showing that,When a notebook is imported from a wrong file, 
 using the link "Import Notebooks from File" in the "Advanced" option present on the top-right corner of the page, the 
 Validation result will be negative with the message: "Couldn't parse JSON". Also, on clicking the "Import" button, 
 the file will not be imported as Notebook
 */
//Begin Tests

casper.test.begin("Import Notebook from wrong file(non-JSON file)", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var fileName = 'SampleFiles/PHONE.csv'; // File path directory
    var URL, counter, i, Notebook;
    var title= "iris";
    var error = "Invalid notebook format: couldn't parse JSON";
    var system = require('system')
    var currentFile = require('system').args[4];
    var curFilePath = fs.absolute(currentFile);
    var curFilePath = curFilePath.replace(currentFile, '');
    fileName = curFilePath + fileName;

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

    casper.wait(10000);

    casper.then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.wait(4000).then(function () {
        this.wait(3000);
        console.log("validating that the Main page has got loaded properly by detecting\n\
     if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
    });

    casper.wait(1000).then(function (){
        URL = (this.getCurrentUrl());
    })

    casper.then(function (){
        this.thenOpen(URL);
        this.wait(5000);
    });

    casper.wait(3000).then(function () {

        this.then(function () {
            functions.open_advanceddiv(casper);
            this.click(x(".//*[@id='import_notebook_gist']"));
            this.wait(3000);
        });

        this.then(function () {
            this.evaluate(function (fileName) {
                __utils__.findOne('input[id="notebook-file-upload"]').setAttribute('value', fileName)
            }, {fileName: fileName});
            this.page.uploadFile('input[id="notebook-file-upload"]', fileName);
            console.log('Selecting a file');
        });

        this.wait(5000);
    });

    casper.wait(2000).then(function () {
        var temp = this.fetchText(x(".//*[@id='import-notebook-file-dialog']/div/div/div[2]/p[2]/span"));
        this.echo("Following message is displayed when we choose a wrong file other than '.gist' format: " + temp);
        this.test.assertEquals(temp, error,"Unable to import other than .gist files)")
        this.wait(3000);
    });

    casper.run(function () {
        test.done();
    });
});