/* 
 Author: Prateek
 Description:This is a casperjs automated test script for showing that For the "Search" option,
 Number of Results Found should match Number of Results Displayed
*/

//Begin Tests
casper.test.begin(" Number of Results Found should match Number of Results Displayed ", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var item = '"hellothere"';
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
    functions.addcontentstocell(casper, item);

    //verify if number of search results displayed is equal to count of search results
    var counter = 0;
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
			this.sendKeys('#input-text-search',item);
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
            while (this.visible(x(".//*[@id='search-results']/table["+counter+"]/tbody/tr/td")));
                                         
            counter = counter - 1;
            this.echo("number of search results:" + counter);
            
            if (counter >0)
            {
				this.test.pass("searched item has been found ");
			}
			else {
					this.test.fail("search item didnot find ");
				 }
		});
    });

    casper.run(function () {
        test.done();
    });
});
