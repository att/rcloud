/* 
 Author: Prateek 
 Description:    This is a casperjs automated test script for showing that 
 * Verifying whether output div disappears after clicking on hide output
 */

//Begin Tests

casper.test.begin("Verifying whether output div disappears after clicking on hide output", 7, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input = 'a = 25; b=25; c = a+b; c';
    var output;

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
    //Add new notebook
    casper.then(function () {
        functions.create_notebook(casper);
        this.wait(5000);

    });

    //Add new cell
    casper.then(function () {
        functions.addnewcell(casper);
    });
    
    //Add contents to the cell and execute it
	functions.addcontentstocell(casper, input);
	
    //Checking for output div
    casper.then(function () {
        this.test.assertVisible({
            type: 'xpath',
            path: ".//*[@id='part1.R']/div[3]/div[2]"},'output div is visble');
    });

    //Click on Hide output button
    casper.then(function () {
        this.click(".icon-picture");
        console.log('Clicking on hide output option');
        this.wait(2000);
	});
	
	casper.then(function () {
        this.test.assertNotVisible({
            type: 'xpath',
            path: ".//*[@id='part1.R']/div[3]/div[2]"
        }, 'output div is not visble after clicking on hide option');
    });

    casper.wait(6000);

    casper.run(function () {
        test.done();
    });
});
