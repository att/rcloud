/* 
 Author: Prateek
 Description: This is a casperjs automated test script for showing that,From a notebook whether user is able to delete the R cell or cells from notebook
 */

//Begin Tests

casper.test.begin("Checkin whether user is able to delete the cells from a notebook", 7, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input1 = "a<-100+50\n a";
    var input2 = "b<-200+50\n b";

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

    //Create a new Notebook.
    functions.create_notebook(casper);

    //add a new cell and execute its contents
    functions.addnewcell(casper);
	
	casper.then(function () {
		functions.addcontentstocell(casper,input1);
		console.log('adding contents to first cell');
	});
	
	casper.then(function () {
		this.click(x(".//*[@id='prompt-area']/div[1]/div/span/i"));
		console.log("Adding one more cell");
	})
	
	casper.wait(4000).then(function () {
		this.sendKeys(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), input2);
		console.log('adding contents to second cell');
	});
	
	functions.runall(casper);
	
	casper.wait(5000);
	
	casper.then(function () {
		this.click(x(".//*[@id='selection-bar']/div/div/input"));
		this.click(x(".//*[@id='selection-bar-delete']"));
		console.log('deleted R cell');
	});
	
	casper.wait(5000);
	//Check for the deleted cell
	casper.then(function () {
		if(this.test.assertDoesntExist('.r.hljs'))
		{
			this.test.pass('cell is deleted');
		}else{
			this.test.fail('cell is still present');
		}
		console.log('deleted cell doesnt exists');
	});	
	
	casper.run(function () {
        test.done();
    });
});
	
		
		
		
