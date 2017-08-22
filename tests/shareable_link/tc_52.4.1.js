/*

 Author: Amith
 Description:This is a casperjs automation script for checking that the published flexdashboard.html notebook is visible to the anonymous user
 */


casper.test.begin("flexdashboard.html notebook opening as a Anonymous user", 10, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions.js'));
    var notebook_id;
    var ID;
    
    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

    casper.wait(10000);

    //Login to GitHub and RCloud
    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    //Validating for RCloud main page to be loaded
    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
    });


    casper.then(function () {
        this.thenOpen('http://127.0.0.1:8080/main.html?notebook=5155a7c1de42e7fb64fc5cb09a28c4b5');
        this.wait(5000);
        this.test.assertVisible(x(".//*[@id='selection-bar']/div/div/input"), "Notebook opened");
    });
    
    casper.wait(4000);

    functions.fork(casper);

    casper.wait(4000);
    
    casper.wait(9000).then(function (){
        var URL = this.getCurrentUrl()
        this.echo(URL);
        var ID = URL.substring(41);
        this.echo(ID);
        this.thenOpen(URL);
    });
    
    casper.wait(4000);
    
    casper.wait(6000).then(function () {
		this.click(x(".//*[@id='rcloud-navbar-menu']/li[3]/a/b"));
        console.log("Opening dropdown");
        this.click(x(".//*[@id='publish_notebook']/i"));
        console.log("Publishing Notebook");
        this.wait(4000);
    });
    
    casper.wait(9000).then(function (){
        var URL = this.getCurrentUrl()
        this.echo(URL);
        var ID = URL.substring(41);
        this.echo(ID);
    });

    //logging out of RCloud
    casper.viewport(1366, 768).then(function () {
        console.log('Logging out of RCloud');
        this.click("#rcloud-navbar-menu > li:nth-child(7) > a:nth-child(1)");
        this.wait(6000);
    });


    //Accessing flexdashboard.html for published notebook as anonymous user
    casper.wait(4000).then(function (){
        this.thenOpen("http://127.0.0.1:8080/shared.R/rcloud.flexdashboard/flexdashboard.html?notebook=" + ID);
    });

    //Opening in flexdashboard.html
    casper.wait(9000).then(function () {
        this.test.assertUrlMatch(/flexdashboard.html/, 'flexdashboard.html link is opened');
        this.wait(8000);
    });
    

    casper.wait(4000);
    
    casper.wait(6000).then(function (){
        this.page.switchToChildFrame(0);
            casper.withFrame(0,function() {
                this.test.assertExists(".navbar-brand", "Navigation bar exists");
                this.test.assertSelectorHasText("#lung-deaths-all > div:nth-child(1)", "Lung Deaths (All)");
                this.test.assertVisible("#lung-deaths-all > div:nth-child(2)", "desired element is visible");
        });        
        this.page.switchToParentFrame();
    });
    
    casper.run(function () {
        test.done();
    });
});
    
