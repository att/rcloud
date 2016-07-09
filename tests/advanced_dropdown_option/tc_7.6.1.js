/*

 Author: Arko
 Description:This is a casperjs automation script to show that the checkbox for "show source" is selected for showing the source
 *  code when a notebook is executed
 */
casper.test.begin("Show source Checkbox selected", 5, function suite(test) {

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

    //Create a new Notebook.
    functions.create_notebook(casper);

    //Get notebook title
    casper.then(function () {
        var title = functions.notebookname(casper);
        this.echo("New Notebook title : " + title);
        this.wait(3000);
    });

    //Now clicking on the advanced div
    functions.open_advanceddiv(casper);

    //Now checking whether show source is selected or not
    casper.viewport(1366, 768).then(function () {
        this.test.assertVisible({type: 'css', path: "#publish_notebook"}, "Show Source checkbox is selected");
        this.test.assertNotVisible({type: 'css', path: "#show-source .icon-check-empty"}, "Confirmed that the check box for Show Source is not unchecked");
    });


    casper.run(function () {
        test.done();
    });
});
