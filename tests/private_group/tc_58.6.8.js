/*
 Author: Prateek
 Description:This test describes, Check whether the member of the group can be able to reassign the Notebook to some of his Groups
 */
//Begin Tests
casper.test.begin(" Assigning notebook to other Group as a member of that group ", 8, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var GroupName, title, URL, NotebookID, temp, temp1;
    var new_username = 'attMusigma';
    var new_user_password = 'musigma12';

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
    casper.then(function () {
        URL = this.getCurrentUrl();
        NotebookID = URL.substring(41);
        console.log("New Notebook ID is " + NotebookID);
        title = this.fetchText(".jqtree-selected > div:nth-child(1) > span:nth-child(1)");
        this.echo("New notebook name = " + title);
    });

    //Function to generate group names
    casper.then(function () {
        GroupName = this.evaluate(function () {
            return Math.random().toString(36).substr(2, 3);
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

    //Creating a group
    casper.then(function () {
        console.log("Clicking on create new group");
        this.wait(4000);
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Enter new group name") {
                return GroupName;
            }
        });
        this.click("span.label:nth-child(1)");
        console.log("Create new group")
    });

    casper.wait(9000);

    casper.then(function () {
        casper.wait(9000);
        this.click(x(".//*[@id='group-tab']/div[2]/div/div/div[1]"));
        this.echo('Clicking admin   field');
        this.sendKeys(x(".//*[@id='group-tab']/div[2]/div/div/div[1]"), new_username);
        this.wait(3000);
        this.click(x(".//*[@id='group-tab']/div[2]/div/div/div[2]/div/div"), new_username, {keepFocus: true});
        this.echo('adding 2nd admin to the group');
    });

    casper.then(function (){
        this.click(x(".//*[@id='group-tab']/div[3]/div/div/div[1]"));
        this.wait(4000);
        this.echo('Clicking member field to add member');
        this.sendKeys(x(".//*[@id='group-tab']/div[3]/div/div/div[1]"), 'iPrateek032');
        this.wait(3000);
        this.click(x(".//*[@id='group-tab']/div[3]/div/div/div[2]/div/div"), 'iPrateek032', {keepFocus: true});
        this.echo('adding 2nd admin to the group');
    });

    casper.wait(2000).then(function () {
        this.evaluate(function () {
            $('span.btn:nth-child(3)').click();
        });
        this.wait(1000);
        this.echo('Inserted both the member to the group');
    });

    casper.wait(4000);

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
    casper.wait(5000);

    casper.then(function () {
        this.click(".group-link > a:nth-child(1)");
    });

    casper.wait(4000);

    //Select group radio button
    casper.then(function () {
        this.click('#greenRadio');
    });

    casper.wait(4000);

    //select the group and click ok
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
        this.wait(2999);
        this.selectOptionByText("select.ng-pristine:nth-child(2)", GroupName);
        console.log("Selecting 1st '" + GroupName + "' from the drop down menu");
    });

    casper.wait(5000);

    casper.then(function () {
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Are you sure you want to move notebook" + title + "to group" + GroupName + "?") {
                return true;
            }
        });
        this.click("span.btn:nth-child(3)");
        console.log("Notebook added to the 1st group");
    });

    casper.wait(4000);

    casper.then(function () {
        this.mouse.move('.jqtree-selected > div:nth-child(1)');
        this.waitUntilVisible('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)', function () {
            this.click('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)');
            console.log('Clicking notebook info');
        });
    });

    casper.then(function () {
        this.wait(2000);
        temp = this.getElementInfo(".group-link > a:nth-child(1)").tag;
    });

    casper.wait(2000);

    casper.then(function () {
        this.click("#rcloud-navbar-menu > li:nth-child(7) > a:nth-child(1)");
        console.log('User1 Logging out of RCloud');
        this.wait(3000);
    });

    casper.wait(5000);

    casper.then(function () {
        this.click("#main-div > p:nth-child(2) > a:nth-child(2)");
        console.log('Logging out of Github');
        this.wait(10000);
    });

    casper.then(function () {
        this.click(".btn");
        console.log('logged out of Github');
        this.wait(7000);
        this.echo("The url after logging out of Github : " + this.getCurrentUrl());
        this.test.assertTextExists('GitHub', "Confirmed that successfully logged out of Github");
    });

    casper.then(function () {
        this.thenOpen('http://127.0.0.1:8080/login.R');
        this.wait(13000);
        functions.login(casper, new_username, new_user_password, rcloud_url);
    });

    casper.then(function () {
        console.log("Logging In as User 2");
        functions.validation(casper);
    });

    casper.then(function () {
        this.thenOpen(URL);
    });

    casper.wait(12000);

    casper.wait(2000).then(function () {
        var title1 = this.fetchText({type: 'xpath', path: '//*[@id="notebook-title"]'});
        this.echo("Current loaded Noteb0ok : " + title1);
        this.test.assertEquals(title, title1, "Confirmed that Member can also access the Notebbok, which is assigned to the Group");   
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

    //select the group and click ok
    casper.wait(5000).then(function (){
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
    });

    casper.then(function () {
        this.wait(2999);
        this.selectOptionByText("select.ng-pristine:nth-child(2)", GroupName);
        console.log("Selecting 1st '" + GroupName + "' from the drop down menu");
    });

    casper.wait(5000);

    casper.then(function (){
        this.click(x(".//*[@id='group-tab']/div[3]/div/div/div[1]"), {keepFocus: true});
        this.page.sendEvent("keypress", casper.page.event.key.Delete);
    });

    casper.then(function (){
        this.click(x(".//*[@id='group-tab']/div[3]/div/div/div[1]"), {keepFocus: true});
        this.page.sendEvent("keypress", casper.page.event.key.Backspace);
    });

    casper.wait(5000);

    casper.then(function (){
        this.click(x(".//*[@id='protection-app']/div/div/div[3]/span[2]"));
    });


    casper.wait(5000);

    casper.run(function () {
        test.done();
    });
});
