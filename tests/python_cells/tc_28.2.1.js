/*
 Author: Prateek 
 Description: This automation scripts for, Create an Asset with .py extension and write some python codes in it. 
 On pressing ctrl+enter, the codes written in Asset will get executed in a new cell to achieve the expected output
 */

//Begin Test
casper.test.begin(" Create an Asset and run a python code", 6, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var URL;
    var asset_name = "Python.py";
    var input_code = 'rcloud.execute.asset("Python.py")';

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
        this.wait(9000);
    });

    casper.then(function () {
        console.log('Clicking on new asset to create an new asset');
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Choose a filename for your asset") {
                return asset_name;
            }
        });
        this.click("#new-asset>a");
        this.echo("Creating a new asset");
    });

    casper.wait(4000).then(function () {
        this.sendKeys(x(".//*[@id='scratchpad-editor']/div[1]/div/div[2]/div"), "a= 100; print a");
        console.log("Adding contents to the newly created asset");
    });

    functions.addnewcell(casper);

    functions.addcontentstocell(casper, input_code);

    casper.then(function () {
        this.reload();
        this.wait(5000);
    });

    functoins.runall(casper);

    casper.wait(4000).then(function () {
        this.test.assertExists(x(".//*[@id='part1.py']/div[3]/div[2]"), "Output is visible, hence we can conclude that asset contents are executed");
    });

    casper.run(function () {
        test.done();
    });
});
