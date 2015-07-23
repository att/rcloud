/* 
 Author: Tejas (tc_11.2.4)
 Description:    This is a casperjs automated test script for showing that for the given combination,selecting Coalesce Cell option for the bottom cell 
				 results in merging of the bottom cell with the top one
 */

//Begin Tests

casper.test.begin("Coalesce combination of two R cells", 7, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var input_content_1="a<-12"; 
	var input_content_2="a<-95"; 
    var functions = require(fs.absolute('basicfunctions'));

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
    
    //Add first cell and contents
    casper.then(function(){
		console.log("Adding new cell");
		functions.addnewcell(casper);
		this.wait(6000);
		console.log("Initialising the variable and executing the cell");
		functions.addcontentstocell(casper, input_content_1);
    	this.wait(6000);
	});
	
	//Adding second cell and contents
	casper.then(function(){
		functions.addnewcell(casper); //adding new cell
		this.wait(6000);
	});
	casper.then(function(){
		this.sendKeys({type : 'xpath' , path:'/html/body/div[3]/div/div[2]/div/div[1]/div[2]/div[3]/div[1]/div[2]/div/div[2]/div'}, input_content_2 );
		this.wait(7000);
    }); 
    
    //Click coaslesce option
    casper.then(function(){
		this.wait(6000);
		this.click({ type : 'xpath' , path : '/html/body/div[3]/div/div[2]/div/div[1]/div[2]/div[1]/span[2]/i'});
		console.log('clicked coalesce option');
		this.wait(5000);
	});
	
	casper.viewport(1024, 768).then(function(){	
		this.wait(3000);
		casper.test.assertDoesntExist({ type :  'xpath' , path : '/html/body/div[3]/div/div[2]/div/div[1]/div[2]/div[2]/div[1]/span[4]' });
	});

    casper.run(function () {
        test.done();
    });
});

