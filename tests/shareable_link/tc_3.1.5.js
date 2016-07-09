/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that the name of the notebook in the main.html page opened after clicking "Edit Notebook"
 option in view.html option should be editable

 */

//Begin Tests

casper.test.begin(" Notebook Name is editable in main.html after selecting Edit option in view.html", 9, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var viewhtmlurl = "http://127.0.0.1:8080/view.html?notebook=d9698057aa287c7b145b"//view.html link for a notebook containing some codes
    var notebookid;//to get the notebook id
    var initial_title;//store initial title of notebook
    var input = '"Welcome to AT&T"'

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

    //getting Notebook ID
    casper.viewport(1024, 768).then(function () {
        functions.create_notebook(casper);
        var temp1 = this.getCurrentUrl();
        notebookid = temp1.substring(41);
        this.echo("The Notebook Id: " + notebookid);
    });

    functions.addnewcell(casper);
    functions.addcontentstocell(casper, input);

    //open the view.html link for a notebook
    casper.viewport(1366, 768).then(function () {
        this.thenOpen('http://127.0.0.1:8080/view.html?notebook=' + notebookid);
        this.wait(8000)
        this.waitForSelector(".r-result-div > pre:nth-child(1) > code:nth-child(1)", function () {
            this.test.assertExists('#edit-notebook > i:nth-child(1)', 'the element Edit icon exists. Hence page has got loaded properly');
        });
    });

    //clicking on the Edit icon and verifying if the main.html page opens
    casper.viewport(1024, 768).then(function () {
        var z = casper.evaluate(function () {
            $('#edit-notebook').click();
        });
        this.wait(8000);
    });

    casper.viewport(1024, 768).then(function () {
        functions.validation(casper);
    });

    //getting the notebook title and modifying it
    casper.viewport(1024, 768).then(function () {
        initial_title = functions.notebookname(casper);
        this.echo("Present title of notebook: " + initial_title);
        var z = casper.evaluate(function triggerKeyDownEvent() {
            jQuery("#notebook-title").text("S345bgxy");
            var e = jQuery.Event("keydown");
            e.which = 13;
            e.keyCode = 13;
            jQuery("#notebook-title").trigger(e);
            return true;
        });
        //this.reload();
        this.wait(6000);
    });

    casper.viewport(1366, 768).then(function () {
        var newtitle = functions.notebookname(casper);
        this.echo("Modified notebook title: " + newtitle);
        this.test.assertNotEquals(newtitle, initial_title, "the title has been successfully modified");
    });

    //changing the title again so that the test case runs successfully next time
    casper.then(function () {
        var z = casper.evaluate(function triggerKeyDownEvent() {
            jQuery("#notebook-title").text("S345bg");
            var e = jQuery.Event("keydown");
            e.which = 13;
            e.keyCode = 13;
            jQuery("#notebook-title").trigger(e);
            return true;
        });
        this.wait(4000);
    });

    casper.run(function () {
        test.done();
    });
});

