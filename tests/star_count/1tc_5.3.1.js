/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that if a notebook is added in the list of 'Notebooks I Starred',
 the respective star is selected and its count=1 in  'Notebooks I Starred' ,'People I Starred' and 'All Notebooks' lists
 */

//Begin Tests

casper.test.begin("If a notebook is added in the list of 'Notebooks I Starred',the respective star is selected and its count=1 in  'Notebooks I Starred' ,'People I Starred' and 'All Notebooks' lists", 6, function suite(test) {

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

    //checking if notebook is starred
    functions.checkstarred(casper);

    //checking if Notebook is present in the Notebooks I Starred list
    casper.viewport(1024, 768).then(function () {
        functions.notebooksIstarred(casper);
    });

    casper.viewport(1024, 768).then(function () {
        this.echo("Notebook found under Notebooks I starred list and is starred. Hence checking if it is present under All Notebooks and People I Starred");
        functions.peopleIstarred(casper);
        functions.allnotebooks(casper);
    });


    casper.run(function () {
        test.done();
    });
});
