/* 
 Author: Parteek
 Description:    This is a casperjs automated test script for showning that For the "Search" results, Text searched is highligted in the text area
 when searched in double quotes
*/

//Begin Tests
casper.test.begin(" Text searched is highligted in the text area when searched in double quotes", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var item = '"a<- "CHUTYA";a"';
    var title;//get notebook title
    var combo;//store notebook author + title	
    var highlight = "background:yellow"

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
        combo = github_username + ' / ' + title;
    });

    //Added a new cell
    functions.addnewcell(casper);

    //Add contents to this cell and then execute it using run option
    functions.addcontentstocell(casper, item);

    //Search div is open or not
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
        this.sendKeys('#input-text-search', "CHUTYA");
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

        //verify that the searched item is found in the local user's div
        casper.viewport(1366, 768).then(function () {
            for (var i = 1; i <= counter; i++) {
                this.wait(5000);
                var result = this.fetchText(x(".//*[@id=" + i + "]/table/tbody/tr[2]/td/table/tbody/tr/td"));
                //this.echo(result);
                if ( result == combo ) {
                    this.test.assertExists(x(".//*[@id=" + i + "]/table/tbody/tr[2]/td/table/tbody/tr/td"), 'Search item is highlighted');
                    var temp = this.fetchText(x(".//*[@id=" + i + "]/table/tbody/tr[2]/td/table/tbody/tr/td"));
                    this.test.assertEquals(temp, item, 'Searched item has been found');
                    break;
                }// if closes
            }//for closes
        });//function closes
    });

    casper.then(function () {
        var temp5 = this.getElementInfo({
            type: 'xpath',
            path: ".//*[@id='0']/table/tbody/tr[2]/td/table/tbody/tr/td/code/b"
        }).tag;
        var res = temp5.substring(10, 27);
        this.test.assertEquals(highlight, res, 'searched contents are highlighted in search results div');
    });

    casper.then(function () {
        this.click(x(".//*[@id='selection-bar']/div/div/input"));
        this.click(x(".//*[@id='selection-bar-delete']"))
    });

    casper.run(function () {
        test.done();
    });
});

   
   
