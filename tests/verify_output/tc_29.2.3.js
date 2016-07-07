/*
Author: Prateek
Description: Type some valid Python code in the Python Cell of the loaded notebook and run the cell. 
The cell should run successfully and produce correct results.
 */

//Begin Test
casper.test.begin("Execute Python code in Markdown cell", 6, function suite(test) {
	var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var errors = [];
    var input = 'a=5';
    
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
    casper.then(function (){
    	functions.addnewcell(casper);
    });

    //Adding contents to cell
    casper.wait(2000).then(function(){
    	functions.addcontentstocell(casper, input);
    });
    
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
			form.selectedIndex = 0;
			$(form).change();
		});
		console.log('Markdown Language is selected from the drop down menu');
	});

	casper.then(function(){
		this.reload();
		this.wait(4000);
	});
	
	casper.wait(2000).then(function (){
		functions.runall(casper);
	});
	
	//Verifying the output for the code
	casper.then(function(){
		this.test.assertSelectorHasText(x(".//*[@id='part1.md']/div[3]/div[2]/p"), 'a=5', 'Python code has produced expected output under markdown cell');
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
	
	

	
	
