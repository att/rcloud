/* 
 Author: Prateek
 Description: Check whether code can be written in  R cell
 */

//Begin Tests

casper.test.begin("To write a code in the R cell ", 6, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code = "a<-50+50\n a";
    var expectedresult = "100"

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });
    casper.wait(10000);

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some \n\
    of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
    });

    //Create a new Notebook.
    functions.create_notebook(casper);

    //add a new cell and execute its contents
    functions.addnewcell(casper);
    functions.addcontentstocell(casper,input_code);
    
    casper.wait(3000).then(function () {
		this.waitForSelector(x(".//*[@id='part1.R']/div[3]/div[2]/pre/code"), function () { 
		  this.test.assertSelectorHasText(x(".//*[@id='part1.R']/div[3]/div[2]/pre/code"), expectedresult, 'Code is written in the R cell');
        });
	});
	
	casper.run(function () {
        test.done();
    });
});
    
