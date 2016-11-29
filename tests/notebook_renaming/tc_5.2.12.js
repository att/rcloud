/*

 Author: Arko
 Description:The name of the Notebook owner should be present infront of the Notebook title in the format <Notebook owner>-[Notebook title]

 */

//Begin Test

casper.test.begin("User name present infront of Notebook title", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var title;

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
        this.wait(4000);
    });

    //Create a new Notebook and getting its title
    functions.create_notebook(casper);

    // Getting the title of new Notebook
    casper.then(function () {
        title = functions.notebookname(casper);
        this.echo("Notebook title : " + title);
        this.wait(2000);
    });

    //confirm that Notebook owner present with Notebook title
    casper.viewport(1024, 768).then(function () {
        var owner = this.fetchText({type: 'css', path: '#notebook-author'});
        this.echo("Notebook owner: " + owner);
        this.test.assertEquals(github_username, owner, "Verified that name of Notebook owner is present infront of the Notebook title");
    });


    casper.run(function () {
        test.done();
    });
});
