/*
 Author: Prateek
 Description: This is casperjs script showing that,Type some valid Python code in the Python Cell of the loaded notebook and run the cell. 
 * The cell should run successfully and produce correct results.
 */

//Begin Tests

casper.test.begin("Execute valid Python code in Python Cell", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input= 'a=50+50 ; print a';

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

    casper.wait(10000);

    //login to Github and RCloud
    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(8000);
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
			form.selectedIndex = 2;
			$(form).change();
		});
		console.log('Python Language is selected from the drop down menu');
	});

	casper.then(function(){
		this.reload();
		this.wait(4000);
	});
	
	casper.wait(2000).then(function (){
		functions.runall(casper);
	});
	
	//Verifying the output for the code
	casper.wait(8000).then(function(){
		this.wait(10000);
		this.test.assertSelectorHasText(x(".//*[@id='part1.py']/div[3]/div[2]"), '100', 'Python code has produced expected output for valid code');
	});	
	
	casper.run(function () {
        test.done();
    });
});

	
	
	
	
	
	
	
