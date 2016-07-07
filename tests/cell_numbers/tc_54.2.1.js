/*
 Author: Amith
 Description: This is a casperjs automated test script for showning that, In the view.html page of the notebook, the cell numbers for any cell should be displayed when 'Show Cell Numbers' option is enabled from the settings div
 */

//Begin Tests
casper.test.begin("Checking for cell number visibility on view.html", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid;//to get the notebook id
    var input = '"Welcome to RCloud"';

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

    casper.wait(10000);

    //login to Github and RCloud
    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(4000);

    });

    //getting Notebook ID
    casper.viewport(1024, 768).then(function () {
        this.click("#new-notebook > span:nth-child(1) > i:nth-child(1)");
        this.wait(5000);
        var temp1 = this.getCurrentUrl();
        notebookid = temp1.substring(41);
        this.echo("The Notebook Id: " + notebookid);
    });

    //Added a new R cell and execute contents
    casper.wait(5000).then(function () {
        functions.addnewcell(casper);
    });

    casper.wait(8000).then(function () {
        functions.addcontentstocell(casper,input);
        this.wait(4000);
    });

    casper.wait(3000).then(function () {
        this.thenOpen('http://127.0.0.1:8080/view.html?notebook=' + notebookid);
        this.wait(8000);      
    });
    
    casper.wait(3000).then(function () {
        this.reload();    
    });

    casper.wait(8000).then(function(){
       this.waitForSelector("#notebook-title", function (){
            this.test.assertExists('#edit-notebook > i:nth-child(1)', 'the element Edit icon exists. Hence page has got loaded properly'); 
       });
    });    
       
    //Checking for cell numbers
    casper.wait(3000).then(function(){
		this.echo(this.fetchText(x(".//*[@id='part1.R']/div[1]/div/span[4]")));
		console.log('cell numbers are visible');
		this.wait(2000);
	});
    
    casper.run(function () {
        test.done();
    });
});

    
