/* 
 Author: Tejas Sakhardande    (tc_34.2.1)
 Description:    This is a casperjs automated test script for showing that when the "Notebook.R" is selected from the dropdown menu near the shareable link, 
				 if we click on the shareable link it will display the output of the FastRWeb code present in the notebook in new tab
*/

//Begin Tests

casper.test.begin("notebook.R test", 7, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid="c3d97ea6ef0200bd0cf3";// the notebook id for 'Notebook.R' notebook

    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
    });

    casper.wait(10000);

    //login to Github and RCloud
    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

	//validating for RCloud main page to be loaded 
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

    //opening 'Notebook.R' link   
    casper.then(function () {
        this.mouse.click("#view-mode");
        console.log("clicking on dropdown menu");
        this.test.assertExists({
            type: 'css',
            path: '#view-type > li:nth-child(2) > a:nth-child(1)'
        }, 'notebook.R found');
        this.wait(3000);
        this.mouse.click("#view-type > li:nth-child(2) > a:nth-child(1)");
        console.log("clicking on notebook.R");
        this.wait(3000)
    });

    // clicking on shareable link
    casper.then(function () {
        this.click({type: 'css', path: '.icon-share'}, 'Clicked on Shareable link');
        this.wait(10000);
    });
       
     //verifying 'Notebook.R' link opened in new window   
       casper.viewport(1366, 768).waitForPopup(/notebook.R/, function () {
           this.test.assertEquals(this.popups.length, 1,'new window opened as expected');
       });
	//verifying the 'Notebook.R' url and its content
	   casper.viewport(1024, 768).withPopup(/notebook.R/, function () {
		   this.wait(7000);
		   this.test.assertUrlMatch(/notebook.R/, 'Verified notebook.R URL');
		   this.then(function(){
				this.test.assertExists({type:'css',path:'body > form:nth-child(1)'},'Required element found hence "Notebook.R" opened successfully');
				this.wait(2000);
            });
       });
	
    casper.run(function () {
        test.done();
    });
});

