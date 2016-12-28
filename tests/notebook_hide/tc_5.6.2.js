/*
 Author: Prateek
 Description: When a notebook is made public, it is visible to a different user under 'All Notebooks'. 
 * To implement, First user should login through GitHub using a GitHub user and password.  
 * Second user should login using a different GitHub user and password. By default all of First user's public notebooks should be
 *  visible to Second in All Notebooks
 */

//Begin Tests
casper.test.begin("Visibility of Public Notebooks", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var title;
    var before;// To fetch the icon details 
    var after;// To fetch the icon details after clicking on public/private icon
    var new_username = 'djoky';
    var new_user_password = 'musigma12';
    var i, j, k;

    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
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

	casper.then(function () {
        var flag = 0;//to check if notebook has been found
        var counter = 0;//counts the number of notebooks
        do
        {
            counter = counter + 1;
            this.wait(2000);
        } while (this.visible({type: 'css', path: 'ul.jqtree_common:nth-child(1) > li:nth-child(3) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + counter + ') > div:nth-child(1) > span:nth-child(1)'}));
        counter = counter - 1;
        for (i = 1; i <= counter; i++) {
            this.wait(2000);
            var temp = this.fetchText({type: 'css', path: 'ul.jqtree_common:nth-child(1) > li:nth-child(3) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + i + ') > div:nth-child(1) > span:nth-child(1)'});
            //this.echo(temp);
            if (temp != initial_title) {
                flag = 1;
                break;
            }
        }//for closes
        this.echo('Total number of notebook :' + counter);       
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

	casper.then(function(){
		this.click('ul.jqtree_common:nth-child(1) > li:nth-child(3) > div:nth-child(1) > span:nth-child(2)');
		console.log('clicking on "All-notebooks" tree');
		var flag = 0;//to check if notebook has been found
        var counter = 0;//counts the number of notebooks
        do
        {
            counter = counter + 1;
            this.wait(2000);
        } while (this.visible({type: 'xpath', path: '/html/body/div[3]/div/div[1]/div[1]/div/div/div[1]/div[2]/div/div/ul/li[3]/ul/li[' + counter + ']/div/span[1]'}));
        counter = counter - 1;
        for (j = 1; j <= counter; j++) {
            this.wait(2000);
            var temp = this.fetchText({type: 'xpath', path: '/html/body/div[3]/div/div[1]/div[1]/div/div/div[1]/div[2]/div/div/ul/li[3]/ul/li[' + j + ']/div/span[1]'});
            var res = temp.substring(0, 9); 
            if (res == github_username) {
                flag = 1;
                break;
            }
        }//for closes
        this.test.assertEquals(flag, 1, github_username + "tree has been found under all notebooks tree");
        this.click({type: 'xpath', path: '/html/body/div[3]/div/div[1]/div[1]/div/div/div[1]/div[2]/div/div/ul/li[3]/ul/li[' + j + ']/div/span[1]'});
        console.log('clicking on users tree');
	});
	
		casper.then(function () {
        var flag = 0;//to check if notebook has been found
        var counter = 0;//counts the number of notebooks
        do
        {
            counter = counter + 1;
            this.wait(2000);
        } while (this.visible({type: 'css', path: 'li.jqtree-folder:nth-child(5) > ul:nth-child(2) > li:nth-child(' + counter + ') > div:nth-child(1) > span:nth-child(1)'}));
        counter = counter - 1;
        for (k = 1; k <= counter; k++) {
            this.wait(2000);
            var temp = this.fetchText({type: 'css', path: 'li.jqtree-folder:nth-child(5) > ul:nth-child(2) > li:nth-child(' + k + ') > div:nth-child(1) > span:nth-child(1)'});
            //this.echo(temp);
            if (temp == initial_title) {
                flag = 1;
                break;
            }
        }//for closes
        this.echo('Total number of notebook :' + counter);       
    });
	
    
    casper.run(function () {
        test.done();
    });
});














