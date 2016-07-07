/* 
 Author: Prateek
 Description:This test describes, Check whether user can make notebook public or not from the assigned group
 */

//Begin Tests
casper.test.begin("Adding Notebook to other Group (other than existing group)", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var GroupName, GroupName1, Title, URL, after, before;

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

    //Creating 1st Group name
    casper.then(function () {
        GroupName = this.evaluate(function () {
            return Math.random().toString(36).substr(2, 5);
        });
        console.log('1st group name is :' + GroupName);
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

    //Creating 1st group
    casper.then(function () {
        console.log("Clicking on create new group")
        this.wait(4000);
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Enter new group name") {
                return GroupName;
            }
        });
        this.click("span.label:nth-child(1)");
        console.log("Create 1st group")
        this.evaluate(function () {
            $('span.btn:nth-child(3)').click();
        });
    });

    //Create one notebook
    functions.create_notebook(casper);

    casper.then(function () {
        Title = this.fetchText("#notebook-title");
        this.echo("Notebook title is : " + Title);
        URL = this.getCurrentUrl();
    });

    functions.create_notebook(casper);

    casper.then(function () {
        this.thenOpen(URL);
        this.wait(8000);
    });
    
    //Click on notebook info icon
    casper.then(function () {
        this.then(function () {
            this.mouse.move('.jqtree-selected > div:nth-child(1)');
            this.waitUntilVisible('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)', function () {
                this.click('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)');
                console.log('Clicking notebook info');
            });
        });
    });

    //Click on Public/Group link
    casper.wait(5000).then(function () {
        this.waitForSelector(".popover-title", function () {
            this.click(".group-link > a:nth-child(1)");
            console.log("clicking on hyperlink")
        });
    });

    //Select group radio button
    casper.wait(7000).then(function () {
        this.waitForSelector("#greenRadio", function () {
            this.click('#greenRadio');
            this.echo("Clicking on group link")
        })
    });

    casper.wait(10000).then(function () {
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Are you sure you want to move notebook") {
                return true;
            }
        });
        this.click("span.btn:nth-child(3)")
        console.log("Notebook added to the 1st group");
    });

    //Validate the group name
    casper.wait(5000).then(function () {
        this.mouse.move('.jqtree-selected > div:nth-child(1)');
        this.waitUntilVisible('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)', function () {
            this.click('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)');
            console.log('Clicking notebook info');
        });
    });

    casper.wait(5000).then(function () {
        this.waitForSelector(".popover-title", function () {
            before = this.fetchText(".group-link > a:nth-child(1)");
            console.log(before);
        });
    });

    // functions.create_notebook(casper);

    //Create 2nd Group
    casper.then(function () {
        GroupName1 = this.evaluate(function () {
            return Math.random().toString(36).substr(2, 10);
        });
        console.log('2nd group name is :' + GroupName1);
    });

    casper.then(function () {
        this.thenOpen(URL);
        this.wait(8000);
    });

    //Click on notebook info icon
    casper.then(function () {
        this.then(function () {
            this.mouse.move('.jqtree-selected > div:nth-child(1)');
            this.waitUntilVisible('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)', function () {
                this.click('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)');
                console.log('Clicking notebook info');
            });
        });
    });

    //Click on Public/Group link
    casper.wait(5000).then(function () {
        this.click(".group-link > a:nth-child(1)");
    });

    //select the group and click ok
    casper.wait(8000).selectOptionByText = function (selector, textToMatch) {
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
        this.wait(2999);
        this.selectOptionByText("select.ng-pristine:nth-child(2)", GroupName);
        console.log("Selecting 1st " + GroupName + "from the drop down menu");
    });

    casper.wait(8000);

    casper.setFilter('page.confirm', function (message) {
        if (msg === "Are you sure you want to move notebook") {
            self.received = message;
            this.echo("message to confirm : " + message);
            return true;
        }
    });


    casper.then(function () {
        casper.setFilter("page.prompt", function (currentValue) {
            this.echo("OPEN ALERT OK");
            return true;
        });
    });

    casper.then(function () {
        this.click("span.btn:nth-child(3)")
        console.log("Notebook added to the 2nd group");
    });

    casper.wait(5000);

    //Validate the group name
    casper.wait(5000).then(function () {
        this.mouse.move('.jqtree-selected > div:nth-child(1)');
        this.waitUntilVisible('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)', function () {
            this.click('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)');
            console.log('Clicking notebook info');
        });
    });

    casper.wait(4000).then(function () {
        this.waitForSelector(".popover-title", function () {
            after = this.fetchText(".group-link > a:nth-child(1)");
            this.test.assertEquals(after, before, "Confirmed that Notebook is assigned to new Group:" + after);
        });
    });

    casper.run(function () {
        test.done();
    });
});
