/*
Author: Prateek
Description:This is a casperjs automated test script for showing that, 
To toggle the display of output div for R cell which is already executed 
*/

//Begin Test
casper.test.begin("Output div is visible even after withou clicking on toggle output button", 6, function suite(test) {
	var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code = 'a<-12; a ';
    
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
    
    //create a new notebook
    functions.create_notebook(casper);   

	//create a new cell
	casper.then(function(){
		functions.addnewcell(casper);
	});
	
	//adding contents to the newly created Markdown cells
	functions.addcontentstocell(casper, input_code);
	
	casper.wait(2000);

	//verfying the results
	casper.then(function(){
		this.test.assertVisible(x(".//*[@id='part1.R']/div[3]/div[2]/pre/code"), 'Cell gets executed and output is visible');
		console.log('Output is visible after cell gets executed');
	});

	casper.run(function () {
        test.done();
    });
});
	
	

	
	
