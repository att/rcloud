/* 
 Author: Prateek
 Description:This is a casperjs automated test script for showing that,The user should be able to import multiple notebooks simultaneously by 
 specifying their Notebook IDs
*/

//Begin Tests
casper.test.begin("Import External Notebooks without Prefix", 3, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var Notebook_Name = 'Reading xls file'; //Importing notebook's name
    var Notebook_Name1 = 'slowbookJUst'; //Importing notebook's name

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });
    casper.wait(10000);

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting\n\
     if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
    });

    //open the Advanced Dropdown 
    functions.open_advanceddiv(casper);

    casper.then(function () {
        this.evaluate(function () {
            $('#import_notebooks').click();
        });
        this.echo('opened import notebook dialog box');
        this.wait(2000);
        casper.evaluate(function () {
            $('#import-gists').val('9ae0235877d1152511df','\9abb01c4c0fc42bdbe8f');
        });
        this.echo('Entering notebook ID');
        this.wait(2000);
        this.evaluate(function () {
            $('#import-notebooks-dialog span.btn-primary').click();
            console.log("Clicking on import button");
        });
    });

    casper.wait(2000);

    casper.selectOptionByText = function (selector, textToMatch) {
        this.evaluate(function (selector, textToMatch) {
            var select = document.querySelector(selector),
                found = false;
            Array.prototype.forEach.call(select.children, function (opt, i) {
                if (!found && opt.innerHTML.indexOf(textToMatch) !== -1) {
                    select.selectedIndex = i;
                    this.echo(i)
                }
            });
        }, selector, textToMatch);
    };

    casper.then(function () {
        this.selectOptionByText("ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > div:nth-child(1) > span:nth-child(1)", Notebook_Name);
        console.log("Imported Notebook '" + Notebook_Name +"' is visible under my notebook tree")
    });

    casper.selectOptionByText = function (selector, textToMatch) {
        this.evaluate(function (selector, textToMatch) {
            var select = document.querySelector(selector),
                found = false;
            Array.prototype.forEach.call(select.children, function (opt, i) {
                if (!found && opt.innerHTML.indexOf(textToMatch) !== -1) {
                    select.selectedIndex = i;
                }
            });
        }, selector, textToMatch);
    };

    casper.then(function () {
        this.selectOptionByText("ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > div:nth-child(1) > span:nth-child(1)", Notebook_Name1);
        console.log("Imported Notebook '" + Notebook_Name1 +"' is visible under my notebook tree")
    });

    casper.run(function () {
        test.done();
    });
});

