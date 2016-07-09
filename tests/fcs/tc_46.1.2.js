/*
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that, The name of the forked notebook should be post fixed by
 *  a number in serial order
 */

//Test begins
casper.test.begin(" Name of Forked notebooks", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var temp ;
    var temp1 ;
    
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

    casper.then(function(){
        temp  = functions.notebookname(casper);
        console.log('Getting notebook name');
    });
    casper.wait(2000);

    functions.fork(casper);

    casper.wait(2000);

    casper.then(function(){
        temp1 = functions.notebookname(casper);
        console.log('Getting notebook name after forking the current notebook');
    });

    casper.then(function(){
        if (temp == temp1){
            this.testfail('The name of the forked notebook is not fixed by a number in serial order');
        }else{
            this.test.pass('The name of the forked notebook is fixed by a number in serial order');
        }
    });

    casper.run(function () {
        test.done();
    });
});






