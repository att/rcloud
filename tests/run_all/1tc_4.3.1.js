/*

 Author: Arko
 Description:This is a casperjs automation script for notebook containing only one R cell with some code which is already executed.
 Run all button is then clicked and checked wheather the given R cell is executed or no.

 */
casper.test.begin("Execute R cell (pre executed) using Run All", 7, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code = "a<-50+50 \n a" ;
    var expected_result = "100\n"


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

    //Added a new R cell and execute contents
    casper.wait(2000).then(function () {
        functions.addnewcell(casper);
    });

    casper.wait(2000).then(function () {
        functions.addcontentstocell(casper,input_code)
    });

    //Now we have a R cell with some code pre-executed . Will execute it using Run All
    functions.runall(casper);
    casper.then(function () {
        this.test.assertVisible({type:'xpath', path:".//*[@id='part1.R']/div[3]/div[2]"}, "Output div is visible which means that cell execution has occured successfully");
		var result = this.fetchText({type: 'xpath', path: ".//*[@id='part1.R']/div[3]/div[2]/pre/code"});//fetch the output after execution
        var res = result.substring(4,8);//remove the unwanted characters
        this.echo("The output of the R code is: " + res);
        this.test.assertEquals(res, expected_result, "The R code has produced the expected output using Run All");  
    });

    casper.run(function () {
        test.done();
    });
});
