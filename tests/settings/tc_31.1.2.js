/*
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that,Under settings div, present in the left side panel, if the checkbox for 'Show 
 prompt cell' is selected, then prompt cell will be visible in all the notebooks
 *  for any cell of the notebook
 */

//Test begins
casper.test.begin(" Checking prompt window present or not when check box is selected", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var i;

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

    //Checking for command propmt cell
    casper.then(function () {
        if (this.test.assertExists(x(".//*[@id='command-prompt']/div[2]/div"), 'Command prompt is exists')) {
            console.log("Command propmt is visible");
        } else {
            console.log("command propmt is not visible so clicking on setting div");
        }
    });

    //Settings div is open or not
    casper.then(function () {
        if (this.visible('.form-control-ext')) {
            console.log('Settings div is already opened');
        }
        else {
            var z = casper.evaluate(function () {
                $(' .panel-heading').click();
            });
            this.echo("Opened Settings div");
        }
    });

    casper.wait(3000);

    casper.then(function () {
        this.click(x(".//*[@id='settings-body']/div[1]/label/input"));
        this.wait(3000);
        this.echo("Clicking on show command propmt checkbox to uncheck it");
    });

    casper.then(function () {
        this.test.assertNotVisible(x(".//*[@id='command-prompt']/div[2]/div"));
        console.log("{rompt isnot visible");
    });

    casper.then(function () {
        this.click(x(".//*[@id='settings-body']/div[1]/label/input"));
        this.echo("Clicking on show command propmt checkbox");
        this.wait(8000);
    });

    casper.then(function () {
        (this.test.assertExists('#command-prompt > div:nth-child(3) > div:nth-child(1)'), 'Command prompt is exists');
        this.echo('command propmt is visible');
    });

    casper.run(function () {
        test.done();
    });
});
  
    
    
    
    
    
