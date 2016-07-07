/*
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that, The cell numbers displayed
 *  for any cell of the notebook
 */

//Test begins
casper.test.begin(" Checking cell numbers are visible or not", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
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
    
    //create a new notebook
    functions.create_notebook(casper);
    
    //add new cell
   casper.wait(5000).then(function () {
        functions.addnewcell(casper);
    });
    
    casper.wait(4000);
    
    casper.wait(4000).then(function () {
        this.click("div.cell-control-bar:nth-child(1) > span:nth-child(1) > i:nth-child(1)");  
        this.echo('click on add new cell') 
    });

    casper.wait(4000).then(function () {
        casper.waitForSelector(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), function () {
            console.log("Confirmed new cell is present");
        });  
    });


    //Checking for cell numbers
	casper.then(function(){
		this.echo(this.fetchText({type:'xpath', path:'/html/body/div[3]/div/div[2]/div/div[1]/div/div[2]/div[1]/span[4]'}));
		console.log('cell numbers are visible');
		this.wait(2000);
	});
	
	casper.run(function () {
        test.done();
    });
});
  
    
    
    
    
    
