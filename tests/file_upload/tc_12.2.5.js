/*
 Author: Prateek
 Description: This is a casperjs automated test script for showing that,After a file is uploaded to a notebook, it will be present in the Assets div
 */

//Begin Tests
casper.test.begin("Can't upload file to Unforked Notebook", 5, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var new_username = 'att-Musigma';
    var new_user_password = 'musigma12';
    var notebook_id, URL, before_forking;
    var res1 = 'disabled';// to compare with res

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

    //Create a new Notebook.
    functions.create_notebook(casper);

    casper.then(function () {
        URL = this.getCurrentUrl();
    });

    // Getting the title of new Notebook
    casper.then(function () {
        before_forking = this.fetchText('#notebook-author');
        console.log("Notebook owner after forking = " + before_forking);
        initial_title = functions.notebookname(casper);
        this.echo("New Notebook title : " + initial_title);
    });

    //getting Notebook ID
    casper.viewport(1024, 768).then(function () {
        var temp1 = this.getCurrentUrl();
        notebookid = temp1.substring(41);
        this.echo("The Notebook Id: " + notebookid);
    });

    //logout of RCloud & Github
    casper.then(function () {
        this.click("#rcloud-navbar-menu > li:nth-child(7) > a:nth-child(1)");
        console.log('Logging out of RCloud');
        this.wait(3000);
    });

    casper.wait(5000).viewport(1366, 768).then(function () {
        this.click("#main-div > p:nth-child(2) > a:nth-child(2)", "Logged out of Github");
        console.log('Logging out of Github');
    });

    casper.wait(10000).viewport(1366, 768).then(function () {
        this.click(".btn");
        console.log('logged out of Github');
        this.wait(7000);
        this.echo("The url after logging out of Github : " + this.getCurrentUrl());
    });

    //Login to RCloud with new user
    casper.wait(4000).then(function () {
        this.thenOpen('http://127.0.0.1:8080/login.R');
        this.wait(13000);
        functions.login(casper, new_username, new_user_password, rcloud_url);
    });

    casper.then(function () {
        this.thenOpen(URL);
        this.wait(8000);
    });

    casper.wait(2000).then(function () {
        console.log('Checking whether user is able to upload files to notebook or not by fetching element info')
        var temp = this.getElementInfo('#upload-to-notebook').tag;
        var res = temp.substring(17, 25);
        this.echo(res);
        this.test.assertEquals(res1, res, "For unforked Notebooks file upload to notebook is disabled")
    })

    casper.run(function () {
        test.done();
    });
});