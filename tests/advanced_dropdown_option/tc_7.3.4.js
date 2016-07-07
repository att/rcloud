/* 
 Author: Prateek
 Description:This is a casperjs automated test script for showing that,If the user wants to cancel the process, the dialog box opened as a 
 * result of clicking on the option "Import External Notebooks" can be closed by clicking the "Cancel" button present on the bottom-right of the
 * dialog box
 */

//Begin Tests
casper.test.begin('Click on the "Cancel" button ', 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var Notebook_ID = '9ae0235877d1152511df'; // Importing Notebook ID
    var Notebook_Name = 'Reading xls file'; //Importing notebook's name

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

    //open the Advanced Dropdown 
    functions.open_advanceddiv(casper);

    casper.then(function () {
        this.evaluate(function () {
            $('#import_notebooks').click();
        });
        this.echo('opened import notebook dialog box');
        this.wait(2000);
        casper.evaluate(function () {
            $('#import-gists').val('da899914cf939f6dbcde');
        });
        this.echo('Entering notebook ID');
        this.wait(2000);
        this.evaluate(function () {
            $('#import-prefix').val('Cancelling dialog box/');
        });
        this.echo('Entering Prefix name');
        this.evaluate(function () {
            $('.btn.btn-cancel').click();
        });
        console.log("Clicking on cancel button");
        this.wait(2000);
        this.test.assertNotVisible(".modal-header", "Dialog box disappers, after clicking on 'Cancel' button");
    });

    casper.run(function () {
        test.done();
    });
});

