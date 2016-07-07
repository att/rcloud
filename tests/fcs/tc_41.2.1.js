/*
Author: Prateek
Description:    This is a casperjs automated test script for showing that, Clicking the individual run of the cell for 
* multiple cells causes the cells to queue up and the non-executed cells show waiting status indicated by blue arrow
*/

//Begin Tests

casper.test.begin("Checking whether the cells will be in queue, when clicking on run button for individual cells", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var notebook_id = "aee32afd46a8daece207d5812b72c8a4";
	var title;
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
    
    casper.wait(2000);
	
	casper.then(function (){
		this.test.assertExists('.icon-arrow-right',"verifying the 6th cell is in queue ");
		console.log('6th cell is in queue');
	});
		
	casper.run(function () {
    test.done();
});
});
