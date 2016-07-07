/* 
 Author: Arko
 Description:    This is a casperjs automated test script To write a comment for the currently loaded notebook in the comment div provided in the
 right-side of the page
 */

//Begin Tests

casper.test.begin("Comment for a notebook", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var title;//store notebook title
    var comment = "AGENT_COULSON";//the comment to be entered
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
        title = functions.notebookname(casper);
        this.echo("New Notebook title : " + title);
        this.wait(3000);
    });

    //enter the comment
    functions.comments(casper, comment);
    
    //delete the comment
    casper.then(function () {
        this.click({type: 'css', path: 'i.icon-remove:nth-child(2)'});
        this.wait(4000);
    });

    functions.delete_notebooksIstarred(casper);
    
    casper.run(function () {
        test.done();
    });
});
