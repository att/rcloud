/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that,When a keyword, that is present in Assets div of the notebooks 
 * is searched the search results should contain all the links to the notebooks that contain the keyword in comment section 
*/
//Begin Tests
casper.test.begin("Searching keywords present in Assets div",  function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var item = "HADSU_BASYA"; // keyword to be searched
    
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

    functions.create_notebook(casper);

    functions.addnewcell(casper);

    functions.addcontentstocell(casper, "a<-23;b<-35;a+b");
    
    casper.then(function () {
        var url = this.getCurrentUrl();
        this.thenOpen(url);
        this.wait(3000);
    });

    casper.wait(5000).then(function () {
        console.log('Clicking on new asset to create an new asset');
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Choose a filename for your asset") {
                return item;
            }
        });
        this.click("#new-asset>a");
        this.echo("Creating a new asset");
        this.wait(2000);
    });

    casper.then(function(){
        this.click({type:'xpath', path:".//*[@id='scratchpad-editor']/div[1]/div/textarea"});
        this.sendKeys({type:'xpath', path:".//*[@id='scratchpad-editor']/div[1]/div/textarea"},item);
        console.log("Entering text in asset.R");
        this.click(x(".//*[@id='save-notebook']"));//Saving notebook
    });

    //searching for the keyword
    casper.wait(5000).then(function(){
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

	//Now verifying the searched 'assest' item found in search results or not
    casper.wait(3000).then(function(){
        this.wait(3000);
        if(this.test.assertSelectorHasText(x(".//*[@id='0']/table/tbody/tr[2]/td/table/tbody/tr/td"), item, "verifyingfor the searcheed content from asset div"))
        {
			this.test.pass("Asset's content is searched successfully");
		}else
		{
			this.test.fail(" Failed to find Asset's content" );
		}
    });
    
    casper.run(function () {
        test.done();
    });
});
