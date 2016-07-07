/*
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that, 
 * For a non-executed cell, he cell status shows an open circle
 */

//Test begins
casper.test.begin(" For non Executed cell, status will be Open circle", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var temp, res;
    var actual_res = 'icon-circle-blank';
    var notebook_id = "95a75c9f62f95adc2469";//slow notebook id
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
    
    //open notebook belonging to some different user
    casper.then(function (){
        this.thenOpen('http://127.0.0.1:8080/main.html?notebook=' + notebook_id);
    });

    casper.wait(5000).then( function (){
         title = functions.notebookname(casper);
        this.echo("Notebook title : " + title);
        this.wait(3000);
    });
    
    functions.fork(casper);
    
    //Fetching the elemnt information and comparing with the var status
	casper.wait(4000).then(function () {
		var temp = this.getElementInfo(x(".//*[@id='part2.R']/div[2]/div[1]/span[3]/i")).tag;
		res = temp.substring(45, 62);
		this.echo('Cureents cell status is :' +res );
	});
	
	casper.then(function(){
		if (actual_res == res)
		{
			this.test.pass('For non Executed cell, status will be:' +res);
		}else
		{
			this.test.fail('Failed to fetch the cell details');
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
	
	
