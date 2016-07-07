/*
Author: Prateek
Description:    This is a casperjs automated test script for showing that, Clicking on the Stop button stops the execution of the 
* executing waiting cells and show canalled status indicated by splat
*/

//Begin Tests

casper.test.begin("Checking whether, Clicking on the Stop button stops the execution of the executing waiting cells and show canalled status indicated by splat", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var notebook_id = "aee32afd46a8daece207d5812b72c8a4";
	var title, temp, temp1;
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
    
    //open notebook belonging to some different user
	casper.viewport(1366, 768).thenOpen('http://127.0.0.1:8080/main.html?notebook=' + notebook_id, function () {
    this.wait(10000);
    this.then(function () {
        title = functions.notebookname(casper);
        this.echo("Notebook title : " + title);
        this.wait(3000);
		});
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

	//get the notebook owner's name and verify that it belongs to a different user
	casper.then(function () {
	    var author = this.fetchText({type: 'css', path: '#notebook-author'});
	    this.echo("Notebook author: " + author);
	    this.test.assertNotEquals(author, github_username, "Confirmed that notebook belonging to different user has been opened");
	});
	
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
    
	casper.then(function(){
		this.evaluate(function() {
			document.querySelector('#run-notebook').click();
		});
		console.log('Clicking on stop icon');
	});
	
	casper.wait(5000);
	
	casper.then(function(){
		var e = this.getElementInfo(x(".//*[@id='part4.R']/div[2]/div[1]/span[3]/i")).tag;
        temp = e.substring(10,19);
        this.echo(temp);
        this.echo('Current icon for run all button is :' + temp);
        this.wait(2000);
    });
    
	casper.run(function () {
    	test.done();
    });
});
			
		
		
		
			
		
		
		
