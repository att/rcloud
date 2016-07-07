/*
 Author: Prateek
 Description:This test describes, Check whether user/admin can add one more members to the that group or not
 */

//Begin Tests
casper.test.begin("Adding 2 member to the group", 3, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var GP = '5ro9';
    var GroupName, before;

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

    //Function to generate group names
    casper.then(function () {
        GroupName = this.evaluate(function () {
            return Math.random().toString(36).substr(2, 4);
        });
        console.log('New group name is :' + GroupName);
    });

    //Open manage group window
    casper.then(function () {
        this.click("li.dropdown > a:nth-child(1)");
        console.log('Opening advanced drop down menu');
        this.evaluate(function () {
            $('#manage_groups').click();
        });
        this.echo('opened manage group dialog box');
        this.wait(2000);
    });

    //Open manage group window
    casper.wait(5000).then(function () {
        this.click("li.dropdown > a:nth-child(1)");
        console.log('Opening advanced drop down menu');
        this.evaluate(function () {
            $('#manage_groups').click();
        });
        this.echo('opened manage group dialog box');
        this.wait(2000);
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
        this.selectOptionByText("select.ng-pristine:nth-child(3)", GP);
        console.log("Selecting just now created " + GP + "from the drop down menu");
    });

    casper.wait(10000);

    casper.then(function () {
        this.click(x(".//*[@id='group-tab']/div[3]/div/div/div[1]"), {keepFocus: true});
        this.page.sendEvent("keypress", casper.page.event.key.Backspace);
        console.log('removing members');
    });

    casper.wait(5000).then(function () {
        this.evaluate(function () {
            $('span.btn:nth-child(3)').click();
        });
    });

    //Open manage group window
    casper.wait(8000).then(function () {
        casper.then(function () {
            this.click("li.dropdown > a:nth-child(1)");
            console.log('Opening advanced drop down menu');
            this.evaluate(function () {
                $('#manage_groups').click();
            });
            this.echo('opened manage group dialog box');
            this.wait(2000);
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

        casper.wait(2000).then(function () {
            this.selectOptionByText("select.ng-pristine:nth-child(3)", GroupName);
            console.log("Selecting just now created group '" + GroupName + "' from the drop down menu");
        });
    });

    casper.wait(5000).then(function () {
        for (var m = 1; m <= 3; m++) {
            before = this.fetchText(x(".//*[@id='group-tab']/div[3]/div/div/div[1]/div[" + m + "]"));
        }
        // this.echo(before);
    });

    casper.wait(5000);

    casper.run(function () {
        test.done();
    });
});