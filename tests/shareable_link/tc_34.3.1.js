/*
 Author: Tejas Sakhardande
 Description:    This is a casperjs automated test script for showing that When the "Shiny.html" is selected from the dropdown menu near the shareable link,
 if we click on the shareable link it will display the output of the Rshiny code present in the notebook in new tab

 */

//Begin Tests

casper.test.begin("shiny.html test", 8, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid = "4360254105c00b37c7451c110b572356";//to get the notebook id

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


    functions.fork(casper);

    //Choosing shiny from dropdown
    // casper.wait(3000).waitForSelector(x(".//*[@id='selection-bar']/div/div/input"), function () {
    //     this.click("span.dropdown");
    //     this.echo("Clicking on shareable dropdown menu button");

    //     this.waitForSelector("#view-type > li:nth-child(4) > a:nth-child(1)", function () {
    //         this.echo("Shiny option is visible");
    //         this.click("#view-type > li:nth-child(4) > a:nth-child(1)");
    //         console.log("Choosing 'Shiny' option from the dropdown'");
    //     });
    // });

    casper.then(function (){
        var URL = this.getCurrentUrl()
        this.echo(URL);
        var ID = URL.substring(41);
        this.echo(ID);
        this.thenOpen("http://127.0.0.1:8080/shiny.html?notebook="+ID)
    })

    //Opening in Shiny.html
    casper.wait(5000).then(function () {
        this.test.assertUrlMatch(/shiny.html/, 'shiny.html link is opened');
        this.wait(5000);
        this.waitForSelector(".col-sm-12 > h1:nth-child(1)", function () {
            this.test.assertExists('.col-sm-12 > h1:nth-child(1)', 'Required Element found hence "Shiny.html" loaded  successfully');
            console.log("Confirmed Shiny page opened");
        });    
    });

    casper.run(function () {
        test.done();
    });
});

