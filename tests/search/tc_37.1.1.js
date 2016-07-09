/*
Auther : Sanket
Description:    This is a casperjs automated test script for showing that search div will display the search result with pagination
*/


casper.test.begin("Display of pagination in search div", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    //var item="Arko2013"; // keyword to be searched
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
   /* // creating 14 notebooks
    casper.viewport(1024, 768).then(function(){
        for ( var  i= 0; i<= 14 ; i++) {
		    this.wait(8000);
	    functions.create_notebook(casper);
		    this.wait(8000);
		    functions.runall(casper);
	    } //for loop closes
    });
    */
    //searching for the keyword
    casper.then(function(){
		if (this.visible('#search-form')) {
                console.log('Search div is already opened');
            }
            else {
                            
         casper.evaluate(function () {
            $('.icon-search').click();
          });
         this.echo("Opened Search div");
		}
            //entering item to be searched
         casper.then(function () {
             this.sendKeys('#input-text-search', github_username);
             this.wait(6000);
             casper.evaluate(function () {
                    $('.icon-search').click();
                });
            });
		});
		
	
	casper.then(function(){
		this.wait(3000);
		this.test.assertVisible({ type:'css', path: ' .pagination'}, 'pagination exists');
	});
	
	casper.run(function () {
        test.done();
    });
});
