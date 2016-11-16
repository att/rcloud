// Author: Prateek
// Description: This is a casperjs automated test script for showing that,User should be able to upload an asset to a 
// notebook even if it does not have any assets from before
//Begin Tests
casper.test.begin("Add an asset to a notebook with no assets", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var URL;
    var asset_name = 'JustCreatedAsset.R';
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

    casper.then(function () {
        URL = this.getCurrentUrl();
        this.thenOpen(URL);
        this.wait(5000);
    });

    casper.wait(5000).then(function () {
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Do you want to remove the asset") {
                return True;
            }
        });
        this.click(x(".//*[@id='asset-list']/li[2]/div/span[2]/i"));
        console.log('Deleting existing "scratch.R" asset');
    });

    casper.then(function (){
        this.test.assertSelectorDoesntHaveText(x(".//*[@id='asset-list']"), 'scratch.R', "Successfully deleted the scratch.R asset");
    });

    casper.wait(5000);

    casper.then(function () {
        var URL1 = this.getCurrentUrl();
        this.thenOpen(URL1);
        this.wait(5000);
        console.log("Now the New notebook doesn't contains any assets and creating a new asset Now");
    });

    casper.then(function () {
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Choose a filename for your asset") {
                return asset_name;
            }
        });
        this.click("#new-asset");
        this.echo("Creating a new asset");
    });

    casper.wait(5000);

    casper.wait(15000).then(function () {
        this.test.assertSelectorHasText("#asset-list", asset_name, "Asset is added even though there were no assets present");
    });

    casper.run(function () {
        test.done();
    });
});