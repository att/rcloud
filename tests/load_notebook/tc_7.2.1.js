/*
 Author: Prateek 
 Description: The notebooks will be loaded based on their respective IDs. The notebook ID will refer to some existing notebook belonging to the same user
 */

//Begin Test
casper.test.begin(" Using the ID of existing notebook (same user) ", 6, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var URL;
    var input = 'a<-30; b<-30; c = a+b';
    var Notebook_id;
    
    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });
    casper.wait(10000);

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(5000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
    });
    
    functions.create_notebook(casper);
    
    functions.addnewcell(casper);
    
    functions.addcontentstocell(casper, input)
    
    casper.then (function () {
		URL = this.getCurrentUrl();
		var Notebook_id = URL.substring(41);
		this.echo('Current loaded Notebook ID is :' + Notebook_id);
	});
	
	functions.open_advanceddiv(casper)
	
	casper.then (function () {		
		console.log("Clicking on dropdown");
		console.log('Clicking on Load notebook ID option');
		casper.setFilter("page.prompt", function(msg, currentValue) {
			if (msg === "Enter notebook ID or github URL:") {
				return Notebook_id;
			}
		});
	});
	
	casper.then(function () {
		var URL1 = this.getCurrentUrl();
		this.test.assertEquals(URL, URL1, "Existing Notebook is opened using Load Notebook Id option");
	});
	
	casper.run(function () {
        test.done();
    });
}); 
		
