/* 
 Author: Prateek
 Description:This is a casperjs automated test script for
 * Check whether a particular Notebook opens or not from the recent options
*/
//Begin Tests
casper.test.begin("Check whether a particular Notebook opens or not from the recent options",4,  function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_name;

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
    
    functions.create_notebook(casper);
    
    casper.then(function () {
		notebook_name = this.fetchText('#notebook-title');
		this.echo('Newly created Notebook name is: ' + notebook_name);
	});
    
    casper.then( function () {
		this.click(x(".//*[@id='notebooks-panel-inner']/div/a"));
		console.log('Clicking on Recent Option');
	});
	
	casper.then(function (casper) {
		this.click(x(".//*[@id='notebooks-panel-inner']/div/ul/li[1]/a"));
		console.log('Clicking on Notebook');
		this.wait(5000);
	});
	
	casper.then(function () {
		var notebook_name1 = this.fetchText('#notebook-title');
		this.echo('After loading notebook from the Recent option, Notebook name is: ' + notebook_name1);
		this.test.assertNotEquals(notebook_name,notebook_name1,'Confirmed that Notebook is opened from the Recent option');
	});
	
	casper.run(function () {
        test.done();
    });
});
