/*
 Author: Prateek
 Description:    This is a casperjs automated test script for showing that Date on which notebook was created/updated is used for Search without quotes
 * for example : date and time stamp
 */

//Begin Tests
casper.test.begin(" Loaded Notebook of some different user (after the Notebook is forked)", 9, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_id = "7e2847df9f4048d46935bdc6d6b29a78";
    var title, item;
    var input = '"2016-06-17T12:02:57Z"';

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

    //open notebook or load a notebook
    casper.viewport(1366, 768).thenOpen('http://127.0.0.1:8080/main.html?notebook=' + notebook_id, function () {
        this.wait(10000);
        this.then(function () {
            title = functions.notebookname(casper);
            this.echo("Notebook title : " + title);
            this.wait(3000);
            var author = this.fetchText({type: 'css', path: '#notebook-author'});
            this.echo("Notebook author: " + author);
            this.test.assertNotEquals(author, github_username, "Confirmed that notebook belongs to different user");
        });
    });

    functions.fork(casper);

    functions.addnewcell(casper);

    functions.addcontentstocell(casper, input);

    casper.then(function () {
        if (this.visible('#search-form > a:nth-child(3)')) {
            console.log('Search div is already opened');
        }
        else {
            var z = casper.evaluate(function () {
                $('#accordion-left > div:nth-child(2) > div:nth-child(1) > a:nth-child(1) > span:nth-child(2)').click();
            });
            this.echo("Opened Search div");
        }
    });

    //To fetch the date we are searching with content first   
    casper.wait(2000).then(function () {
        this.sendKeys('#input-text-search', input);
        this.wait(6000);
        this.click('#search-form > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)');

    });

    casper.wait(2000).then(function () {
        item = this.fetchText(x(".//*[@id='search-results']/table/tbody/tr[1]/td/span/i"));
        // this.echo(item);
        this.reload();
    });


    //entering item to be searched
    casper.wait(5000).then(function () {
        this.sendKeys('#input-text-search', input);
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
        } while (this.visible(x(".//*[@id='search-results']/table/tbody/tr[" + counter + "]/td")));

        counter = counter - 1;
        this.echo("number of search results:" + counter);

        if (counter > 0) {
            this.test.pass("search feature is working fine with date and time stamp ");
        }
        else {
            this.test.fail("search feature is not working fine with date and time stamp");
        }
    });

    //Deleting cell
    casper.wait(2000).then(function () {
        this.click(x(".//*[@id='selection-bar']/div/div/input"));
        this.click(x(".//*[@id='selection-bar-delete']"))
    });

    casper.run(function () {
        test.done();
    });
});

