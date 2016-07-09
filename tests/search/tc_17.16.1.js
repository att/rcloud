/* 
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that For the "Search" option, the text entered in the text box for
 'full-text search' will consist of Unicode characters as Search Text like äåæçèéê etc. only
 */

//Begin Tests
casper.test.begin(" Unicode characters as Search Text ", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var item = 'äåæçèéê';//item to be searched
    var title;//get notebook title
    var combo;//store notebook author + title	

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

    //Added a new cell and execute the contents
    functions.addnewcell(casper);

    //Add contents to this cell and then execute it using run option
    casper.then(function () {
        functions.addcontentstocell(casper, item);
    });

    //function to search the entered item
    casper.viewport(1024, 768).then(function () {
        if (this.visible('#search-form')) {
            console.log('Search div is already opened');
        }
        else {
            var z = casper.evaluate(function () {
                $('.icon-search').click();
            });
            this.echo("Opened Search div");
        }

        //entering item to be searched
        casper.then(function () {
            this.sendKeys('#input-text-search', item);
            this.wait(6000);
            var z = casper.evaluate(function () {
                $('.icon-search').click();
            });
        });
        var counter = 0;

        //counting number of Search results
        casper.wait(5000).then(function () {
            do
            {
                counter = counter + 1;
                this.wait(2000);
            } while (this.visible(x(".//*[@id='search-results']/table/tbody/tr[" + counter + "]/td")));
            counter = counter - 1;
            this.echo("number of search results:" + counter);
            this.test.assertEquals(counter, 0, "Confirmed that no search results are displayed");
        });

    });

    casper.run(function () {
        test.done();
    });
});

	   
    
