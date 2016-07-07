/*
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that,When multiple 
 * cells from multiple notebooks are deleted from Rcloud, the respective content should be deleted from search Results
*/

//Begin Tests
casper.test.begin(" Deleting multiple cells from multiple notebooks", 11, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var item = "'Luke Skywalker'";// item to be searched
    var title;//get notebook title
    var URL1;// to store 1st notebook URL
    var URL2;// to store 2nd notebook URL
    var temp;

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
    functions.create_notebook(casper);//1st notebook

    //Fetch the current notebook title
    casper.then(function () {
        this.echo(URL1 = this.getCurrentUrl());
    });

    //Added a new cells
    functions.addnewcell(casper);

    //Add contents to this cell and then execute it using run option
    functions.addcontentstocell(casper, item);

    casper.wait(5000).then(function (){
        this.click('div.cell-control-bar:nth-child(1) > span:nth-child(1) > i:nth-child(1)');
        console.log('creating one more cell');
        this.wait(4000)
        this.waitForSelector(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), function (){
            this.sendKeys(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), "item");    
        });
        this.click("#save-notebook");
    });

    //Creating 2nd notebook
    functions.create_notebook(casper);

    //Fetch the current notebook title
    casper.then(function () {
        this.echo(URL2 = this.getCurrentUrl());
    });

    //Added a new cells
    functions.addnewcell(casper);

    //Add contents to this cell and then execute it using run option
    functions.addcontentstocell(casper, item);

    casper.wait(5000).then(function (){
        this.click('div.cell-control-bar:nth-child(1) > span:nth-child(1) > i:nth-child(1)');
        console.log('creating one more cell');
        this.wait(4000)
        this.waitForSelector(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), function (){
            this.sendKeys(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), "item");    
        });
        this.click("#save-notebook");
    });

    //checking if Search div is open
    casper.then(function () {
        if (this.visible('#input-text-search')) {
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
        this.sendKeys('#input-text-search', item);
        this.wait(6000);
        this.click('#search-form > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)');
    });

    //counting number of Search results
    casper.wait(5000).then(function () {
        var counter = 0;
        do
        {
            counter = counter + 1;
            this.wait(2000);
        }
        while (this.visible(x(".//*[@id="+counter+"]/table/tbody/tr[2]/td/table/tbody/tr/td")));

        // counter = counter - 1;
        this.echo("number of search results:" + counter);

        if (counter = 2) {
            this.test.pass("searching content has been found  ");
        }
        else {
            this.test.fail("searched item didnot find ");
        }
    });

    casper.wait(5000);

    //Opening 1s t notebook
    casper.then(function () {
        this.thenOpen(URL1);
        functions.validation(casper);
        console.log('Opening 1st notebbok');
    });
    
    casper.wait(8000);

    //Deleting cells of the 1st notebook
    casper.then(function () {
        this.click(x(".//*[@id='selection-bar']/div/div/input"));
        this.click(x(".//*[@id='selection-bar-delete']"))
        console.log('deleting cells of the 1st notebook');
    });

    casper.wait(5000);

    //Switching to 2nd notebook
    casper.wait(5000).then(function () {
        this.thenOpen(URL2);        
        console.log('Opening 2nd notebook');
    });
    
    //Deleting cells of the 2nd notebook
    casper.wait(6000).then(function () {
        this.click(x(".//*[@id='selection-bar']/div/div/input"));
        this.click(x(".//*[@id='selection-bar-delete']"))
		console.log('deleting cells of the 2nd notebook');
    });

    casper.wait(2000);
    
    //checking if Search div is open
    casper.then(function () {
        this.sendKeys('#input-text-search', item);
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
        while (this.visible(x(".//*[@id="+counter+"]/table/tbody/tr[2]/td/table/tbody/tr/td")));

        // counter = counter - 1;
        this.echo("number of search results:" + counter);

        if (counter >= 0) {
            this.test.pass("no results found after deleting the notebook's cells ");
        }
        else {
            this.test.fail("searched item has been found, so cells are not deleted ");
        }
    });


    casper.run(function () {
        test.done();
    });
});




