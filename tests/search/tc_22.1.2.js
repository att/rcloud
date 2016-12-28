/* 
 Author: Prateek
 Description:    This is a casperjs automated test script for showning that when a cell from a notebook is deleted from Rcloud,
 the respective content should be deleted from Search Results. This is indicated by decrease in Number of Search Results
*/

//Begin Tests
casper.test.begin(" Search after deleting a cell from a notebook", 8, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var item = '"MobilePhone"';//item to be searched
    var title;//store notebook title
    var combo;//store author+notebook title		

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
    
    //Added a new cell and execute the contents
    functions.addnewcell(casper);
    
    //Add contents to this cell and then execute it using run option
    functions.addcontentstocell(casper, item);
    
    casper.wait(2000);
    //Added a new cell and execute the contents
    functions.addnewcell(casper);
    
    //Add contents to this cell 
    functions.addcontentstocell(casper, item);
    casper.then(function(){
		this.click({type: 'xpath', path: '//*[@id="run-notebook"]'});
		this.wait(2000);
	});
    
    //Search div is open or not
    casper.then(function() {
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
                                 
        counter = counter - 1;
        this.echo("number of search results:" + counter);
    
        if (counter >= 1)
        {
    		this.test.pass("search item has been found ");
    	}
    	else
    		{
    			this.test.fail("searched item not found");
    		}
	});
		
    //Deleting all the cells
    casper.then(function () {
        this.click(x(".//*[@id='selection-bar']/div/div/input"));
        this.click(x(".//*[@id='selection-bar-delete']"))
    });
	
	casper.reload();
		
	casper.wait(5000).then(function(){
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
                                 
        counter = counter - 1;
        this.echo("number of search results:" + counter);
    
        if (counter > 0)
        {
			this.test.pass("The searched item has been deleted ");
		}
		
	});
		
	casper.run(function () {      
        test.done();
    });
});


		
    
    
    
    
    
    
    
    
    
    
    
