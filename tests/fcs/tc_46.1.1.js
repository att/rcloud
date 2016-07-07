/*
 Author: Prateek
 Description:  This is a casperjs automated test script for showing that, Session div should
 not throw any error on forking one's own notebook
 */

//Test begins
casper.test.begin(" Forking one's own notebook", 8, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input = "'123456'";

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
    });

    //Create a new notebook
    functions.create_notebook(casper);

    // Create new cell
    functions.addnewcell(casper);

    //add contents to cell
    functions.addcontentstocell(casper, input);

    //forking the notebook
    functions.fork(casper);

    casper.wait(5000);
    casper.echo("Forked current notebook");

    //After forking checking whether session div has produced error or not
    casper.then(function () {
        this.test.assertNotVisible({
            type: 'xpath',
            path: ".//*[@id='session-info']/div"
        }, "Session div didn't produced any Error message while forking own notebook");
    });

    casper.run(function () {
        test.done();
    });
});	
