/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that on going to the Shareable Link
 "http://127.0.0.1:8080/view.html?notebook=<notebook id>" using an alien user's notebook id, view.html page 
 should open .The page will contain the output div(s) and it will not be editable

 */

//Begin Tests

casper.test.begin("Open an alien user's notebook through his/her's Notebook id in the link", 7, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var functions = require(fs.absolute('basicfunctions'));
    var rcloud_url = casper.cli.options.url;
    var notebook_id = "82198d654e36c7e86761";//contains the notebook id to be searched


    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
    });

    casper.wait(10000);

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(4000);

    });

    //opening alien user's notebook
    casper.viewport(1366, 768).thenOpen('http://127.0.0.1:8080/view.html?notebook=' + notebook_id, function () {
        this.wait(7000);
        this.echo("The shareable link for alien user : " + this.getCurrentUrl());
    });

    casper.viewport(1366, 768).then(function () {
        this.test.assertUrlMatch(/view.html/, 'view.html page for given user loaded');
        this.wait(7000);
    });

    //verify that only output div is visible and editable icon exists which proves that the notebook is currently not in Editable form
    casper.viewport(1366, 768).then(function () {
        this.test.assertVisible({
            type: 'css',
            path: '#edit-notebook > i:nth-child(1)'
        }, 'Edit option visible which proves that notebook currently is uneditable');
        this.test.assertVisible({
            type: 'xpath',
            path: '/html/body/div[3]/div/div/div/div[1]/div/div[2]/div[2]/pre/code'
        }, 'output div visible');
        this.test.assertNotVisible({
            type: 'css',
            path: 'div:nth-child(3) > div:nth-child(2) > pre:nth-child(1) > code:nth-child(1)'
        }, 'source code not visible');
    });

    casper.run(function () {
        test.done();
    });
});

