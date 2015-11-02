/* 
 Author: Tejas Sakhardande   (tc_34.3.1)
 Description:    This is a casperjs automated test script for showing that When the "Shiny.html" is selected from the dropdown menu near the shareable link, 
				 if we click on the shareable link it will display the output of the Rshiny code present in the notebook in new tab

*/

//Begin Tests

casper.test.begin("shiny.html test", 7, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid ="4b5b782bb0e6cfcca5a6";//to get the notebook id

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

	//Loading Notebook having FastRWeb code 
	casper.viewport(1366, 768).thenOpen('http://127.0.0.1:8080/edit.html?notebook=' + notebookid, function (){
	   this.wait(5000);
       this.waitForSelector({type: 'css', path: '#share-link .icon-share'}, function () {
            console.log("Verified that page is loaded successfully");
        }); 
	});

    casper.then(function () {
        casper.evaluate(function () {
            this.click({
                type: 'css',
                path: 'html body div.navbar.navbar-inverse.navbar-fixed-top div div.nav-collapse ul#rcloud-navbar-main.nav.navbar-nav li span span.dropdown a#view-mode.dropdown-toggle b.caret'
            });
            console.log("clicking on dropdown menu");
            this.wait(3000);
        });
    });
       
    casper.then(function(){    
	   this.test.assertExists('#view-type > li:nth-child(4) > a:nth-child(1)','shiny.html found');
       this.wait(3000);
    });

    casper.then(function(){   
       this.click('#view-type > li:nth-child(4) > a:nth-child(1)',"clicking on shiny.html");
       this.wait(3000);
	});
    
    //Clicking shareable link
    casper.then(function(){
       this.click({type: 'css', path: '.icon-share'},'Clicked on Shareable link');   
       this.wait(10000);                  
    });
     
     //verifying 'Shiny.html' link opened in new window   
    casper.viewport(1366, 768).waitForPopup(/shiny.html/, function () {
        this.test.assertEquals(this.popups.length, 1, 'new window opened as expected');
    });
    // verifying the url and content for shiny.html
    casper.viewport(1024, 768).withPopup(/shiny.html/, function () {
        this.options.viewportSize = {width: 1600, height: 950};
        this.wait(7000);
        this.test.assertUrlMatch(/shiny.html/, 'shiny.html link is opened');
        // verifying the contents of shiny.html
        this.then(function () {
            this.test.assertExists('.well', 'Required Element found hence "Shiny.html" loaded  successfully');
            this.wait(2000);
        });
    });

    casper.run(function () {
        test.done();
    });
});

