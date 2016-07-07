/*
 Author: Prateek
 Description: This is a casperjs automated test script for showing that,Display the
 date on which the notebook was last modified under the heading "modified at"

 */
//Begin Tests

casper.test.begin("Display Date on which the notebook was last modified", 8, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var item = "'MAN-UTD'";//item to be searched
    var title;//get notebook title
    var date;//to fetch the text of date
    var modidate;//to fetch the text of modified date
    var res;//to store the date
    var res1;//to store the modified date

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });
    casper.wait(10000);

    // casper.on('remote.message', function(msg) {
    //     this.echo('remote message caught: ' + msg);
    // });

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
        date = this.fetchText({
            type: 'xpath',
            path: "/html/body/div[3]/div/div[1]/div[1]/div/div/div[2]/div[2]/div/div/div[2]/div/div/table/tbody/tr[1]/td/span"
        });
        //this.echo(date);
        res = date.substring(12, 22);
        this.echo('Date on which notebook is modified:' + res);
    });

    //deleting the cell
    casper.then(function () {
        var z = casper.evaluate(function () {
            $('.icon-trash').click();
        });
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
        modidate = this.fetchText({
            type: 'xpath',
            path: "/html/body/div[3]/div/div[1]/div[1]/div/div/div[2]/div[2]/div/div/div[2]/div/div/table/tbody/tr[1]/td/span"
        });
        //this.echo(date);
        res1 = modidate.substring(12, 22);
        this.echo('Date on which notebook2 is modified:' + res1);
    });

    casper.then(function () {
        var z = casper.evaluate(function () {
            $('.icon-trash').click();
        });
    });

    //Comaparing the date and modified cell dates
    casper.then(function () {
        this.test.assertEquals(res, res1, 'notebook was last modified at:' + modidate);
    });

    casper.wait(3000);
    casper.run(function () {
        test.done();
    });
});
