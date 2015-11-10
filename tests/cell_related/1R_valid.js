/* 
 Author: Prateek  (tc_29.1.1)
 Description:    This is a casperjs automated test script for showing that, Executing valid R code produces expected output or not
 */

//Begin Tests

casper.test.begin("Executing valid R code produces expected output or not ", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var input = "a<-50+50\n a";
    var output = '100';
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid;

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

    //Add new notebook
    casper.then(function () {
        functions.create_notebook(casper);
        this.wait(5000);
    });

    //Add new cell
    casper.then(function () {
        functions.addnewcell(casper);
    });

    //Adding contents to cell
    functions.addcontentstocell(casper, input);

    //fetch the output text and compare
    casper.then(function () {
        console.log('Testing if The R code has produced the expected output');
        var result = this.fetchText('.r-result-div>pre>code');//fetch the output after execution
        var res = result.substring(4,7);//remove the unwanted characters
        this.echo("The output of the R code is: " + res + " and the expected output is: " + output);
        this.test.assertEquals(res, output, 'Valid R code has produced expected output');
    });

    casper.run(function () {
        test.done();
    });
});
