/*
Author: Prateek
Description:  This is a casperjs automated test script for showing thatExecuting cell status shows "Computing" and non-executed cell status shows "Waiting"

*/

//Test begins
casper.test.begin(" checking second cell status", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code1 = "a<-50";
    var input_code2 = "b<- a+50";
    var input_code3 = "b";
    
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
    
    
	//Create a new Notebook.
    functions.create_notebook(casper);
    
    //Creatin first a new cell 
    casper.then(function (){
        functions.addnewcell(casper);
        functions.addcontentstocell(casper, input_code1);
    });
	
    //Creating second cell
	casper.then(function (){
        console.log("Adding 2nd cell")
        this.click(x(".//*[@id='prompt-area']/div[1]/div/span/i"));
        this.waitForSelector(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), function (){
            this.sendKeys(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), input_code2);
            console.log("Adding contents to 2nd cell");
        });
    });

    //Creating third cell
    casper.then(function (){
        console.log("Adding 3rd cell")
        this.click(x(".//*[@id='prompt-area']/div[1]/div/span/i"));
        this.waitForSelector(x(".//*[@id='part3.R']/div[3]/div[1]/div[2]/div/div[2]/div"), function (){
            this.sendKeys(x(".//*[@id='part3.R']/div[3]/div[1]/div[2]/div/div[2]/div"), input_code3);
            console.log("Adding contents to 2nd cell");
        });
    });
	
	//Clicking on Run all icon
	functions.runall(casper);
	console.log("Clicking on Run All icon");
	
	//Verifying the results
	casper.then(function(){
		test.assertSelectorHasText(x(".//*[@id='part3.R']/div[3]/div[2]/pre/code"), '100',"The notebook's cells are executed sequentially");
	});
	
	casper.run(function () {
        test.done();
    });
});
    
    
    
    
    
    
    
    
    
