/*
 Author: Sanket (tc_61.1.4.js)
 Description: This is casperJS automated test to check whether locator() gets invoked with R cell having plot
 */

//Begin

casper.test.begin("Invoke locator function with plot", 6, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code = "plot(1:10) \n locator(2)";
    

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

    //check for locator feature by checking the crosshair cursor
    casper.wait(1000).then(function() {
        var str = this.getElementsAttribute('.live-plot-container', 'style'); 
        this.test.assertEquals(str,['cursor: crosshair;'], 'Locator function got invoked successfully')
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
    


