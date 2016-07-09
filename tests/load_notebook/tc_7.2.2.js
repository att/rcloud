/*
 Author: Prateek 
 Description: The notebooks will be loaded based on their respective IDs. The notebook ID will refer to some deleted notebook belonging to the same user
 */

//Begin Test
casper.test.begin("Using the ID of some deleted notebook (same user)", 4, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var URL,Notebook_id, title, initial_title, notebook_id;

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

    functions.open_advanceddiv(casper)

    //Load Notebook by ID (Browser allert)
    casper.then(function () {
		functions.open_advanceddiv(casper)
		this.echo("Clicking on dropdown");
		this.wait(2999);
		casper.setFilter("page.prompt", function(msg, currentValue) {
			if (msg === "Enter notebook ID or github URL:") { // message between quoutes is the alerts message
				return  notebook_id;				
			}
		});
		this.click("#open_from_github");
		this.echo("Opening Notebook");		
        this.wait(10000);
    });
        
	functions.checkstarred(casper);

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

    casper.run(function () {
        test.done();
    });
}); 
		
