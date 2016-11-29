/*
Author: Prateek
Description:This is a casperjs automated test script for showing that,While executing various commands in a notebook and 
trying out the various features present in the Rcloud main page, if some error occurs in a particular session, then it is 
displayed in the Sessions div.Here, one example test case is shown(using invalid notebook id for loading)
*/

//Begin Test
casper.test.begin(" Verifying for Session div error", 4, function suite(test) {
	var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var URL = "http://127.0.0.1:8080/edit.html?notebook=b0a1705c0caf7cfc57b";
    var Error = 'Error: rcloud.load.notebook b0a1705c0caf7cfc57b: Not Found (404)'// error message after loading notebook with invalid Notebook ID
    
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

    //Opening a an inavlid notebook, so that it throws an error in session div
    casper.then(function (){
        console.log("now opening a notebook with invalid Notebook ID");
        this.thenOpen(URL);
        this.wait(8000);
    });

    casper.then(function (){
        this.click(x(".//*[@id='fatal-dialog']/div/div/div/div/span"));
        console.log("clicking on ignore button");
    });

    casper.then(function (){
        this.test.assertSelectorHasText(x(".//*[@id='session-info']/div/div[1]"), "Error: rcloud.load.notebook", "Session div has produced expected error message");
    });

    casper.run(function () {
        test.done();
    });
});