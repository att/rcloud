/*
 Author: Prateek 
 Description:The loaded notebook contains a Rmarkdown cell with some code but is not executed. On clicking the 'Run All' icon present on the top-left
 corner of the page should execute the cell

 */

//Begin Test

casper.test.begin("Execute Rmarkdown cell (not pre-executed) using Run All", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code = "hello" ;

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

    //selecting markdown from the drop down menu
    casper.wait(1000).then(function(){
        this.evaluate(function() {
            var form = document.querySelector('.form-control');
            form.selectedIndex = 0;
            $(form).change();
        });
    });

    casper.wait(1000).then(function(){
        functions.addnewcell(casper);
    });

    //create a new markdown cell with some contents
    casper.wait(2000).then(function () {
        this.wait(2000).then(function(){
            this.sendKeys({type:'xpath', path:".//*[@id='part1.md']/div[3]/div[1]/div[2]/div/div[2]/div"}, input_code); 
            this.echo("Entered code into the cell but did not execute it yet");
        });
    });

    //to run the code
	casper.wait(1000).then(function(){
		functions.runall(casper);
	});
	
    //Verifying the output for the code
	casper.then(function(){
		this.test.assertSelectorHasText({type:'xpath', path:".//*[@id='part1.md']/div[3]/div[2]/p"}, input_code, 'Code has produced expected output under markdown cell');
	});

    casper.run(function () {
        test.done();
    });
});
