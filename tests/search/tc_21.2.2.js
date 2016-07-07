/*
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that,When multiple cells from multiple 
 * notebooks are modified from Rcloud, the respective content should be modified from search Results
 */

//Begin Tests

casper.test.begin(" Modifying multiple cells of multiple notebooks", 11, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var item1 = "'KRUNAL'";// item to be searched
    var item2 = "'GUBAAL'";
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

    //Added a new cell and execute the contents
    functions.addnewcell(casper);

    //Add contents to this cell and then execute it using run option
    functions.addcontentstocell(casper, item1);

    //Creating one more cell and adding contents to it
    casper.then(function () {
        this.click('div.cell-control-bar:nth-child(1) > span:nth-child(1) > i:nth-child(1)');
        this.wait(2000);
        this.waitForSelector(x(".//*[@id='part1.R']/div[3]/div[1]/div[2]/div/div[2]/div"), function () {
            this.sendKeys(x(".//*[@id='part1.R']/div[3]/div[1]/div[2]/div/div[2]/div"), item1);
        });
        functions.runall(casper);
    });

    //Creating 2nd notebook
    functions.create_notebook(casper);

    //Fetch the current notebook title
    casper.then(function () {
        this.echo(URL2 = this.getCurrentUrl());
    });

    //Added a new cell and execute the contents
    functions.addnewcell(casper);

    //Add contents to this cell and then execute it using run option
    functions.addcontentstocell(casper, item1);

    //Creating one more cell and adding contents to it
    casper.then(function () {
        this.click('div.cell-control-bar:nth-child(1) > span:nth-child(1) > i:nth-child(1)');
        this.wait(2000);
        this.waitForSelector(x(".//*[@id='part1.R']/div[3]/div[1]/div[2]/div/div[2]/div"), function () {
            this.sendKeys(x(".//*[@id='part1.R']/div[3]/div[1]/div[2]/div/div[2]/div"), item1);
        });
        functions.runall(casper);
    });

    //checking if Search div is open
    casper.then(function () {
        if ( this.visible('#input-text-search') ) {
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
        this.sendKeys('#input-text-search', item1);
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
        while (this.visible(x(".//*[@id='search-results']/table[" + counter + "]/tbody/tr/td")));

        // counter = counter - 1;
        this.echo("number of search results:" + counter);

        if ( counter >= 2 ) {
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

    //Modifying  contents to this cell and then execute it using run option
    casper.then(function () {
        this.click(x(".//*[@id='part1.R']/div[2]/div[2]/span[2]/i"));
        this.sendKeys(x(".//*[@id='part1.R']/div[3]/div[1]/div[2]/div/div[2]/div"), item2);
    });

    //Modifying  contents to this cell and then execute it using run option
    casper.then(function () {
        this.click(x(".//*[@id='part2.R']/div[2]/div[2]/span[2]/i"));
        this.sendKeys(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), item2);
    });

    casper.wait(5000);

    casper.then(function () {
        var z = casper.evaluate(function () {
            $('#save-notebook').click();
        });
        this.wait(6000);
    });

    casper.wait(5000);

    //Switching to 2nd notebook
    casper.then(function () {
        this.thenOpen(URL2);
        console.log('Opening 2nd notebook');
    });

    casper.wait(8000);

    //Modifying  contents to this cell and then execute it using run option
    casper.then(function () {
        this.click(x(".//*[@id='part1.R']/div[2]/div[2]/span[2]/i"));
        this.sendKeys(x(".//*[@id='part1.R']/div[3]/div[1]/div[2]/div/div[2]/div"), item2);
    });

    //Modifying  contents to this cell and then execute it using run option
    casper.then(function () {
        this.click(x(".//*[@id='part2.R']/div[2]/div[2]/span[2]/i"));
        this.sendKeys(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), item2);
    });

    casper.wait(5000);

    casper.then(function () {
        var z = casper.evaluate(function () {
            $('#save-notebook').click();
        });
        this.wait(6000);
    });

    casper.wait(2000);

    casper.then(function () {
        temp = item2 + item1;
    });

    //checking if Search div is open
    casper.then(function () {
        this.sendKeys('#input-text-search', temp);
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

        // counter = counter - 1;
        this.echo("number of search results:" + counter);

        if ( counter >= 0 ) {
            this.test.pass("Modified contents from the cell has been successfully searched ");
        }
        else {
            this.test.fail("Failed to find the searching item ");
        }
    });

    //Deleting cells from 2nd notebook just to make searched list to minimize
    casper.then(function () {
        this.click(x(".//*[@id='selection-bar']/div/div/input"));
        this.click(x(".//*[@id='selection-bar-delete']"))
    });

    casper.wait(3000);

    //Deleting cells from 1st notebook just to make searched list to minimize
    casper.then(function () {
        this.thenOpen(URL1);
    });

    casper.wait(8000).then(function () {
        this.click(x(".//*[@id='selection-bar']/div/div/input"));
        this.click(x(".//*[@id='selection-bar-delete']"))
    });

    casper.run(function () {
        test.done();
    });
});