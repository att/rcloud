/* 
 Author: Tejas Sakhardande
 Description:    This is a casperjs automated test script for showing that Under the workspace div, present in the right-side panel,
 if a data frame is created, then it is shown in the data section in the workspace div

*/

//Begin Tests

casper.test.begin("Dataframe link is present in the workspace div", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_content_1= "x = c(2, 3, 5);n = c('aa', 'bb', 'cc');b = c(TRUE, FALSE, TRUE);df = data.frame(x, n, b);print(df)"; // code
       
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
    
    casper.then(function(){
		functions.create_notebook(casper); 
		this.wait(10000);		
    });
    
    //Writing dataframe code in new cell
    casper.then(function(){
		this.wait(15000);
		console.log("adding new cell");
		functions.addnewcell(casper);
	});
	
	casper.then(function(){
		console.log("initialising the variable and executing the cell");
		functions.addcontentstocell(casper, input_content_1);
    });
	
	casper.then(function(){
		casper.evaluate(function () {
                $('#accordion-right .icon-sun').click();
         });	
        this.wait(10000);
        this.test.assertExists({ type: 'css', path: '#enviewer-body>table>tr>td>a'},"Dataframe is created and displayed in the workspace div");
    });
    
    casper.run(function () {
        test.done();
    });
});
