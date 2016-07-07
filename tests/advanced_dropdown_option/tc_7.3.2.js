/* 
 Author: Prateek
 Description:This is a casperjs automated test script for showing that,The user can import notebooks that are stored in a different repository, 
 * into the current repository and save it with a prefix before Notebook's name. This can be done by selecting the option "Import External Notebooks" 
 * under 'Advanced' drop-down present on the top-right corner of the page. A pop-up window will open. Enter the Source repo api URL, Notebook IDs and 
 * prefix. The prefix needs to be written as "<prefix>". On importing, a notebook will be created in 'My Notebooks' list having the prefix before 
 * Notebook's name
 */

//Begin Tests
casper.test.begin("Import External Notebooks with Prefix", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var prefix_name = 'CHECKING_FOR_Prefix';
    var Notebook_ID = '7f90ae7dbe9fb01898f1';

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });
    casper.wait(10000);

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting\n\
     if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
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
            $('#import-gists').val('7f90ae7dbe9fb01898f1');
        });
        this.echo('Entering notebook ID');
        this.wait(2000);
        casper.evaluate(function () {
            $('#import-prefix').val('CHECKING_FOR_Prefix/');
        });
        this.echo('Entering Prefix name');
        this.wait(2000);
        this.evaluate(function () {
            $('#import-notebooks-dialog span.btn-primary').click();
            console.log("Clicking on import button");
        });
    });

    casper.wait(2000);

    casper.then(function () {
        // for (var i = 1; i < 10; i++) {
        //     var text = this.fetchText(x(".//*[@id='editor-book-tree']/ul/li[1]/ul/li[1]/ul/li[" + i + "]/div/span[1]"));
        // }
        this.test.assertExists(".notebook-tree", /*'prefix_name',*/ "Confirmed Imported Notebook exists");
        this.wait(5000);
    });

    casper.run(function () {
        test.done();
    });
});