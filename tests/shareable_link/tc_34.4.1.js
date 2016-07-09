/* 
 Author: Tejas Sakhardande
 Description:    This is a casperjs automated test script for showing that When the "mini.html" is selected from the dropdown menu near the shareable link, 
				 if we click on the shareable link it will display the output of the code present in the notebook in new tab

*/

//Begin Tests

casper.test.begin("mini.html test", 8, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid='f3480ceec707f5cbc84a';//to get the notebook id

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

    //Choosing mini from dropdown
    // casper.wait(3000).waitForSelector(x(".//*[@id='selection-bar']/div/div/input"), function () {
    //     this.click("span.dropdown");
    //     this.echo("Clicking on shareable dropdown menu button");

    //     this.waitForSelector("#view-type > li:nth-child(4) > a:nth-child(1)", function () {
    //         this.echo("mini option is visible");
    //         this.click("#view-type > li:nth-child(4) > a:nth-child(1)");
    //         console.log("Choosing 'mini' option from the dropdown'");
    //     });
    // });

    casper.then(function (){
        var URL = this.getCurrentUrl()
        this.echo(URL);
        var ID = URL.substring(41);
        this.echo(ID);
        this.thenOpen("http://127.0.0.1:8080/mini.html?notebook="+ID)
    })

    //Opening in mini.html
    casper.wait(5000).then(function () {
        this.test.assertUrlMatch(/mini.html/, 'mini.html link is opened');
        this.wait(5000);
        this.waitForSelector("body > h1:nth-child(1)", function () {
            this.test.assertExists("body > h1:nth-child(1)",'Required element found hence "Mini.html" notebook opened successfully');
            console.log("Confirmed Mini page opened");
        });    
    });

    casper.run(function () {
        test.done();
    });
});

