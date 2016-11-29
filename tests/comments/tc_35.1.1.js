/*
Auther : Sanket
Description:    This is a casperjs automated test script for showing that Username of the commentor will be displayed along with the 
* comment in comments div
*/

//Begin Test
casper.test.begin("Verifying the username along side the comment", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var comment="AGENT_COULSON"; // comment to be posted 
    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
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
     functions.create_notebook(casper);
     casper.wait(9000);
	 
	 functions.comments(casper, comment);
	 
	 casper.wait(10000);
	 
	 casper.then(function(){
		 this.test.assertSelectorHasText(".comment-header",github_username, "Comment has username along with it");
	 });
	 
	 casper.run(function () {
        test.done();
    });
});

	 
	   
    
