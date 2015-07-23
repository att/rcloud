/*
Author: Prateek  (tc_29.2.2)
Description: Checking whether on Executing a python cell with invalid python code,it displays an Error or not
 */

//Begin Test
casper.test.begin("Executing a python cell with invalid python code", 5, function suite(test) {
	var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var errors = [];
    var input = 'a<-105';
    
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
    
    //create a new notebook
    functions.create_notebook(casper);
    
    //change the language from R to Python
    casper.then(function(){
		this.mouse.click({ type: 'xpath' , path: ".//*[@id='prompt-area']/div[1]/div/select"});//x path for dropdown menu
		this.echo('clicking on dropdown menu');
		this.wait(2000);
	});
	
	//selecting Python from the drop down menu
	casper.then(function(){
		this.evaluate(function() {
			var form = document.querySelector('.form-control');
			form.selectedIndex = 2;
			$(form).change();
		});
		console.log('Python Language is selected from the drop down menu');
	});

	//create a new cell
	functions.addnewcell(casper);
	
	//adding python code in to the cell
	casper.then(function(){
		this.sendKeys({type:'xpath', path:'/html/body/div[3]/div/div[2]/div/div[1]/div/div[3]/div[1]/div[2]/div/div[2]/div'}, input);
		this.wait(2000);
	});
	
	//to run the code
	casper.then(function(){
		this.click({type:'xpath', path:".//*[@id='run-notebook']"});
		this.wait(9000);
	});
	
	//Verifying the output for the code
	casper.then(function(){
		this.test.assertSelectorHasText({type:'xpath', path:".//*[@id='part1.py']/div[3]/div[2]/span/span[2]"}, 'NameError', 'Python code has produced Error for invalid code');
	});
	
	//Registering to the page.errors actually not required but still if there are some errors found on the page it will gives us the details
	casper.on("page.error", function(msg, trace) {
	  this.echo("Error:    " + msg, "ERROR");
	  this.echo("file:     " + trace[0].file, "WARNING");
	  this.echo("line:     " + trace[0].line, "WARNING");
	  this.echo("function: " + trace[0]["function"], "WARNING");
	  errors.push(msg);
	});
	
	casper.run(function() {
	  if (errors.length > 0) {
		this.echo(errors.length + ' Javascript errors found', "WARNING");
	  } else {
		this.echo(errors.length + ' Javascript errors found', "INFO");
	  }
	  test.done();
	});
});
	
	

	
	
