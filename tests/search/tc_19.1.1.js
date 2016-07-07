/*
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that For the "Search" option, the When the description of a notebook 
 * is changed and the notebook is updated, the change should get reflected in the Search results
 */

//Begin Tests
casper.test.begin("  Notebook Description as Search Text", 8, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var item = '"23456"';//item to be searched
    var notebook_id = "b787f8b08cd28ce8764e";
    var item1 = '"2222"';

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

    // Create a new  cell
    functions.addnewcell(casper);

    // Add contents to the cell
    functions.addcontentstocell(casper, item1);

    //Edit the notebook with adding another new cell
    functions.addnewcell(casper);

    // Add contents to the cell
    functions.addcontentstocell(casper, '12345');
    casper.then(function () {
        this.click({type: 'xpath', path: '/html/body/div[2]/div/div[2]/ul[1]/li[4]/button'});//To save the contents
        this.wait(2000);
    });


    //entering item to be searched
    casper.then(function () {
        this.sendKeys('#input-text-search', '12345');
        this.wait(6000);
        this.click('#search-form > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)');
    });

    casper.wait(5000);

    //counting number of Search results
    casper.then(function () {
        var counter = 0;
        do
        {
            counter = counter + 1;
            this.wait(2000);
        }
        while (this.visible(x(".//*[@id=" + counter + "]/table/tbody/tr[2]/td/table/tbody/tr/td")));
        counter = counter - 1;
        this.echo("number of search results:" + counter);

        if (counter > 0) {
            this.test.pass("search feature is working fine for edited notebooks ");
        }
        else {
            this.test.fail("search feature is not working fine for edited notebooks ");
        }
    });

    casper.run(function () {
        test.done();
    });
});
