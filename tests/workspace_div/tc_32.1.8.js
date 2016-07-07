/*
Auther : Tejas
Description:    This is a casperjs automated test script for showing that workspace div will display all the variable that are initialised in code
*/


casper.test.begin("Display all variables in workspace div", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid;//to get the notebook id
	var input_content="a<-12\nb<-12\nd<-20\ne<-20\nf<-10\ng<-25\nj<-30"; // variable initialisation
    
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
        if (this.visible('#enviewer-body > table:nth-child(1) > tr:nth-child(1) > th:nth-child(1)')) {
            console.log("Workspace div is open");
        } else {
			console.log('Workspace div is closed hence opening it');
            casper.evaluate(function () {
                $('#accordion-right .icon-sun').click();
            });
        }
        this.wait(5000);
    });
    
    casper.then(function () {
        this.wait(5000);
		this.test.assertVisible({ type:'css',path:'#enviewer-scroller'},'scroll bar exists');
	});
	
	casper.run(function () {
        test.done();
    });
});
