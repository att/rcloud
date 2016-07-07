/* 
 Author: Prateek
 Description:    This is a casperjs automated test script for Verifying Recent option exists in Notebbok panel or not 
*/
//Begin Tests
casper.test.begin("Verifying for Recent option exists in Notebbok panel or not", 3, function suite(test) {

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
		this.exists(".dropdown-toggle.recent-btn");
		this.echo('Recent option exists');
	});
	
	functions.delete_notebooksIstarred(casper);
	
	casper.run(function () {
        test.done();
    });
});
