/*

 Author: Arko
 Description:The notebook will contain two or more R cells as well as Markdown cells, each with some code which are already executed and
 Run all button is then clicked and checked whether all the R cells are executed or no.

 */
casper.test.begin("Pre executed two or more R cells and Markdown cells to be executed using Run All", 8, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var NotebookID = '03addaf3f5250b3f6856';
    var expected_result = "240"; //Expected output of Markdown cells
    var input_code = "Hi, this is to test whether RunAll is working or not" //Expected output of Markdown cells
    var errors = [];

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
	
	//Loading a notebook which contains 2 R cells and 2 Markdown cells
	casper.then(function(){
		this.thenOpen('http://127.0.0.1:8080/edit.html?notebook='+ NotebookID);
		this.wait(8000);
	});
	
	//Now we have 2 R cells and 2 markdown cells with some codes pre-executed . Will execute it using Run All
    functions.runall(casper);
    casper.then(function () {
        this.test.assertVisible('.r-result-div', "Output div is visible which means that cell execution has occured successfully");
		for ( var i =1; i<=2 ; i++)
		{
			var result = this.fetchText({type: 'xpath', path: ".//*[@id='part"+i+".R']/div[3]/div[2]/pre/code"});//fetch the output after execution
			this.echo(result);
			var res = result.substring(4,7);//remove the unwanted characters
			this.test.assertEquals(res, expected_result, "The R code has produced the expected output using Run All for cell  " + i); 
			this.wait(4000);
		}   
		for ( var i =3; i<=4 ; i++)
		{
			var result = this.fetchText({type: 'xpath', path: ".//*[@id='part"+i+".md']/div[3]/div[2]/p"});//fetch the output after execution
	        this.test.assertEquals(result, input_code, "The code executed in Markdown cell has produced the expected output using Run All for cell "+i);        
			this.wait(4000);
		}			 
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
