/*
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that, 
 * Normal R Code output will be visible in mini.html page when used with context output similar to edit.html page
 */
//Test begins
casper.test.begin("Normal R Code output will be visible in mini.html page when used with context output similar to edit.html page", 6, function suite(test) {

    var x = require('casper').selectXPath;//required if we detect an element using xpath
    var github_username = casper.cli.options.username;//user input github username
    var github_password = casper.cli.options.password;//user input github password
    var rcloud_url = casper.cli.options.url;//user input RCloud login url
    var functions = require(fs.absolute('basicfunctions.js'));//invoke the common functions present in basicfunctions.js
    var notebook_id = 'd9bd0b77d2cb4834c8f5';
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

    casper.then(function () {
        this.thenOpen("http://127.0.0.1:8080/edit.html?notebook="+notebook_id);
        this.wait(8000);
        console.log("Opening Context output notebook");
    });

    functions.fork(casper);

    casper.wait(4000).then(function (){
        URL = this.getCurrentUrl();
        NB_ID = URL.substring(41);
        console.log("Forked Notebook ID is :" + NB_ID);
        this.thenOpen(URL);
    });

    casper.viewport(1366, 768).then(function () {
        console.log("Opening notebook in Mini.html found. Clicking on it");
        this.thenOpen("http://127.0.0.1:8080/mini.html?notebook="+NB_ID);
        this.wait(10000);
        var t = this.getTitle();
        this.echo("Shared page title is :" + t);        
    });

    casper.wait(3000).then(function (){
        this.wait(5000);
        var y = this.fetchText('#test > pre:nth-child(3) > code:nth-child(1)');
        var u = y.substring(4);
        this.echo("Inside context output the R code is : " + u);
        // this.test.assertMatch(u,/Normal R code output in Mini --->/, "R code has produced output in Mini.html" );
        this.test.assertSelectorHasText("#test > pre:nth-child(3) > code:nth-child(1)", "Normal R code", "R code has produced output in Mini.html");
        this.echo("The output is :" + u);
    });

     casper.run(function () {
        test.done();
    });
});


