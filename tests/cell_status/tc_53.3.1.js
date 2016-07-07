/*
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that, 
 * For a cell which is queued while running multiple cells, the cell shows a blue arrow as cell status
 */

//Test begins
casper.test.begin(" Cell status for a queued cell", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var temp, res;
    var actual_res = 'icon-arrow-right';
    var notebook_id = "aee32afd46a8daece207d5812b72c8a4";//slow notebook id
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
    
    functions.runall(casper);
    
    //Fetching the elemnt information and comparing with the var status
	casper.then(function () {
		var temp = this.getElementInfo(x(".//*[@id='part6.R']/div[2]/div[1]/span[3]/i")).tag;
		res = temp.substring(85, 101);
		this.echo('Cureents cell status is :' +res );
	});
	
	casper.then(function(){
		if (actual_res == res)
		{
			this.test.pass('status for queued cell will be:' +res);
		}else
		{
			this.test.fail('Failed to fetch the cell details');
		}
	});
	
	casper.run(function() {
        test.done();
    });
});
