/*
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that, Locator feature will work with context output in mini.html 
 */

//Test begins


casper.test.begin("Locator feature will work with context output in mini.html", 6, function suite(test) {

    var x = require('casper').selectXPath;//required if we detect an element using xpath
    var github_username = casper.cli.options.username;//user input github username
    var github_password = casper.cli.options.password;//user input github password
    var rcloud_url = casper.cli.options.url;//user input RCloud login url
    var functions = require(fs.absolute('basicfunctions.js'));//invoke the common functions present in basicfunctions.js
    var notebook_id = 'cac28baf9e6ac1be9fab';
    var NB_ID, URL;

    casper.userAgent("Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.131 Safari/537.36");

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);//inject jquery codes
    });

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.then(function () {
        //this.capture("edit_html.png")
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(4000);
    });

    //Loading a notebook which consists Context output code
    casper.then(function () {
        this.thenOpen("http://127.0.0.1:8080/edit.html?notebook=" + notebook_id);
        this.wait(5000);
        console.log("Opening Context output notebook");
    });

    functions.fork(casper);

    casper.wait(4000).then(function () {
        URL = this.getCurrentUrl();
        NB_ID = URL.substring(41);
        console.log("After forking the Notebook ID is :" + NB_ID);
        this.thenOpen(URL);
    });

    

    casper.wait(5000).then(function () {
        console.log("Opening notebook in Mini.html found. Clicking on it");
        this.thenOpen("http://127.0.0.1:8080/mini.html?notebook=" + NB_ID);
        var t = this.getTitle();
        this.echo("Shared page title is :" + t);
    });

    //check for locator feature by checking the crosshair cursor
    casper.wait(6000).then(function() {
        var str = this.getElementsAttribute('.live-plot-container', 'style'); 
        this.test.assertEquals(str,['cursor: crosshair;'], 'Locator function got invoked successfully')
    });

    casper.run(function () {
        test.done();
    });
});


