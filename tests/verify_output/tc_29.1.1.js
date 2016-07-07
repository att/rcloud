/* 
 Author: Prateek
 Description:    This is a casperjs automated test script for showing that, 
 Type some valid R code in the R Cell of the loaded notebook and run the cell. The cell should run successfully and produce correct results.
 */

//Begin Tests

casper.test.begin("Execute valid R code in R Cell", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var input = "a<-50+50\n a";
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid;

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
    
    //Add new notebook
    casper.then(function(){
		functions.create_notebook(casper); 
		this.wait(5000);
	});
    
    //Add new cell
    casper.then(function () {
        functions.addnewcell(casper);
    });
    
    //Adding contents to cell
    casper.wait(2000).then(function (){
        functions.addcontentstocell(casper,input);    
    });
	
	//fetch the output text and compare
    casper.then(function () {
		console.log('Testing if The R code has produced the expected output');
		test.assertSelectorHasText(x(".//*[@id='part1.R']/div[3]/div[2]/pre/code"), '100',"Valid Rcode has produced expected output");
	});
    
    casper.run(function () {
        test.done();
    });
});
	
	
	
