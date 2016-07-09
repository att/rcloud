/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that If the loaded notebook is not added in the 'Notebooks I Starred' list,
 then the star present on the top-left corner of the page is unselected and count=0
 */

//Begin Tests

casper.test.begin("If the loaded notebook is not added in the 'Notebooks I Starred' list,then the star present on the top-left corner of the page is unselected and count=0", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var title;

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

    //unstarring the notebook
    casper.then(function () {
        var z = casper.evaluate(function () {
            $('#star-notebook .icon-star').click();

        });
        this.wait(3000);
        this.echo('Notebook is unstarred now');
    });

    functions.notebooksIstarred(casper);
    var starcount;
    //checking if notebook is starred
    casper.viewport(1024, 768).then(function () {
		this.wait(3000);
        starcount = this.fetchText({type: 'css', path: '#curr-star-count'});
        this.test.assertEquals(starcount, "0", "The star present on the top left corner is unselected ");
    });


    casper.run(function () {
        test.done();
    });
});
