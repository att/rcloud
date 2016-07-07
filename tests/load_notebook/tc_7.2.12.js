/*
 Author: Prateek 
 Description:When some deleted notebook belonging to the same user is loaded, it gets added in the 'All Notebooks' list as unstarred and count=0
 */

//Begin Test
casper.test.begin("Star count when some deleted notebook of the same user is loaded", 4, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var URL;
    var Notebook_id;
    var title;
    var initial_title;
    var notebook_id;
    var star1;

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

    casper.then(function () {
        URL = this.getCurrentUrl();
        notebook_id = URL.substring(41);
        this.echo('Current loaded Notebook which we are going to delete it, Notebook ID is :' + Notebook_id);
    });

    functions.checkstarred(casper);

    //deleting the newly created notebook
    functions.delete_notebooksIstarred(casper);

    casper.wait(10000);

    //checking if the previously loaded notebook has got loaded
    casper.viewport(1024, 768).then(function () {
        this.wait(4000);
        var url = this.getCurrentUrl();
        this.thenOpen(url);
        this.wait(8000);
        var current_title = functions.notebookname(casper);
        this.echo("Title of currently loaded Notebook : " + current_title);
        this.wait(3000);
        this.test.assertEquals(current_title, initial_title, "Previously loaded notebook has got loaded");
        this.echo("Notebook owner = " + this.fetchText({type: 'css', path: '#notebook-author'}));
    });

    //Loading a notebook by notebook ID
    functions.open_advanceddiv(casper)

    casper.then(function () {
        functions.open_advanceddiv(casper)
        this.echo("Clicking on dropdown");
        this.wait(2999);
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Enter notebook ID or github URL:") {
                return notebook_id;
            }
        });
        this.click("#open_from_github");
        this.echo("Opening Notebook");
        this.wait(10000);
    });

    casper.then(function () {
        var URL1 = this.getCurrentUrl();
        var url = this.getCurrentUrl();
        this.thenOpen(url);
        this.wait(8000);
        var current_title = functions.notebookname(casper);
        this.echo("Title of currently loaded Notebook : " + current_title);
        this.echo("Notebook owner = " + this.fetchText({type: 'css', path: '#notebook-author'}));
        var Notebook_id1 = URL1.substring(41);
        console.log('deleted notebook is loaded');
    });

    //Checking for the star count
    casper.then(function () {
        star1 = this.fetchText({
            type: 'css',
            path: '.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(2) > span:nth-child(1) > sub:nth-child(2)'
        });
        console.log('Star count of deleted notebook which is currently Loaded:' + star1);
    });

    casper.run(function () {
        test.done();
    });
}); 
