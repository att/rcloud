/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that the notebook ID should be displayed in the edit/view.html link for
 any notebook
 */

//Begin Tests

casper.test.begin("Notebook ID should  be displayed in the edit/view.html of the notebook", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var title;
    var functions = require(fs.absolute('basicfunctions'));

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });
    casper.wait(10000);

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting\n\
     if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);

    });

    //Get notebook title
    casper.then(function () {
        title = functions.notebookname(casper);
        this.echo("The Notebook title : " + title);
        this.wait(3000);
    });

    //getting Notebook ID
    var notebookid;
    casper.viewport(1024, 768).then(function () {
        this.wait(5000);
        this.test.assertUrlMatch(/edit.html*/, 'Confirmed that edit.html page is opened for the notebook');
        var temp1 = this.getCurrentUrl();
        notebookid = temp1.substring(41);
        this.echo("The Notebook Id: " + notebookid);
        this.echo("Hence shown that Notebook Id is present in edit.html for a notebook");
    });

    casper.run(function () {
        test.done();
    });
});
