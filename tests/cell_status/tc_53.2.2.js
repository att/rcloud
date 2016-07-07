/*
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that, 
 * For a cell ran from the individual run button for the cell, the running cell shows a blue spinner as the cell status
 */

//Test begins
casper.test.begin(" Cell running by clicking the individual run button for a cell", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var temp, res;
    var actual_res = 'spinner icon-spin';
	var notebook_id = "aee32afd46a8daece207d5812b72c8a4";//slow notebook id
    
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
    
    casper.then(function(){
		this.click(x(".//*[@id='part1.R']/div[2]/div[2]/span[1]/i"));//clicking on 1st cell run icon
		this.echo('clicking on 1st cell run icon');
        this.wait(3000);
    });

    casper.wait(2000).then(function (){
        // this.waitForSelector(".icon-spinner", function (){
    		this.click(x(".//*[@id='part2.R']/div[2]/div[2]/span[1]/i"));//clicking on 2nd cell run icon
    		this.echo('clicking on 2nd cell run icon');
    		this.wait(1000);
    		this.click(x(".//*[@id='part3.R']/div[2]/div[2]/span[1]/i"));//clicking on 3rd cell run icon
    		this.wait(1000);
    		this.echo('clicking on 3rd cell run icon');
    		this.click(x(".//*[@id='part4.R']/div[2]/div[2]/span[1]/i"));//clicking on 4th cell run icon
    		this.echo('clicking on 4th cell run icon');
    		this.click(x(".//*[@id='part5.R']/div[2]/div[2]/span[1]/i"));//clicking on 5th cell run icon
    		this.echo('clicking on 5th cell run icon');
        // });
    });
    
    casper.wait(2000);
    
    //Fetching the elemnt information and comparing with the var status
	casper.then(function () {
		var temp = this.getElementInfo(x(".//*[@id='part2.R']/div[2]/div[1]/span[3]/i")).tag;
		res = temp.substring(80, 97);
		this.echo('Cureents cell status is :' +res );
	});
	
	casper.then(function(){
		if (actual_res == res)
		{
			this.test.pass('For a cell which is in  running mode, status will be:' +res);
		}else
		{
			this.test.fail('Failed to fetch the cell details');
		}
	});
	
	

    casper.run(function() {
        test.done();
    });
});
