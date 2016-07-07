/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that if the loaded notebook is added in the 'Notebooks I Starred' list, then
 on unchecking the star present on the top-left corner of the page removes it from only from 'Notebooks I Starred' list


 */

//Begin Tests

casper.test.begin("If the loaded notebook is added in the 'Notebooks I Starred' list, then on unchecking the star present on the top-left corner of the page removes it from only from 'Notebooks I Starred' list ", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var title;

    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
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

    //Create a new Notebook.
    functions.create_notebook(casper);

    // Getting the title of new Notebook
    casper.then(function () {
        title = functions.notebookname(casper);
        this.echo("Notebook title : " + title);
        this.wait(2000);

    });

    functions.checkstarred(casper);
    functions.notebooksIstarred(casper);
    casper.then(function () {
        var z = casper.evaluate(function () {
            $('#star-notebook .icon-star').click();

        });
        this.wait(3000);
        this.echo('Notebook is unstarred now');
    });
    functions.notebooksIstarred(casper);
    casper.then(function () {
        this.echo('confirmed that notebook is removed from Notebooks I Starred list after it is unstarred');
    });

    casper.run(function () {
        test.done();
    });
});
	
