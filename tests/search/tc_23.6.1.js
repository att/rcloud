/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showning that For the "Search" results,
 Star is shown for Notebooks with its respective star count
 */

//Begin Tests

casper.test.begin(" Star is shown for Notebooks with its respective star count", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var item = 'inthezoo';
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
    functions.addcontentstocell(casper, item);

    functions.search1(casper, item);

    casper.wait(5000);

    //counting number of Search results
    casper.then(function () {
        var counter = 0;
        do
        {
            counter = counter + 1;
            this.wait(2000);
        }
        while (this.visible(x(".//*[@id='search-results']/table["+ counter +"]/tbody/tr[1]/td/i")));

        counter = counter - 1;
        this.echo("number of search results:" + counter);

        //verify that the searched item is found in the local user's div
         casper.viewport(1366, 768).then(function () {
             for (var i = 1; i <= counter; i++) {
                 this.wait(5000);
                 var result = this.fetchText(x('.//*[@id="open_'+i+'"]'));
                    console.log(result);
                 this.test.assertVisible(x(".//*[@id='search-results']/table["+i+"]/tbody/tr[1]/td/i"));
                 break;
             }//for closes
             this.echo("Star is shown for Notebooks with its respective star count");
         });//function closes
    });

    casper.run(function () {
        test.done();
    });
});
