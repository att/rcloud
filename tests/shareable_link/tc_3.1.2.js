/* 
 Author: Ganesh Moorthy
 Description:    This is a casperjs automated test script for showing that on clicking the "Edit Notebook" option, the respected notebook should
 open in the main.html page displaying only the source codes for the notebook
 */

//Begin Tests
casper.test.begin(" Make Notebook Editable in the view.html", 9, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

    casper.wait(10000);

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

    functions.create_notebook(casper);

    functions.addnewcell(casper);

    functions.addcontentstocell(casper, '"Welcome to RCloud"');

    //getting Notebook ID
    casper.viewport(1024, 768).then(function () {
        this.click("#new-notebook > span:nth-child(1) > i:nth-child(1)");
        this.wait(5000);
        var temp1 = this.getCurrentUrl();
        notebookid = temp1.substring(41);
        this.echo("The Notebook Id: " + notebookid);
    });

    //open the view.html link for a notebook
    casper.viewport(1366, 768).then(function () {
        this.then(function () {
            this.thenOpen('http://127.0.0.1:8080/view.html?notebook=' + notebookid);
            this.wait(8000)
            this.waitForSelector(x(".//*[@id='part1.R']/div[2]/div[2]/pre/code"), function () {
                this.test.assertExists('#edit-notebook > i:nth-child(1)', 'the element Edit icon exists. Hence page has got loaded properly');
            });

        });
    });

    //clicking on the Edit icon and verifying if the main.html page opens
    casper.viewport(1024, 768).then(function () {
        var z = casper.evaluate(function () {
            $('#edit-notebook').click();
        });
    });

    casper.wait(8000).viewport(1024, 768).then(function () {
        functions.validation(casper);
    });

    //validating that only source code is visible and not the output
    casper.viewport(1024, 768).then(function () {
        this.test.assertDoesntExist('r-result-div', 'output code is not present');
    });

    casper.run(function () {
        test.done();
    });
});

