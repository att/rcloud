/* 
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that For the "Search" option, the text entered in the text box for
 'full-text search' will consist of Text within double quotes for Search like "storm", "end" etc. only


 */

//Begin Tests

casper.test.begin("If a notebook belonging to another user is loaded it will be unstarred, when it is starred,it should reflect it under 'People I Starred' and 'All Notebooks' lists ", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid = '3371fc709d91c67f06a1';//to get the notebook id
					  
    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
    });

    casper.wait(10000);

    //login to Github and RCloud
    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(4000);
	});

    //open notebook belonging to some different user
    casper.viewport(1366, 768).thenOpen('http://127.0.0.1:8080/main.html?notebook=' + notebookid, function () {
        this.wait(10000);
        this.then(function () {
            title = functions.notebookname(casper);
            this.echo("Notebook title : " + title);
            this.wait(3000);
        });
    });
        
    
    //Star the loaded notebook
    casper.viewport(1024, 768).then(function(){
		this.echo("Clicking on star button to star the loaded notebook");
		this.click({type: 'xpath', path: '//*[@id="star-notebook"]'});
		this.wait(5000);
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
    
    //Unstar the notebook
    casper.viewport(1024, 768).then(function(){
		this.echo("Clicking on Unstar button to Unstar the loaded notebook");
		this.click({type: 'xpath', path: '//*[@id="star-notebook"]'});
		this.wait(3000);
    });
    
    casper.run(function () {
        test.done();
    });
});

    
    
    
    
