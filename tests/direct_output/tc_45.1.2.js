/*
 Author: Prateek
 Description:  This is a casperjs automated test script for showing that,When we run a cell, the code block becomes uneditable. 
 * The code should be editable when clicked on the toggle edit option

 */

//Test begins
casper.test.begin(" Making editable cell after clicking on toggle edit button", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code = 'a<-50 ';
    var input_code1 = '\n b<-a+50\n b';

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
    
    //Create a new cell
    functions.addnewcell(casper);
    
    //Add content to cell and execute it
    functions.addcontentstocell(casper,input_code);
    
    casper.wait(5000);
    //Click on the 1st cell again
	casper.then(function(){	
		var z = casper.evaluate(function () {
                $('.icon-edit').click();
                console.log('clicking on toggle edit button to make cell editable');
                this.wait(3000);
			});
		});
	casper.then(function(){	
		this.sendKeys(x(".//*[@id='part1.R']/div[3]/div[1]/div[2]/div/textarea"), input_code1);
        console.log('adding again contents to the same cell');
        functions.runall(casper);
	});
	
	//Verify the input_code1 contets
	casper.then(function(){
		test.assertSelectorHasText({type : 'css' , path: '.r-result-div'},'100',"Verifying whether cell is editable or not");
        this.wait(5000);
        console.log("After making cell editable, the added contents are present");
    });
    casper.run(function () {
        test.done();
    });
});
	
	
	
	
	
	
	
    
    
