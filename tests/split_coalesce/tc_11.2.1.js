/* 
 Author: Prateek
 Description:This is a casperjs automated test script for showing that 
 Coalesce Cell option for the topmost cell should not be present
 */

//Begin Tests

casper.test.begin("No Coalesce Cell option for the topmost cell", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));

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

    //Add new notebook
    casper.then(function(){
		functions.create_notebook(casper); 
		this.wait(5000);
    });

    //Add new cell
    casper.then(function () {
        functions.addnewcell(casper);
    });
    
    //Checking for coalesce option for top cell
    casper.viewport(1024, 768).then(function(){	
		this.wait(3000);
		casper.test.assertDoesntExist("#part2\.R > div:nth-child(1) > span:nth-child(2) > i:nth-child(1)", 'Join cell icon is not visible for the top most cell');
	});
    
    casper.run(function () {
        test.done();
    });
});

