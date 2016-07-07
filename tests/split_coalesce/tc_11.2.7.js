/* 
 Author: Tejas
 Description:    This is a casperjs automated test script for showing that for the given combination,selecting Coalesce Cell option for the bottom cell 
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
    var notebookid, title;

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
        this.wait(5000);
    });

    //getting Notebook ID
    casper.viewport(1024, 768).then(function () {
        var temp1 = this.getCurrentUrl();
        notebookid = temp1.substring(41);
        this.echo("The Notebook Id: " + notebookid);
    });

    //Add first cell and contents
    casper.then(function () {
        console.log("Adding new cell");
        functions.addnewcell(casper);
    });

    casper.wait(5000).then(function () {
        console.log("Initialising the variable and executing the cell");
        functions.addcontentstocell(casper, input_content_1);
    });

    //Create a new cell
    casper.then(function () {
        this.click(x(".//*[@id='prompt-area']/div[1]/div/span/i"));
        console.log("Creating new cell")
    });

    casper.wait(6000).then(function () {
        this.waitForSelector(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), function () {
            this.sendKeys(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), input_content_2);
            console.log('adding contents to the cell');
        });
    });

    //Click coaslesce option
    casper.wait(4000).then(function () {
        this.click(x(".//*[@id='part2.R']/div[1]/span[2]/i"));
        console.log('clicked coalesce option');
        this.wait(5000);
    });

    //Create new notebook
    casper.then(function () {
        functions.create_notebook(casper);
        this.wait(5000);
    });

    //Switch back to the previous notebook
    casper.viewport(1366, 768).then(function () {
        sharedlink = "http://127.0.0.1:8080/view.html?notebook=" + notebookid;
        this.thenOpen(sharedlink, function () {
            this.wait(7000);
            this.echo("Opened the view.html of the published notebook " + title);
        });
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(3000);
        casper.test.assertDoesntExist({
            type: 'xpath',
            path: '/html/body/div[3]/div/div[2]/div/div[1]/div[2]/div[2]/div[1]/span[4]'
        });
    });

    casper.run(function () {
        test.done();
    });
});
