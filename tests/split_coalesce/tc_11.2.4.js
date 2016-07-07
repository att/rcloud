/* 
 Author: Prateek
 Description: This is a casperjs automated test script for showing that for the given combination,selecting Coalesce Cell option for the bottom cell 
 results in merging of the bottom cell with the top one
 */

//Begin Tests

casper.test.begin("Coalesce combination of two R cells", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var input_content_1 = "a<-12";
    var input_content_2 = "a<-95";
    var functions = require(fs.absolute('basicfunctions'));

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

    //Add new notebook
    casper.then(function () {
        functions.create_notebook(casper);
    });

    //Add first cell and contents
    casper.wait(5000).then(function () {
        console.log("Adding new cell");
        functions.addnewcell(casper);
    });

    casper.wait(5000).then(function () {
        console.log("Initialising the variable and executing the cell");
        functions.addcontentstocell(casper, input_content_1);
        this.wait(6000);
    });

    //Adding onemore cell
    casper.then(function () {
        this.click(x(".//*[@id='prompt-area']/div[1]/div/span/i"));
        this.wait(4000);
    });

    //Adding cell contents
    casper.wait(2000).then(function () {
        this.waitForSelector(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), function () {
            this.sendKeys(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), "a<-12;b<-12;a+b");
        });
    });

    //Click coaslesce option
    casper.wait(2000).then(function () {
        console.log("clicking on Join cell icon")
        this.click(x(".//*[@id='part2.R']/div[1]/span[2]/i"));
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(3000);
        casper.test.assertDoesntExist(x(".//*[@id='part2.R']/div[2]/div[2]/span[5]/i"), "Split option doesn't exists");
    });

    casper.run(function () {
        test.done();
    });
});

