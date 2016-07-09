/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that the notebook opened using shareable link
 of some different user should be in uneditable form

 */

//Begin Tests

casper.test.begin("Contents and title of shared notebook should be uneditable before forking", 9, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_id = "68169c21a8c728c7f83f";

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

    //opening alien user's notebook
    casper.viewport(1366, 768).then(function () {
        this.thenOpen('http://127.0.0.1:8080/view.html?notebook=' + notebook_id);
        this.wait(8000)
        this.waitForSelector("#edit-notebook > i:nth-child(1)", function (){
            this.test.assertExists('#edit-notebook > i:nth-child(1)', 'the element Edit icon exists. Hence page has got loaded properly');
        });
        this.echo(this.getCurrentUrl());
    });
    
    casper.viewport(1366, 768).then(function () {
        this.test.assertUrlMatch(/view.html/, 'view.html page for given user loaded');
        this.test.assertExists({type: 'css', path: '#edit-notebook > i:nth-child(1)' }, 'the element Edit icon exists. Hence page has got loaded properly in uneditable form');
    });

    //click on edit icon
    casper.viewport(1366, 768).then(function () {
        var z = casper.evaluate(function () {
            $('#edit-notebook').click();
        });
        this.wait(8000);
    });

    var current_name;//store the initial name of the loaded notebook
    casper.viewport(1366, 768).then(function () {
        this.test.assertUrlMatch(/edit.html/, 'RCloud main page for given user loaded');
        current_name = functions.notebookname(casper);
        this.echo("Current notebook name : " + current_name);
    });

    var new_name;//store the notebook name after editing it
    //checking if notebook title is editable
    casper.then(function () {
        var z = casper.evaluate(function triggerKeyDownEvent() {
            jQuery("#notebook-title").text("S3456bg");
            var e = jQuery.Event("keydown");
            e.which = 13;
            e.keyCode = 13;
            jQuery("#notebook-title").trigger(e);
            return true;
        });
        this.wait(5000);
    });

    //reload the page
    casper.then(function () {
        this.reload(function () {
            this.wait(9000);
        });
    });

    casper.then(function () {
        var new_name = functions.notebookname(casper);
        this.echo("Notebook name after editing : " + new_name);
        this.test.assertEquals(new_name, current_name, "Notebook title is uneditable");

        //checking if command prompt is visible . This is a validation to check
        //if contents of notebook are in editable form
        this.test.assertNotVisible('#command-prompt', 'no option to create new cell.Hence notebook in uneditable form');

    });

    casper.run(function () {
        test.done();
    });
});

