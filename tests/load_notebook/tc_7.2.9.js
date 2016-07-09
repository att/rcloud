/*
 Author: Prateek
 Description: The notebook loaded from some different user is in uneditable format with an icon 'Fork' present on the top-left corner of  the page
 */

//Begin Test
casper.test.begin("Notebook loaded is in uneditable form (different user)", 5, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var new_username = 'tejas1493';
    var new_user_password = 'musigma12';
    var notebook_id;
    var notebook_status = '(read-only)';
    
    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });
    casper.wait(10000);

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });
    
    casper.waitUntilVisible('#run-notebook', function () {
		this.echo('waiting for page to open completely');
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
        initial_title = functions.notebookname(casper);
        this.echo("New Notebook title : " + initial_title);
    });

    //getting Notebook ID
    casper.viewport(1024, 768).then(function () {
        var temp1 = this.getCurrentUrl();
        notebookid = temp1.substring(41);
        this.echo("The Notebook Id: " + notebookid);
    });
	
	// loging out of RCloud
    casper.viewport(1366, 768).then(function () {
        test.comment('⌚️  Logging out of RCloud and GitHub to check shareable links for anonymous usere ...');
        this.wait(13000);
        this.click("#rcloud-navbar-menu > li:nth-child(7) > a:nth-child(1)");
    });

    casper.then(function () {
        this.wait(7000);
        this.click('#main-div > p:nth-child(2) > a:nth-child(2)')
    });
    casper.then(function () {
        this.wait(7000);
        this.click('.btn');
        this.wait(4000);
    });

    //Login to RCloud with new user
    casper.then(function(){
		this.thenOpen('http://127.0.0.1:8080/login.R');
		this.wait(13000);
		functions.login(casper, new_username, new_user_password, rcloud_url);		
	});

	casper.then(function () {
		var url = this.getCurrentUrl();
        this.thenOpen(url);
        this.wait(3000);
	});
	
	casper.then( function () {
		functions.open_advanceddiv(casper);
		this.echo("Clicking on dropdown");
        this.wait(2999);
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Enter notebook ID or github URL:") {
                return notebook_id;
            }
        });
        this.click("#open_from_github");
        this.echo("Opening Notebook using Load Notebook ID");
        this.wait(10000);
    });
    
    casper.then( function () {
		var temp = this.fetchText({type: 'css', path: "#readonly-notebook"});
		this.test.assertEquals( temp, notebook_status,"The notebook which belongs to other user is loaded in Read Only Mode");
	});
	
	casper.run(function () {
        test.done();
    });
});
	
	
	
