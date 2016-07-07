/*
 Author: Amith
 Description: This is a casperjs automated test script for showning that, In the view.html page of the notebook, the cell numbers for every cell should not be displayed when 'Show Cell Numbers' option is disabled from the settings div
 */

//Begin Tests
casper.test.begin("Checking for cell number visibility on view.html", 7, function suite(test) {

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
    
    
    casper.wait(6000);
    
    casper.then(function(){
        if (this.visible('.form-control-ext')) {
            console.log('Settings div is already opened');
        }
        else {
            var z = casper.evaluate(function () {
                $('#accordion-left > div:nth-child(3) > div:nth-child(1)').click();
            });
            this.echo("Opened Settings div");
        }
    });
    
    casper.wait(6000);
    
    //Disabled the check box
    casper.then(function (){
        this.click(x(".//*[@id='settings-body']/div[3]/label/input"));
    });
    
    
    casper.wait(6000);
    
    casper.viewport(1366, 768).then(function () {
        this.thenOpen('http://127.0.0.1:8080/view.html?notebook=' + notebookid);
        this.wait(8000);        
    });
    
    casper.wait(5000).then(function(){
        this.waitForSelector(".r-result-div > pre:nth-child(1) > code:nth-child(1)", function (){
            this.test.assertExists('#edit-notebook > i:nth-child(1)', 'the element Edit icon exists. Hence page has got loaded properly'); 
       });
    });
    
    casper.wait(4000);
    
    casper.wait(4000).then(function(){
		 if(this.test.assertNotVisible(x(".//*[@id='part1.R']/div[1]/div/span[4]",'checking for the cell numbers')))
		{
			console.log('cell numbers are not visible');
		}else{
			console.log('cell numbers are visible');
		}
	});
    
    
    casper.wait(5000);
    
    casper.then(function(){
        this.click(x(" .//*[@id='edit-notebook']"));
        this.wait(5000);       
    });
    
    casper.wait(5000);
    
    casper.then(function (){
        this.click(x(".//*[@id='settings-body']/div[3]/label/input"));
        this.wait(4000);
    }); 
    
    casper.wait(5000);   
    
    casper.run(function () {
        test.done();
    });
});

    
    
    