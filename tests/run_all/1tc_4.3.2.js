/*

 Author: Arko
 Description:Notebook containing more than one R cell with some code which is already executed and
 Run all button is then clicked and checked whether all the R cells are executed or no.

 */
casper.test.begin("Execute one or more R cells pre executed using Run All", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code = "a<-50+50;a" ;
    var expected_result = "100";
    
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

    //Added a new R cell and execute contents
    casper.wait(2000).then(function () {
        functions.addnewcell(casper);
    });

    casper.wait(2000).then(function () {
        functions.addcontentstocell(casper,input_code)
    });
	
	casper.then(function() {
		this.click('div.cell-control-bar:nth-child(1) > span:nth-child(1) > i:nth-child(1)');
		this.wait(2000);
		console.log('Creating one more cell');
	});
	
	casper.wait(1000).then(function() {
		this.wait(4000);
		this.sendKeys({type:'xpath', path:".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div/div[3]"}, input_code);
		console.log('Adding contents to the new cell');
	});

	functions.runall(casper);
    
    //verifying for output console
    casper.then(function () {
        this.test.assertVisible('.r-result-div>pre>code', "Output div is visible which means that cell execution has occured successfully");
    });

	casper.run(function () {
        test.done();
    });
});
