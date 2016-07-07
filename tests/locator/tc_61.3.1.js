/*
 Author: Sanket (tc_61.3.1.js)
 Description: This is casperJS automated test to check whether locator() returns requested coordinates
 */

//Begin

casper.test.begin("Return fewer requested points", 6, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code = "plot(1:10) \n locator(1)";
    

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

    //add a new cell and execute its contents
    casper.wait(2000).then(function(){
        functions.addnewcell(casper);
    });

    casper.wait(2000).then(function(){
        functions.addcontentstocell(casper,input_code);
    });

    //click on the plot
    casper.wait(2000).then(function(){
        this.mouse.click({ 
            type:'css',
            path:'.live-plot'
        })
        this.wait(3000)
    });

    casper.then(function(){
        this.test.assertVisible({
            type:'xpath',
            path:".//*[@id='part1.R']/div[3]/div[2]/pre/code" 
        },'Requested number of cordinates returned through locator() feature');
        this.wait(3000)
    });

    //Delete the cell created for this test case
    casper.then(function(){
        this.mouse.move('.jqtree-selected > div:nth-child(1) > span:nth-child(1)');
        this.wait(2000)
        this.click('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(5) > i:nth-child(1)')
    });


    casper.run(function () {
        test.done();
    });
});
    


