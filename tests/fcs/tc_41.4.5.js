/*
Author: Prateek
Description: This is a casperjs automated test script for showing that, If two cells are Coalesced during execution, 
* the earlier version of the notebook is executed but the changes are reflected in the code
*/
//Test begins
casper.test.begin("Coalesce cells during execution", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_id = "b710828b1f47f7aa372a";//slow notebook id
    var res;
    var res1;
    var actual_res = 'icon-asterisk';
    var errors = [];    
    
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
    
    //open mark down notebook belonging to some different user
    casper.viewport(1366, 768).thenOpen('http://127.0.0.1:8080/main.html?notebook=' + notebook_id, function () {
        this.wait(10000);
        this.then(function () {
            title = functions.notebookname(casper);
            this.echo("Notebook title : " + title);
            this.wait(3000);
        });
    });
    
    functions.fork(casper);
    
    casper.wait(2000);
    
    casper.then(function(){
		this.click({type:'xpath', path:'//*[@id="run-notebook"]'});
		this.then(function(){
			var z = casper.evaluate(function () {
				$('.icon-link').click();
			});
			console.log("Clicking on coalesce cell icon");
			});
		this.wait(3000);
		this.test.assertNotVisible({type:'xpath', path:".//*[@id='part1.R']/div[2]"}, "Joined cell's are not visible after coalescing the cell");
	});
	
	casper.run(function () {
        test.done();
    });
});
				
		
		
