/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that selecting the Fork option to add the notebook
 to the local user's notebooks. The notebook title should now be in editable form.
 */

//Begin Tests

casper.test.begin("Fork Notebook and check if title is editable", 14, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_id = "82198d654e36c7e86761";//contains the notebook id to be searched

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

    //opening alien user's notebook
    casper.viewport(1366, 768).thenOpen('http://127.0.0.1:8080/view.html?notebook=' + notebook_id, function () {
        this.wait(11000);
        this.echo(this.getCurrentUrl());
        functions.viewhtml(casper);
    });

    //clicking on the Edit icon and verifying if the main.html page opens
    casper.viewport(1024, 768).then(function () {
        var z = casper.evaluate(function () {
            $('#edit-notebook').click();
        });
        this.wait(8000);
    });

    casper.viewport(1024, 768).then(function () {
        this.test.assertUrlMatch(/edit.html*/, 'main.html for the notebook has been loaded');
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(5000);
    });

    //checking if notebook title is editable
    casper.viewport(1366, 768).then(function () {
        var current_name = functions.notebookname(casper);
        var z = casper.evaluate(function triggerKeyDownEvent() {
            jQuery("#notebook-title").text("S3456bg");
            var e = jQuery.Event("keydown");
            e.which = 13;
            e.keyCode = 13;
            jQuery("#notebook-title").trigger(e);
            return true;
        });
        this.wait(5000);
        var new_name = functions.notebookname(casper);
        this.test.assertEquals(new_name, current_name, "Notebook title is uneditable");

    });

    //checking if notebook title is editable after forking
    casper.viewport(1366, 768).then(function () {
        var current_name = functions.notebookname(casper);
        functions.fork(casper);
        casper.then(function () {
            var z = casper.evaluate(function triggerKeyDownEvent() {
                jQuery("#notebook-title").text("S3456bg");
                var e = jQuery.Event("keydown");
                e.which = 13;
                e.keyCode = 13;
                jQuery("#notebook-title").trigger(e);
                return true;
            });
            this.wait(7000);
            var new_name = functions.notebookname(casper);
            this.test.assertEquals(new_name, current_name, "Notebook title is editable");
        });
    });

    casper.run(function () {
        test.done();
    });
});

