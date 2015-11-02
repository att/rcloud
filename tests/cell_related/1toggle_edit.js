/*
 Auther : Tejas  (tc_9.3.1)
 Description:This is a casperjs automated test script for showing thatwith the help of toggle edit button, user can edit/modify the contents
 */


casper.test.begin('Clicking on toggle edit button', 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid;//to get the notebook id
    var input_content="'HELLO..!'"; // variable initialisation
    var input_content1='"Welcome to RCloud"';
    var before;
    var after;
    
    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
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

    casper.then(function(){
        functions.create_notebook(casper);
        this.wait(5000);
    });

    // Initialising the variable
    casper.then(function(){
        console.log("adding new cell");
        functions.addnewcell(casper);
        this.wait(10000);
        console.log("initialising the variable and executing the cell");
        functions.addcontentstocell(casper, input_content);
        this.wait(5000);
    });
    
    casper.then(function () {
		before = this.fetchText('.r');
		console.log('After executing the cell, the output is:' + before);
	});
    
    casper.then(function(){
        casper.evaluate(function () {
			$('.icon-edit').click();
        });
        this.echo('Clicking on toggle edit button');
        this.wait(3000);
        this.sendKeys({type:'xpath', path:"/html/body/div[3]/div/div[2]/div/div[1]/div/div[3]/div[1]/div[2]/div/div[2]/div"}, input_content1);
        this.click('#save-notebook');//saving the contents
	});
	
	casper.then(function () {
		after = this.fetchText('.r');
		this.wait(2000);
		console.log('After modifying the cell with the help of toggle edit button and  executing the cell, the output is:' + after);
	});
	
	casper.then(function() {
		this.test.assertNotEquals(before,after , 'Input contents are added after clicking on toggle edit button');
	});
    
    casper.run(function () {
        test.done();
    });
});
