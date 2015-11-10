/*
Author: Prateek   (tc_29.1.3)
Description: This is casperjs code showing that,Type some code in the Markdown Cell of the loaded notebook and run the cell. 
* The cell should run successfully, but should display the code as it is in output
 */

//Begin Test
casper.test.begin("Executing R code in Markdown Cell", 5, function suite(test) {
	var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var errors = [];
    var input = 'R<500;S<-500;R+S';
    
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
    
    //change the language from R to Markdown
    casper.then(function(){
		this.mouse.click({ type: 'xpath' , path: ".//*[@id='prompt-area']/div[1]/div/select"});//x path for dropdown menu
		this.echo('clicking on dropdown menu');
		this.wait(2000);
	});
	
	//selecting Python from the drop down menu
	casper.then(function(){
		this.evaluate(function() {
			var form = document.querySelector('.form-control');
			form.selectedIndex = 0;
			$(form).change();
		});
		console.log('Markdown Language is selected from the drop down menu');
	});

	//create a new cell
	functions.addnewcell(casper);
	
	//adding python code in to the cell
	casper.then(function(){
		this.sendKeys({type:'css', path:'div.edit-markdown > div:nth-child(3) > div:nth-child(1)'}, input);
		this.wait(2000);
	});
	
	//to run the code
	casper.then(function(){
		this.click({type:'xpath', path:".//*[@id='run-notebook']"});
		this.wait(9000);
	});
	
	//Verifying the output for the code
	casper.then(function(){
		this.test.assertSelectorHasText({type:'css', path:".r-result-div > p:nth-child(1)"}, input, 'The R cell executed successfully and shows the code as it is in output');
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
