/*
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that, 
 * For a cell which has had an error on execution, the cell shows a red exclamation as the cell status
 */

//Test begins
casper.test.begin(" Cell status for a failed cell", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var temp, res;
    var actual_res = 'icon-exclamation';
    var input = 'a = 12;pri a';
    
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
    
    //Create a new notebook
    functions.create_notebook(casper);
    
    //Create a new cell
    functions.addnewcell(casper);
    
    //Add contents to the cell and execute it
    casper.wait(3000);

    functions.addcontentstocell(casper, input);
    
    //Fetching the elemnt information and comparing with the var status
	casper.then(function () {
		var temp = this.getElementInfo(x(".//*[@id='part1.R']/div[2]/div[1]/span[3]/i")).tag;
		this.echo(temp);
		res = temp.substring(68, 84);
		this.echo(res);
		this.echo('Currents cell status is :' +res );
	});
	
	casper.then(function(){
		if (actual_res == res)
		{
			this.test.pass('status for failed cell will be:' +res);
		}else
		{
			this.test.fail('Failed to fetch the cell details');
		}
	});

    casper.run(function() {
		test.done();
    });
});
