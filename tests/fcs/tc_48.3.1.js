/*
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that, Line numbers for a Python code should be visible for a cell in executing mode
 */

//Test begins
casper.test.begin(" Checking line numbers in executing mode", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var temp;
    var notebook_id = "921337893be08e049f0e";
    
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
    
    
    //click on toggle edit button
    casper.then(function(){	
		var z = casper.evaluate(function () {
                $('.icon-edit').click();
                console.log('clicking on toggle edit button to make it editable');
                this.wait(3000);
			});
	});
    
	casper.then(function(){
		console.log('verifying line numbers are visible or not when the cell is in editable mode');
		var line_numbers = [];
		for(var i=1 ; i<=3 ; i++)
		{
		line_numbers [i-1] = this.fetchText({type: 'xpath', path: ".//*[@id='part1.R']/div[3]/div[1]/div[2]/div/div[1]/div[1]/div["+ i +"]"});
		}
		var z = line_numbers.length;
		if ( z == 3)
		{
			this.test.pass("line numbers in code block are visible in editable mode");
		}
		else
		{
			this.test.fail("line numbers in code block are not visible in editable mode");
		}
		
	});
	
	casper.run(function () {
        test.done();
    });
});
  
    
    
    
    
    
