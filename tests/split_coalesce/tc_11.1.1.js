/* 
 Author: Prateek
 Description:    This is a casperjs automated test script for showing that 
 for an empty cell(R/Markdown), the Split Cell option should be disabled
 */

//Begin Tests

casper.test.begin("Split icon for an empty cell", 5, function suite(test) {

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
        // this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);

    });
    //Add new notebook
    casper.then(function(){
		functions.create_notebook(casper); 
		this.wait(5000);
		
    });
    //Add new cell
    casper.then(function () {
        functions.addnewcell(casper);
    });
    //clicking split icon
    casper.viewport(1024, 768).then(function () {
		var z = casper.evaluate(function () {
            $('#part1\.R > div:nth-child(2) > div:nth-child(2) > span:nth-child(6) > i:nth-child(1)').click();

        });
        this.wait(5000);
        
    });
    
    casper.viewport(1024, 768).then(function(){	
		this.wait(3000);
		casper.test.assertDoesntExist({ type :  'xpath' , path : '/html/body/div[3]/div/div[2]/div/div[1]/div[2]/div[1]/div[1]/table/td[5]/span/i'}, "Split Cell option is disabled");
	});
    
    casper.run(function () {
        test.done();
    });
});

