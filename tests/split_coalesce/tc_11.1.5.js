/* 
 Author: Prateek
 Description:This is a casperjs automated test script for showing that If the Split Cell option for the topmost cell is selected, 
no new cell is created
 */

//Begin Tests

casper.test.begin("Clicking Split Cell option for the first cell ", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var input = "a<-34+23;b<-45+34;a;b";
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid;

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
    
    //Add new notebook
    casper.then(function(){
		functions.create_notebook(casper); 
		this.wait(5000);
	});
    
    //getting Notebook ID
    casper.viewport(1024, 768).then(function () {
        var temp1 = this.getCurrentUrl();
        notebookid = temp1.substring(41);
        this.echo("The Notebook Id: " + notebookid);
    });
    
    //Add new cell
    casper.then(function () {
        functions.addnewcell(casper);
    });
    
    //Adding contents to cell
	functions.addcontentstocell(casper,input);
		
		
	casper.viewport(1024, 768).then(function(){
		this.click(x(".//*[@id='part1.R']/div[3]/div[1]/div[2]/div/div[2]/div"));
		this.echo("clicking on cell");
		this.wait(3000);
		this.echo("verifying whether split icon is visible or not");

		if (this.exists({type: 'xpath', path: '/html/body/div[3]/div/div[2]/div/div[1]/div/div[2]/div[2]/span[4]/i'}))
		{
			this.test.pass(" Split icon is not visible for the first cell, hence cell will not be splitted");
		}
	});
    
    casper.run(function () {
        test.done();
    });
});

