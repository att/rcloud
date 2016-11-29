/*

 Author: Prateek
 Description:This is a casperjs automation script for checking that after typing some code in the Prompt Cell of the loaded notebook.
 The content in the prompt stay as it is on reload.
 */
casper.test.begin("Write some code in the Prompt Cell", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions.js'));
    var source_code = "56+98";

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

    //Create a new Notebook.
    functions.create_notebook(casper);

    //Writing some code in command prompt

    casper.viewport(1366, 768).then(function () {
        this.sendKeys('#command-prompt', source_code);
        this.wait(7000);
        console.log('Code written in command prompt');
    });

    //Reloading the page

    casper.viewport(1366, 768).then(function () {
        this.reload(function () {
            this.echo("Main Page loaded again");
            this.wait(15000);
        });
    });
    
    casper.wait(10000);
    
    casper.then(function(){
        this.test.assertSelectorHasText(x(".//*[@id='command-prompt']/div[2]/div"), source_code, 'Confirmed that the content remains in the prompt cell after reload');
    });

    casper.run(function () {
        test.done();
    });
});
