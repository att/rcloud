/*
 Auther : Prateek
 Description:    This is a casperjs automated test script for showing that,When the keyword is searched, it may be present in comments, assets, or any other places at a time.
 So the search results should show that keyword separately 
*/

//Begin test
casper.test.begin("Highlighting the searched keyword separately", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var item = "'SUSHEELENDRA'"; // keyword to be searched
    var temp;//to get pagination class attributes
    var temp1;
    var highlight_search = 'background:yellow';//Searched content is highlighted for comparison

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

    casper.wait(10000);

	//login to Github and RCloud
    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(4000);
    });
    
    //Create notebook
    functions.create_notebook(casper);
    
    //Create new notebook
    functions.addnewcell(casper);
    
    //Add contents to the cell and execute it
    functions.addcontentstocell(casper, item);
    
	//searching for the keyword
    casper.then(function () {
        if (this.visible('#search-form')) {
            console.log('Search div is already opened');
        }
        else {
            casper.evaluate(function () {
                $('.icon-search').click();
            });
            this.echo("Opened Search div");
        }
        //entering item to be searched
        casper.then(function () {
            this.sendKeys('#input-text-search', item);
            this.wait(6000);
            casper.evaluate(function () {
                $('.icon-search').click();
            });
        });
    });

    casper.then(function () {
        this.wait(3000);
        casper.then(function () {
            this.wait(5000);
            temp = this.getElementInfo(x(".//*[@id='0']/table/tbody/tr[2]/td/table/tbody/tr/td/code/b")).tag;
            temp1 = temp.substring(10,27);
        });
    });
    
    //Comparing searched item tag with the variable
    casper.then(function(){
		this.test.assertEquals(temp1, highlight_search, "Serached contents are highlighted");
	});

    casper.run(function () {
        test.done();
    });
});
