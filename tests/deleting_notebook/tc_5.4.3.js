/* 
 Author: Prateek
 Description:The 'Notebooks' div contains two or more notebooks. On deleting the notebook which is starred and currently loaded in the main page,
 it gets deleted from all the lists, 'Notebooks I Starred','People I Starred' and 'All Notebooks' and the previously loaded notebook gets loaded
 */

//Begin Tests

casper.test.begin("Delete notebook which is loaded and starred", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var title;
    var initial_title;

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

    //Get title of currently loaded notebook
    casper.viewport(1366, 768).then(function () {
        initial_title = functions.notebookname(casper);
        this.echo("Title of initially loaded Notebook : " + initial_title);
        this.wait(3000);
    });
    
    //Create a new Notebook.
    functions.create_notebook(casper);

    // Getting the title of new Notebook

    casper.then(function () {
        title = functions.notebookname(casper);
        this.echo("New Notebook title : " + title);
        this.wait(3000);

    });

    functions.checkstarred(casper);

    //deleting the newly created notebook
    functions.delete_notebooksIstarred(casper);
    
    casper.wait(10000);

    //checking if the previously loaded notebook has got loaded
    casper.viewport(1024, 768).then(function () {
        this.wait(4000);
        var current_title = functions.notebookname(casper);
        this.echo("Title of currently loaded Notebook : " + current_title);
        this.wait(3000);
        this.test.assertEquals(current_title, initial_title, "Previously loaded notebook has got loaded");
        this.echo("Notebook owner = " + this.fetchText({type: 'css', path: '#notebook-author'}));
    });

    casper.run(function () {
        test.done();
    });
});
