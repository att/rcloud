/*
 Author: Prateek
 Description: This is a casperjs automated test script for showing that, Upload and execute assets belonging to different languages(.R, .md,.py)
 */

//Begin Test
casper.test.begin("Executing asset content", 3, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid = '5a3ce7c3cd0a7a5877b8';

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

    //Loading a notebook which has asset with python code in it
    casper.then(function () {
        this.thenOpen('http://127.0.0.1:8080/edit.html?notebook=' + notebookid);
        this.wait(5000);
    });

    casper.wait(3000).then(function () {
        this.exists(x(".//*[@id='asset-list']/li[3]/a"), 'ExecutingFromAsset.py asset exists');
        functions.runall(casper);
    });

    casper.wait(3000).then(function () {
        var output = this.fetchText(x(".//*[@id='part1.R']/div[3]/div[2]"));
        this.echo("Asset execution has produced this output:" + output);
    });

    casper.run(function () {
        test.done();
    });
});

