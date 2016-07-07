/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that on clicking the Shareable Link present on top left 
 corner of the Main page,the view.html page for the currently loaded notebook should open
 */

//Begin Tests

casper.test.begin("The Page opened using Shareable Link should contain only the outputs of the particular notebook", 8, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var title; //store the notebook title
    var notebookid;//store the notebook ID
    var input_code = "a<-50+50\n a";
    var expectedresult = "100\n";

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

    //Creating a New notebook
    functions.create_notebook(casper);

    // Getting the title of new Notebook
    casper.viewport(1024, 768).then(function () {
        title = functions.notebookname(casper);
        this.echo("the new Notebook title : " + title);
        this.wait(3000);
    });

    //getting Notebook ID

    casper.viewport(1024, 768).then(function () {
        var temp1 = this.getCurrentUrl();
        notebookid = temp1.substring(41);
        this.echo("The Notebook Id: " + notebookid);
    });

    //Added a new cell
    functions.addnewcell(casper);

    //Add contents to this cell and then execute it using run option
    functions.addcontentstocell(casper, input_code);

    //fetch the output text and compare
    casper.wait(5000).then(function () {
        this.test.assertSelectorHasText(x(".//*[@id='part1.R']/div[3]/div[2]/pre/code"), expectedresult);
        //this.test.assertEquals(res, expectedresult, "The R code has produced the expected output");
    });


    casper.viewport(1366, 768).then(function () {
        this.thenOpen('http://127.0.0.1:8080/view.html?notebook=' + notebookid);
        this.wait(8000)
        this.waitForSelector(".r-result-div > pre:nth-child(1) > code:nth-child(1)", function () {
            this.test.assertExists('#edit-notebook > i:nth-child(1)', 'the element Edit icon exists. Hence page has got loaded properly');
        });
    });

    // casper.wait(25000);
    //Checking whether just the output is present or even the source code
    casper.wait(5000).then(function () {
        this.test.assertDoesntExist(x(".//*[@id='part1.R']/div[3]/div[1]/div[1]/pre/code"), 'Input code/source code is not visible');
    });

    casper.run(function () {
        test.done();
    });
});
