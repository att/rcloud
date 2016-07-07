/* 
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that For the "Search" option, the text entered in the text box for
 'full-text search' will consist of Lowercase Letters like rnorm, print, function etc. only
 */

//Begin Tests

casper.test.begin(" Lowercase letters for Example: rnorm, function, print", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var item = '"functiontobesearched"';//item to be searched
    var title;//get notebook title

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

    // Getting the title of new Notebook
    casper.then(function () {
        title = functions.notebookname(casper);
        this.echo("Notebook title : " + title);
        this.wait(2000);
    });

    //Added a new cell and execute the contents
    functions.addnewcell(casper);

    //Add contents to this cell and then execute it using run option
    casper.viewport(1366, 768).then(function () {
        functions.addcontentstocell(casper, item);
    });

    casper.then(function () {
        if (this.visible({type: 'xpath', path: ".//*[@id='input-text-search']"})) {
            console.log('Search div is already opened');
        }
        else {
            var z = casper.evaluate(function () {
                $(' .icon-search').click();
            });
            this.echo("Opened Search div");
        }
    });
    //entering item to be searched
    casper.then(function () {
        this.sendKeys({type: 'xpath', path: ".//*[@id='input-text-search']"}, item);
        this.wait(6000);
        this.click('#search-form > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)');
        console.log('Clicking on search button');
    });

    //counting number of Search results
    casper.wait(5000).then(function () {
        var counter = 0;
        do
        {
            counter = counter + 1;
            this.wait(2000);
        } while (this.visible(x(".//*[@id=" + counter + "]/table/tbody/tr[2]/td/table/tbody/tr/td")));

        counter = counter - 1;
        this.echo("number of search results:" + counter);

        if (counter > 0) {
            this.test.pass("search result found for lower case letters");
        }
        else {
            this.test.fail("search feature is not working for lowercase keywords");
        }
    });

    casper.run(function () {
        test.done();
    });
});
