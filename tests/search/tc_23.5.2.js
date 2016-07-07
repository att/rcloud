/*
 Author: Prateek
 Description: This is a casperjs automated test script for showing that,Display 
 * the time at which the notebook was last modified, along with the date, under the heading "modified at" 
 */
//Begin Tests

casper.test.begin("Display time on which the notebook was last modified", 8, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var item = '"DARTH-VADER"';//item to be searched
    var title,date,modidate,res,res1;

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

    functions.create_notebook(casper);
    functions.addnewcell(casper);
    functions.addcontentstocell(casper, item);

    functions.search1(casper, item);

    casper.wait(5000);

    casper.then(function () {
        date = this.fetchText(x(".//*[@id='search-results']/table/tbody/tr[1]/td/span/i"));
        this.echo("Before " + date);
        res = date.substring(23, 31);
        this.echo('Time on which notebook is modified:' + res);
    });

    //deleting the cell
    casper.then(function () {
        this.click(x(".//*[@id='selection-bar']/div/div/input"));
        this.click(x(".//*[@id='selection-bar-delete']"))
    });

    casper.then(function () {
        this.reload();
    });

    casper.wait(12000);

    //Again add new cell
    functions.addnewcell(casper);
    functions.addcontentstocell(casper, item);

    //entering item to be searched
    casper.then(function () {
        this.sendKeys('#input-text-search', item);
        this.wait(6000);
        this.click('#search-form > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)');
    });

    casper.wait(5000);

    casper.then(function () {
        modidate = this.fetchText(x(".//*[@id='search-results']/table/tbody/tr[1]/td/span/i"));
        this.echo("after" + date);
        res1 = modidate.substring(23, 31);
        this.echo('Time on which notebook is modified:' + res1);
    });

    //Comaparing the date and modified cell dates
    casper.then(function(){
        this.test.assertNotEquals( date, modidate, 'notebook was last modified at:' + modidate);
    });

    casper.then(function () {
        this.click(x(".//*[@id='selection-bar']/div/div/input"));
        this.click(x(".//*[@id='selection-bar-delete']"))
    });

    casper.wait(3000);
    casper.run(function () {
        test.done();
    });
});
