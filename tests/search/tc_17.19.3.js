/*
 Author: Prateek
 Description:    This is a casperjs automated test script for showing that,If the content present in
 * both asset and comments is Searched, then the Notebooks description and the Searched item  should be displayed separately under assets and comments
*/
//Begin Tests

casper.test.begin("Same Asset and Comment as Searched Text", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var item = 'Herbert';//item to be searched
    var title, text;//get notebook title
    var notebookid = 'ee063e3a6d63194870b4';//Loading notebook which contains item to be searched from assets title

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
    
    //Loading Notebook 
    casper.viewport(1366, 768).thenOpen('http://127.0.0.1:8080/edit.html?notebook=' + notebookid, function () {
        this.wait(5000);
        this.waitForSelector({type: 'css', path: '#share-link .icon-share'}, function () {
            console.log("Verified that page is loaded successfully");
        });
    });

    functions.fork(casper);

    functions.addnewcell(casper);

    functions.runall(casper);

    functions.comments(casper, item);
    
    //Opening search div
    casper.viewport(1024, 768).then(function () {
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

    //entering item to be searched
    casper.then(function () {
        this.sendKeys('#input-text-search', item);
        this.wait(6000);
        this.click('#search-form > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)');
    });

    casper.wait(5000);
	
	//Verifying the searched item exists with notebook title
    casper.then(function () {
        this.test.assertSelectorHasText(x(".//*[@id='search-results-scroller']"), 'sanketd11' , 'Searched asset contents are displayed');
        
    });
    
    //Verifying the searched item exists with notebook titel
    casper.then(function () {
        this.test.assertSelectorHasText(x(".//*[@id='search-results-scroller']"), item , 'searched text for comments, exists in comments section');
    });
    
    casper.then(function(){
		this.click({type:'xpath', path:".//*[@id='comments-container']/div/div[2]/div/i"});//deleting the comment so that, there will be only one unique comment and it is usefull while searching otherwise there will be more list under searched div
		this.wait(2000);
	});

    casper.run(function () {
        test.done();
    });
});
