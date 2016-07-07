/*
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that,When a new cell is created from the prompt cell, 
 * it should be in executed mode
 */

//Test begins
casper.test.begin(" Creating cell from the command propmt", 4, function suite(test) {

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
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
    });

    //Create a new notebook
    functions.create_notebook(casper);

    //Add contents to prompt cell
    casper.then(function() {
		this.sendKeys("#command-prompt", "casperjs", { keepFocus: true });
		this.page.sendEvent("keypress", this.page.event.key.Enter);
		this.click({type:'xpath', path: ".//*[@id='prompt-area']/div[1]/div/span/i"});
    });

    casper.wait(5000);

    casper.then(function () {
		this.test.assertExists({type: 'css', path: "span.left-indicator:nth-child(4)"}, "New cell has been created");
    });

    functions.delete_notebooksIstarred(casper);

    casper.run(function () {
        test.done();
    });
});
    
