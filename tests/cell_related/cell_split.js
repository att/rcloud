/*
Author: Prateek (tc_11.1.3)
Description:    This is a casperjs automated test script for showing that If the cursor is placed anywhere in between the content of a cell,
then the entire content present after the cursor gets pushed to a newly created cell immediately beneath the existing cell
*/
    
//Begin Tests
    
casper.test.begin("Split cells when cursor anywhere in between the code", 7, function suite(test) {
	var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var input_code1 = '"Aviator"';
    var input_code2 = '"Innovator"';
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid;
    
    casper.start(rcloud_url, function () {
    casper.page.injectJs('jquery-1.10.2.js');
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
    
    //Add new notebook
    casper.then(function(){
		functions.create_notebook(casper);
		this.wait(5000);
    });
        
    // Add contents to cell
	casper.then(function(){
		functions.addnewcell(casper);
		functions.addcontentstocell(casper,input_code1);
    });

    //adding new cell
    casper.then(function(){
		functions.addnewcell(casper); 
		this.wait(6000);
	});
        
    // Add contents to cell
    casper.then(function(){
		this.sendKeys({type : 'xpath' , path:'/html/body/div[3]/div/div[2]/div/div[1]/div[2]/div[3]/div[1]/div[2]/div/div[2]/div'}, input_code2 );
        this.wait(7000);
        this.echo("adding contents to second cell");
	});
    
    casper.then(function () {
		var z = casper.evaluate(function () {
        $('.icon-edit').click();
        });
        this.echo("clicking on toggle edit button");
    });
    
    // clicking on coalesce icon
    casper.then(function () {
		this.wait(7000);
        this.click({type : 'xpath' , path:'/html/body/div[3]/div/div[2]/div/div[1]/div[2]/div[1]/span[2]/i'});
        this.wait(5000);
        this.echo("joining two cells");
    });
    
     //clicking split icon
	casper.then(function () {
		var z = casper.evaluate(function () {
        $('.icon-unlink').click();
        this.echo("clicking on split icon");
        this.wait(5000);
        });    
	});
	
	//Verifying the split cell is present or not
	casper.then(function(){
		this.test.assertSelectorHasText({ type :  'xpath' , path : '/html/body/div[3]/div/div[2]/div/div[1]/div[2]/div[3]/div[1]/div[1]/pre/code'}, input_code2,'Second cell consists the contents');
		this.wait(4000);
		this.echo('second cell is present after splitting');
	});	
		
	casper.run(function () {
		test.done();
	});
    
});
    
