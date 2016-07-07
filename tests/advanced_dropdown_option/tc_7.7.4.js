/* 
 Author: Arko
 Description:    When a published notebook is loaded by a user who is not logged-in, there is an option "Edit Notebook" present on the top-left corner of 
 the page. On clicking, edit.html page should get loaded but it won't get loaded properly . Notebook title will be shown as "loading.." and cells won't 
 be visible
 */

//Begin Tests
casper.test.begin("Edit loaded notebook (published)", 5, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid, title;

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

    casper.wait(10000);

    //Create a new Notebook.
    functions.create_notebook(casper);

    //Get notebook title
    casper.wait(1000).then(function () {
        title = functions.notebookname(casper);
        this.echo("New Notebook title : " + title);
        this.wait(3000);
    });

    //Get Notebook ID
    casper.wait(500).then(function () {
        var temp1 = this.getCurrentUrl();
        notebookid = temp1.substring(41);
        this.echo("The Notebook Id: " + notebookid);
    });

    //Now clicking on the advanced div
    functions.open_advanceddiv(casper);

    //clicking the checkbox to publish notebook
    casper.wait(1000).then(function () {
		this.wait(2000);
        var z = casper.evaluate(function () {
            $('.icon-check-empty').click();
            this.wait(3000);
		});
		this.echo("Clicking on publish notebook");
    //logout of RCloud & Github
        this.click("#rcloud-navbar-menu > li:nth-child(7) > a:nth-child(1)");
        console.log('Logging out of RCloud');   
        this.wait(3000);
    });
        
    casper.wait(1500).then(function () {
        this.click("#main-div > p:nth-child(2) > a:nth-child(2)", "Logged out of Github");
        console.log('Logging out of Github');
        this.wait(3000);
    });

    casper.wait(2000).then(function () {
        this.click(".btn");
        console.log('logged out of Github');
        this.wait(7000);
        this.echo("The url after logging out of Github : " + this.getCurrentUrl());
    });

    //load the view.html of the Published notebook
    casper.wait(1000).then(function () {
        sharedlink = "http://127.0.0.1:8080/view.html?notebook=" + notebookid;
        this.thenOpen(sharedlink, function () {
        this.wait(7000);
        this.echo("Opened the view.html of the published notebook " + title);
        });
    });

    //verify that the published notebook has been loaded
    casper.wait(2000).then(function () {
        publishedtitle=this.fetchText('#notebook-title');
        this.echo("Published Notebook title : " + publishedtitle);
        this.test.assertEquals(publishedtitle, title, "Confirmed that the view.html of published notebook has been loaded");
    });

    //click on Edit icon and confirm that login message is displayed
    casper.then(function () {
        var z = casper.evaluate(function () {
            $('#edit-notebook').click();
        });
        this.echo("Edit option has been clicked");
    });

	casper.wait(3000);

    casper.then( function () {
        if (this.exists('.modal-body > div:nth-child(1) > h1:nth-child(1)'))
        {
            var z = casper.evaluate(function () {
                $('button.btn:nth-child(3)').click();
            });
        }
        else{
            this.echo('Reconnect message didnt appeared')
        }
    });

    casper.wait(3000);

    casper.viewport(1366, 768).then(function () {
		this.waitForSelector(".auth-form-body");
        this.test.assertExists(".auth-form-body",'Login Page dispalyed');
    });

    
    casper.run(function () {
        test.done();
    });
});
