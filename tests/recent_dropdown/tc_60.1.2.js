/* 
 Author: Prateek
 Description:This is a casperjs automated test script for
 * Verfying whether dropdown box appears or not with notebook names
*/
//Begin Tests
casper.test.begin("Verfying whether dropdown box appears or not with notebook names", 3, function suite(test) {

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
		this.echo(notebook_name);
	});
    
    casper.then( function () {
		this.click(x(".//*[@id='notebooks-panel-inner']/div/a"));
		console.log('Clicking on Recent Option to verify whether drop down contains Notebook names or not');
	});
	
	casper.then(function () {		
		for (var i = 1; i <= 5; i++) {
			var temp = this.fetchText({
                    type: 'xpath',
                    path: ".//*[@id='notebooks-panel-inner']/div/ul/li[" + i + "]/a"
                });
                this.echo('Notebook names under Recent option drop down: ' + temp);
			}
		this.wait(5000);
	});
	
	functions.delete_notebooksIstarred(casper);
	
	casper.run(function () {
        test.done();
    });
});
		
   
