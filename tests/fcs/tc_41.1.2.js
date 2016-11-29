/*
Author: Prateek
Description:  This is a casperjs automated test script for showing thatExecuting cell status shows "Computing" and non-executed cell status shows "Waiting"

*/

//Test begins
casper.test.begin(" checking second cell status", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_id = "2144d2081c63dd07e8ba07f01be26473";
    var title;

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

    //open notebook belonging to some different user
    casper.then(function (){
        this.thenOpen('http://127.0.0.1:8080/main.html?notebook=' + notebook_id);
    });

    casper.wait(5000).then( function (){
        title = functions.notebookname(casper);
        this.echo("Notebook title : " + title);
        this.wait(3000);
    });

    //get the notebook owner's name and verify that it belongs to a different user
    casper.then(function () {
        var author = this.fetchText({type: 'css', path: '#notebook-author'});
        this.echo("Notebook author: " + author);
        this.test.assertNotEquals(author, github_username, "Confirmed that notebook belonging to different user has been opened");
    });
    
    functions.runall(casper);
	
	casper.wait(2000).then(function(){
		this.test.assertDoesntExist(".icon-circle-blank", '2nd cell is in queue');
	});
	
	casper.run(function () {
        test.done();
    });
});
	
	
	
		
		
