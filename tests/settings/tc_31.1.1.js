/*
 Author: Tejas
 Description:    This is a casperjs automated test script for showning that,Under settings div, present in the left side panel, if the checkbox for 'Show
 prompt cell' is selected, then prompt cell will be visible in all the notebooks
 *  for any cell of the notebook
 */

//Test begins
casper.test.begin(" Checking prompt window present or not when check box is selected", 3, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));

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

    casper.wait(30000);

    //Checking for command propmt cell
    casper.then(function () {
        //this.wait(5000);
        if (this.exists(x(".//*[@id='command-prompt']/div[2]/div"))) {
            console.log("Command propmt is visible");
        } else {

            //Settings div is open or not
            if (this.visible('.form-control-ext')) {
                console.log('Settings div is already opened');
            }
            else {
                var z = casper.evaluate(function () {
                    $(' .panel-heading').click();
                });
                this.echo("Opened Settings div");
            }

            this.click(x(".//*[@id='settings-body']/div[1]/label/input"));
            this.wait(3000);
            this.echo("Clicking on show command propmt checkbox to uncheck it");
            this.wait(8000);

            //Checking for command prmpt
            if (this.exists(x(".//*[@id='command-prompt']/div[2]/div"))) {
                console.log("Command propmt is  visible");
            } else {
                console.log('command propmt is not visible after clicking on check box');
            }
            //Clicking again on check box to ensure that, when next time the test runs it wont fail
            this.click(x(".//*[@id='settings-body']/div[1]/label/input"));
        }
    });

    casper.run(function () {
        test.done();
    });
});





