/**
 * Created by Prateek.Naik
 */
//Begin Tests
casper.test.begin("Creating a new group from Manage group option", 3, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_name, Rename, ID1, ID2;

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

    //Function to generate group names
    casper.then(function () {
        ID2 = this.evaluate(function () {
            return Math.random().toString(36).substr(2,5);
        });
    });

    //Creating a group
    casper.then(function () {
        this.click("li.dropdown > a:nth-child(1)");
        console.log('Clicking on Advanced drop down menu');
        this.evaluate(function () {
            $('#manage_groups').click();
        });
        this.echo('opened manage group dialog box');
        this.wait(2000);
    });

    casper.then(function () {
        ID1 = this.fetchText('select.ng-pristine:nth-child(3) > option:nth-child(1)');
        this.echo('The group which is going to be renamed is:' + ID1);
    });

    //renaming the group
    casper.then(function () {

        casper.then(function () {
            this.setFilter("page.prompt", function (msg, currentValue) {
                if (msg === "Are you sure you want to rename group ") {
                    return true;
                }
            });
        });
        casper.then(function () {
            this.setFilter("page.prompt", function (msg, currentValue) {
                if (msg === "Rename group " + ID1) {
                    return "RRRRRRR";
                }
            });
        });

        casper.then(function () {
            this.click("span.label:nth-child(4)");
            console.log("renamed the newly created group");
        });
    });

    casper.wait(6000).then(function () {
        var ID50 = this.fetchText('select.ng-pristine:nth-child(3) > option:nth-child(1)');
        this.echo('After renaming group ' + ID1 + ' the group names is:' + ID50);
    });

    casper.run(function () {
        test.done();
    });
});

