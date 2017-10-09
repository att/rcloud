/*
 Author: Amith
 Description: This is a casperjs automated test script for showing that When the "flexdashboard.html" is selected from the dropdown menu near the shareable link, if we click on the shareable link it will display the output of the code present in the notebook in new tab

 */

//Begin Tests

casper.test.begin("flexdashboard.html test", 10, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid = "acd1573cdf5e6b842364bd86e47b3d6c";//to get the notebook id

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

    casper.then(function () {
        this.thenOpen('http://127.0.0.1:8080/main.html?notebook=' + notebookid);
        this.wait(5000);
        this.test.assertVisible(x(".//*[@id='selection-bar']/div/div/input"), "Notebook opened");
    });
    
    casper.wait(4000);

    functions.fork(casper);

    casper.wait(4000);
    
    casper.wait(4000).then(function (){
        var URL = this.getCurrentUrl()
        this.echo(URL);
        var ID = URL.substring(41);
        this.echo(ID);
        this.thenOpen("http://127.0.0.1:8080/shared.R/rcloud.flexdashboard/flexdashboard.html?notebook="+ID);
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

