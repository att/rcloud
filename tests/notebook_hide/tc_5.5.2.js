/*
 Author: Prateek
 Description:When a notebook is made private, it is not visible to a different user under 'All Notebooks'. 
 * To implement, First user should login through GitHub using a GitHub user and password.  
 * Second user should login using a different GitHub user and password. First user's private notebooks should not be visible to Second user in All Notebooks.
 */

//Begin Tests
casper.test.begin("Visibility of Private Notebooks", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var title;
	var initial_title;
    var before;// To fetch the icon details
    var after;// To fetch the icon details after clicking on public/private icon
    var new_username = 'djoky';
    var new_user_password = 'musigma12';

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

    //fetching notebbok deatils before clicking on private icon
    casper.then(function(){
        before = this.getElementInfo('.jqtree-selected > div:nth-child(1) > span:nth-child(1)').tag;
    });


    //Making the notebbok public/private
    casper.then(function(){
        if (this.test.assertVisible({type:'css', path:'.jqtree-selected > div:nth-child(1) > span:nth-child(1)'}))
        {
            console.log('selected notbook found');
            this.mouse.move('.jqtree-selected > div:nth-child(1) > span:nth-child(1)');
            this.waitUntilVisible('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(3) > i:nth-child(1)', function () {
                this.click('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(3) > i:nth-child(1)');
                this.echo('Making notebook as private by clicking on icon');
            });

        }else
        {
            console.log("Notebook not found");
        }
    });

    //fetching notebbok deatils after clicking on private icon
    casper.then(function(){
        after = this.getElementInfo('.jqtree-selected > div:nth-child(1) > span:nth-child(1)').tag;
    });

    casper.then(function(){
        if ( before != after)
        {
            console.log('Notebook icon has changed from public to private');
        }else
        {
            console.log('Notebook icon has not changed so, the notebook is still public only');
        }
    });

    //loging out of RCloud
    casper.viewport(1366, 768).then(function () {
        test.comment('⌚️  Logging out of RCloud and GitHub to check shareable links for anonymous usere ...');
        this.wait(13000)
        // console.log('Logging out of RCloud');
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

	casper.wait(3000);
	
    //Login to RCloud with new user
    casper.then(function(){
		this.thenOpen('http://127.0.0.1:8080/login.R');
		this.wait(3000);
		functions.login(casper, new_username, new_user_password, rcloud_url);		
	});

	casper.wait(5000);

    //Loading the notebook with another user logging in
    casper.then(function () {
        var flag = 0;//to check if notebook has been found
        var counter = 0;//counts the number of notebooks
        do
        {
            counter = counter + 1;
            this.wait(2000);
        } while (this.visible({type: 'css', path: 'ul.jqtree_common:nth-child(1) > li:nth-child(3) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + counter + ') > div:nth-child(1) > span:nth-child(1)'}));
        counter = counter - 1;
        for (v = 1; v <= counter; v++) {
            this.wait(2000);
            var temp = this.fetchText({type: 'css', path: 'ul.jqtree_common:nth-child(1) > li:nth-child(3) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + v + ') > div:nth-child(1) > span:nth-child(1)'});
            //this.echo(temp);
            if (temp != initial_title) {
                flag = 1;
                break;
            }
        }//for closes
        this.test.assertEquals(flag, 1, "private notebook is not visible for other users");
    });


	casper.run(function () {
            test.done();
        });
    });






