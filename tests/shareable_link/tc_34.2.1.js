/* 
 Author: Tejas Sakhardande
 Description:    This is a casperjs automated test script for showing that when the "Notebook.R" is selected from the dropdown menu near the shareable link, 
 if we click on the shareable link it will display the output of the FastRWeb code present in the notebook in new tab
*/

//Begin Tests

casper.test.begin("notebook.R test", 8, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid = "73319cf579d359cf0b9ffcee3a0846c3";// the notebook id for 'Notebook.R' notebook

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

    casper.wait(10000);

    //login to Github and RCloud
    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    //validating for RCloud main page to be loaded
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

    //Choosing notebook.R from dropdown
    // casper.wait(3000).waitForSelector(x(".//*[@id='selection-bar']/div/div/input"), function () {
    //     this.click("span.dropdown");
    //     this.echo("Clicking on shareable dropdown menu button");

    //     this.waitForSelector("#view-type > li:nth-child(4) > a:nth-child(1)", function () {
    //         this.echo("notebook.R option is visible");
    //         this.click("#view-type > li:nth-child(4) > a:nth-child(1)");
    //         console.log("Choosing 'notebook.R' option from the dropdown'");
    //     });
    // });

    casper.then(function (){
        var URL = this.getCurrentUrl()
        this.echo(URL);
        var ID = URL.substring(41);
        this.echo(ID);
        this.thenOpen("http://127.0.0.1:8080/notebook.R/"+ID)
    })

    //Opening in notebook.R.html
    casper.wait(5000).then(function () {
        this.test.assertUrlMatch(/notebook.R/, 'notebook.R.html link is opened');
        this.wait(5000);
        this.waitForSelector("body > form:nth-child(1)", function () {
            this.test.assertExists('body > form:nth-child(1)', 'Required element found hence "Notebook.R" opened successfully');
            console.log("Confirmed notebook.R page opened");
        });    
    });

    casper.run(function () {
        test.done();
    });
});

