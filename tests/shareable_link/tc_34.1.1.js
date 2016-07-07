/* 
 Author: Tejas Sakhardande
 Description:    This is a casperjs automated test script for showing that by clicking on the dropdown button user can select
 the mode of shareable link

*/

//Begin Tests

casper.test.begin("Dropdown button", 7, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid;//to get the notebook id

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

    //getting Notebook ID
    casper.viewport(1024, 768).then(function () {
        var temp1 = this.getCurrentUrl();
        notebookid = temp1.substring(41);
        this.echo("The Notebook Id: " + notebookid);
    });

 

    casper.viewport(1366, 768).then(function () {
       this.wait(5000);
       this.waitForSelector({type: 'css', path: '#share-link .icon-share'}, function () {
            console.log("Shareable link found.");
        }); 
	});   
       
    casper.then(function(){   
       this.mouse.click("#view-mode");
            console.log("clicking on dropdown menu");
           
       this.test.assertExists({type: 'css',path: '#view-type > li:nth-child(1) > a:nth-child(1)'},'view.html found');
       this.wait(3000);

       this.test.assertExists({type: 'css',path: '#view-type > li:nth-child(2) > a:nth-child(1)'},'notebook.R found');
       this.wait(3000);
       
       this.test.assertExists({type: 'css',path: '#view-type > li:nth-child(3) > a:nth-child(1)'},'mini.html found');
       this.wait(3000);
       
       this.test.assertExists({type: 'css',path: '#view-type > li:nth-child(4) > a:nth-child(1)'},'shiny.html found');
       this.wait(3000);
       
       });

    casper.run(function () {
        test.done();
    });
});

