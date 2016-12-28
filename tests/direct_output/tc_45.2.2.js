/*
Author: Prateek
Description: This is a casperjs automated test script for,When a new cell is created  for pre executed cells, it should be in edit mode
*/


//Begin test
casper.test.begin("Created new cell should be in edit mode", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input = 'a<-1000;b<-2000;a+b';
    var input1 = '"KHILADI786"';
    
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
    functions.create_notebook(casper);
    
    functions.addnewcell(casper);
    
    functions.addcontentstocell(casper, input);
    
    //Creating a new cell
    casper.then(function(){
		var z = casper.evaluate(function () {
                $('.icon-plus-sign').click();
            });
        this.wait(5000);
        this.sendKeys({type:'xpath', path:"/html/body/div[3]/div/div[2]/div/div[1]/div/div[3]/div[1]/div[2]/div/div[2]/div"},input1);
        console.log('Without clicking on the cell, we can enter the code after creating new cell');
	});
	
	functions.runall(casper);
	
	//Verifying whether the 1st cell created and contains text or not
	casper.then(function(){
		this.test.assertExists({type:'xpath', path:".//*[@id='part1.R']/div[3]/div[1]/div[2]/div/div[2]/div"}, 'Newly created cell exists in editable mode');
	});
	
	functions.delete_notebooksIstarred(casper);
    
    casper.run(function () {
        test.done();
    });
});
