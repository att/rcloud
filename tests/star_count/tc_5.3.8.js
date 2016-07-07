/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showiing that if the loaded notebook is not added in the 'Notebooks I Starred' list,
 then selecting the star present on the top-left corner of the page adds it to the 'Notebooks I Starred' list with count=1


 */

//Begin Tests

casper.test.begin("If the loaded notebook is not added in the 'Notebooks I Starred' list, then selecting the star present on the top-left corner of the page adds it to the 'Notebooks I Starred' list with count=1", 5, function suite(test) {

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

    // Getting the title of new Notebook
    casper.then(function () {
        title = functions.notebookname(casper);
        this.echo("Notebook title : " + title);
        this.wait(2000);

    });

    //checking if notebook is starred and hence unstarring it. Then we check if its present in Notebooks I Starred list
    functions.checkstarred(casper);
    casper.then(function () {
        var z = casper.evaluate(function () {
            $('#star-notebook .icon-star').click();

        });
        this.wait(3000);
        this.echo('Notebook is unstarred now');
    });
    functions.notebooksIstarred(casper);

    /*Now we have the situation where there is an unstarred notebook,absent from Notebooks I Starred div.
     We will now check if after starring , the notebook is visible in Notebooks I Starred div */
    casper.then(function () {
        this.click({type: 'css', path: '#star-notebook > i:nth-child(1)'});
        this.wait(3000);
    });
    functions.checkstarred(casper);
    functions.notebooksIstarred(casper);

    casper.then(function () {
        this.echo('Confirmed that notebook ' + title + ' is present in Notebooks I starred div after it is starred');
    });


    casper.run(function () {
        test.done();
    });
});
