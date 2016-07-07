/* 
 Author: Prateek
 Description:This is a casperjs automated test script for
 * Verify whether the Other users (alien users) notebook loads or not
*/
//Begin Tests
casper.test.begin("Verify whether the Other users (alien users) notebook loads or not", 7, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_name, notebook_name1, user, user2, notebook_id;
    var new_username = 'tejas1493';
    var new_user_password = 'musigma12';

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
    
    functions.create_notebook(casper);
    
    casper.wait(2000).then(function () {
		user = this.fetchText("#notebook-author");
		console.log('Notebook author: ' + user);
		notebook_name = this.fetchText('#notebook-title');
		this.echo('Newly created Notebook name is: ' + notebook_name);
	});
	
	//getting Notebook ID
    casper.viewport(1024, 768).then(function () {
        var temp1 = this.getCurrentUrl();
        notebook_id = temp1.substring(41);
        this.echo("The Notebook Id: " + notebook_id);
    });
	
	//Log out of RCloud and GitHub
	//functions.logout(casper);
	
	casper.then(function () {
		this.click({type: 'xpath', path: ".//*[@id='rcloud-navbar-menu']/li[7]/a"});
            console.log('Logging out of RCloud');
            this.wait(3000);
    });

    casper.wait(2000).then(function () {
        this.click({type: 'xpath', path: ".//*[@id='main-div']/p[2]/a[2]"}, "Logged out of Github");
        console.log('Logging out of Github');
        this.wait(10000);
    });

    casper.wait(2000).then(function () {
        this.click(".btn");
        console.log('logged out of Github');
        this.wait(4000).then(function(){
        	this.echo("The url after logging out of Github : " + this.getCurrentUrl());
        	this.test.assertTextExists('GitHub', "Confirmed that successfully logged out of Github");
        });
        
    });

	
	//Login to RCloud with new user
    casper.wait(1000).then(function () {
        this.thenOpen('http://127.0.0.1:8080/login.R');
        this.wait(13000);
        functions.login(casper, new_username, new_user_password, rcloud_url);
    });
    
    casper.then(function () {
        var url = this.getCurrentUrl();
        this.thenOpen(url);
        this.wait(5000);
    });

    casper.wait(2000).then(function () {
        functions.open_advanceddiv(casper);
        this.echo("Clicking on dropdown");
        this.wait(5000);
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Enter notebook ID or github URL:") {
                return notebook_id;
            }
        });
        this.click("#open_from_github");
        this.echo("Opening Notebook using Load Notebook ID");
        this.wait(10000);
    });
    
    casper.wait(2000).then(function () {
		var temp = this.fetchText("#notebook-author");
		console.log('Notebook author: ' + temp);
		var temp1 = this.fetchText('#notebook-title');
		this.echo('Newly created Notebook name is: ' + temp1);
	});
    
    functions.create_notebook(casper);
	
	
	casper.wait(3000).then(function () {
		this.click('.dropdown-toggle.recent-btn');
		console.log('Clicking on Recent option');
		this.wait(4000);
		this.click('.recent-notebooks-list > li:nth-child(1) > a:nth-child(1)');
		console.log('Clicking on Notebook');
	});
	
	casper.then(function () {
		user1 = this.fetchText("#notebook-author");
		console.log('Notebook author: ' + user1);
		notebook_name1 = this.fetchText('#notebook-title');
		this.echo('Loaded Notebook name is: ' + notebook_name1);
	});
	
	casper.then( function () {
		this.test.assertExists('#readonly-notebook', "Notebook is opened in Read only mode");
		this.test.assertEquals(notebook_name,notebook_name1,'Confirmed that Notebook is opened from the Recent option');
	});		
	
	casper.run(function () {
        test.done();
    });
});
	
	
