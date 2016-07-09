/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that if a notebook is added in the list of 'All Notebooks' and its
 respective star is not selected and count=0, then that notebook is not added to the 'Notebooks I Starred' list. It will be present
 in "People I Starred"


 */

//Begin Tests

casper.test.begin("If a notebook is added in the list of 'All Notebooks' and its respective star is not selected and count=0, then that notebook is not added to the 'Notebooks I Starred' list. It will be present in 'People I Starred' ", 6, function suite(test) {

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

    //checking if notebook is starred and hence unstarring it
    functions.checkstarred(casper);
    casper.then(function () {
        var z = casper.evaluate(function () {
            $('#star-notebook .icon-star').click();
        });
        this.wait(3000);
        this.echo('Notebook is unstarred');
    });

    //checking if Notebook is present in the All Notebooks list
    functions.allnotebooks(casper);

    casper.viewport(1024, 768).then(function () {
        this.echo("Notebook found under All Notebooks and is unstarred. Hence checking if it is present under People I Starred and absent under Notebooks I Starred");
        functions.notebooksIstarred(casper);
        functions.peopleIstarred(casper);
    });

    casper.run(function () {
        test.done();
    });
});
