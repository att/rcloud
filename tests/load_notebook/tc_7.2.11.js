/*
 Author: Prateek
 Description: When some existing notebook belonging to the same user is loaded, the star count remains the same, i.e, 
 * if the notebook was in 'My Notebooks' list, it remains starred with count=1 or else, it remains unstarred with count=0
 */

//Begin Test
casper.test.begin(" Star count when existing Notebook  of same user is loaded", 6, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var new_username = 'tejas1493';
    var new_user_password = 'musigma12';
    var notebook_id;
    var owner, owner1;
    var star, star1;

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
        owner = this.fetchText('#notebook-author');
        console.log("Owner of the notebook = " + owner);
        initial_title = functions.notebookname(casper);
        this.echo("New Notebook title : " + initial_title);
    });

    //getting Notebook ID
    casper.viewport(1024, 768).then(function () {
        var temp1 = this.getCurrentUrl();
        notebook_id = temp1.substring(41);
        this.echo("The Notebook Id: " + notebook_id);
    });

    casper.then(function () {
        star = this.fetchText({
            type: 'css',
            path: '.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(2) > span:nth-child(1) > sub:nth-child(2)'
        });
        this.echo('Star count of newly created notebook is :' + star);
    });

   //logout of RCloud & Github
    casper.then(function(){
        this.click("#rcloud-navbar-menu > li:nth-child(7) > a:nth-child(1)");
        console.log('Logging out of RCloud');
        this.echo(this.getTitle());
    });

    casper.wait(5000);

    casper.viewport(1366, 768).then(function () {
        this.click(x('/html/body/div[2]/p[2]/a[2]'));
        console.log('Logging out of Github');
        this.wait(12000);
    });

    casper.viewport(1366, 768).then(function () {
        this.waitForSelector('.btn', function () {
            this.click(".btn");
            console.log('logged out of Github');
        });
        this.wait(7000);
        this.echo("The url after logging out of Github : " + this.getCurrentUrl());
        this.waitForSelector("a.btn:nth-child(1)", function (){
            this.wait(3000);
            this.test.assertTextExists('GitHub', "Confirmed that successfully logged out of Github");
            this.echo(this.getTitle());
        });  
    });

    casper.wait(3000);

    //Login to RCloud with new user
    casper.then(function () {
        this.thenOpen('http://127.0.0.1:8080/login.R');
        this.wait(13000);
        functions.login(casper, new_username, new_user_password, rcloud_url);
    });

    casper.then(function () {
        var url = this.getCurrentUrl();
        this.thenOpen(url);
        this.wait(5000);
    });

    casper.then(function () {
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

    casper.then(function () {
		var star = this.fetchText({
            type: 'css',
            path: '.jqtree-selected > div:nth-child(1) > span:nth-child(1)'
        });
        this.echo('Star count of Loaded Notebook is :' + star);
    });

    casper.then(function () {
		owner1 = this.fetchText('#notebook-author');
        console.log("Owner of the notebook = " + owner1);
        this.wait(5000);
		var after_loading = this.fetchText('#notebook-title');
		console.log('After loading notebook, the notebook title is:' + after_loading);
	});
	
	casper.then(function () {
        star1 = this.fetchText({
            type: 'css',
            path: '.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(2) > span:nth-child(1) > sub:nth-child(2)'
        });
        this.echo('Star count of Loaded notebook is :' + star1);
        this.test.assertEquals(star, star1, "After loading the notebook, the star count remains the same");
    });

    casper.run(function () {
        test.done();
    });
});
	
	
	
