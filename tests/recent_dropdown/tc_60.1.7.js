/*
 Author: Prateek
 Description: This is a casperjs automated test script to, Check whether user is able to load notebook from the recernt options or not
 */

//Begin Test
casper.test.begin("Opening private notebook of other user", 15, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var new_username = 'tejas1493';
    var new_user_password = 'musigma12';
    var User1_notebookid, User2_notebookid, USER1_URL1, USER2_URL2;
    var before;
    var notebook_status = '(read-only)';

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

    casper.wait(10000);

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.waitUntilVisible('#run-notebook', function () {
        console.log("Logging In as USER1");
        this.echo('waiting for page to open completely');
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(4000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
    });

    //Create a new Notebook.
    functions.create_notebook(casper);

    casper.viewport(1024, 768).then(function () {
        this.wait(3000);
        title = functions.notebookname(casper);
        this.echo("Present title of notebook: " + title);
        var z = casper.evaluate(function triggerKeyDownEvent() {
            jQuery("#notebook-title").text("@ABCD#");
            var e = jQuery.Event("keydown");
            e.which = 13;
            e.keyCode = 13;
            jQuery("#notebook-title").trigger(e);
            return true;
        });
        newtitle = functions.notebookname(casper);
        this.echo("Modified notebook title: " + newtitle);

    });

    // Getting the title of new Notebook
    casper.then(function () {
        before = this.fetchText('#notebook-author');
        console.log("Author of the Notebook : " + before);
        initial_title = functions.notebookname(casper);
        this.echo("New Notebook title : " + initial_title);
    });

    //getting Notebook ID
    casper.viewport(1024, 768).then(function () {
        USER1_URL1 = this.getCurrentUrl();
        User1_notebookid = USER1_URL1.substring(41);
        this.echo("The Notebook Id: " + User1_notebookid);
    });

    //USER1 : logout of RCloud & Github
    //functions.logout(casper);
    casper.then(function () {
        this.click({type: 'xpath', path: ".//*[@id='rcloud-navbar-menu']/li[7]/a"});
            console.log('Logging out of RCloud');
            this.wait(3000);
    });

    casper.wait(1000).then(function () {
        this.click({type: 'xpath', path: ".//*[@id='main-div']/p[2]/a[2]"}, "Logged out of Github");
        console.log('Logging out of Github');
        this.wait(10000);
    });

    casper.wait(1000).then(function () {
        this.click(".btn");
        console.log('logged out of Github');
        this.wait(2000).then(function(){
            this.echo("The url after logging out of Github : " + this.getCurrentUrl());
            this.test.assertTextExists('GitHub', "Confirmed that successfully logged out of Github");
        });
        console.log('Logging out of USER 1')
    });

    
    //USER 2: Login to RCloud with new user
    casper.then(function () {
        this.thenOpen('http://127.0.0.1:8080/login.R');
        this.wait(3000);
        functions.login(casper, new_username, new_user_password, rcloud_url);
    });

    casper.wait(2000).then(function () {
        var url = this.getCurrentUrl();
        this.thenOpen(url);
    });

    casper.then(function () {
        this.thenOpen("http://127.0.0.1:8080/edit.html?notebook=" + User1_notebookid);
        this.wait(5000);
    });

    casper.then(function () {
        var temp = this.fetchText({type: 'css', path: "#readonly-notebook"});
        this.test.assertEquals(temp, notebook_status, "The notebook which belongs to other user is loaded in Read Only Mode");
    });

    functions.create_notebook(casper);

    casper.wait(2000).then(function () {
        USER2_URL2 = this.getCurrentUrl();
        User2_notebookid = USER2_URL2.substring(41);
        this.echo("The Notebook Id: " + User2_notebookid);
    });

    //USER2: Logout
    casper.then(function () {
        this.click({type: 'xpath', path: ".//*[@id='rcloud-navbar-menu']/li[7]/a"});
            console.log('Logging out of RCloud');
            this.wait(3000);
    });

    casper.wait(2000).then(function () {
        this.click({type: 'xpath', path: ".//*[@id='main-div']/p[2]/a[2]"}, "Logged out of Github");
        console.log('Logging out of Github');
        
    });

    casper.wait(1000).then(function () {
        this.click(".btn");
        console.log('logged out of Github');
        this.wait(2000).then(function(){
            this.echo("The url after logging out of Github : " + this.getCurrentUrl());
            this.test.assertTextExists('GitHub', "Confirmed that successfully logged out of Github");
        });
        console.log("Logging out of as USER2");
    });

    //User1: Login
    casper.wait(4000);
    casper.viewport(1024, 768).then(function () {
        this.thenOpen('http://127.0.0.1:8080/login.R');
        this.wait(13000);
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.waitUntilVisible('#run-notebook', function () {
        console.log("Logging In as USER1");
        this.echo('waiting for page to open completely');
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
    });

    casper.then(function () {
        this.thenOpen(USER1_URL1);
        this.wait(4000);
    });

    //Making Notebook as Private
    casper.wait(3000).then(function () {
        console.log("Making User1's Notebook as Private");
        this.mouse.move('.jqtree-selected > div:nth-child(1)');
        this.wait(2000);
        this.click(".jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)")
        before = this.fetchText(".group-link > a:nth-child(1)");
        this.echo(before);
        this.then(function () {
            this.wait(3000);
            this.click('.group-link > a:nth-child(1)')
        });
        this.then(function () {
            this.click(x(".//*[@id='yellowRadio']"));
            console.log("Selecting Private radio button");
            this.wait(4000);
            this.setFilter("page.prompt", function (msg, currentValue) {
                this.echo(msg);
                if (msg === "Are you sure you want to make notebook @ABCD# truly private?") {
                    return TRUE;
                }
            });
            this.click('span.btn:nth-child(3)');
            this.echo('Notebook is Private ');
        });
    });

    //USER1 : LogOut
    casper.wait(3000).then(function () {
        this.click({type: 'xpath', path: ".//*[@id='rcloud-navbar-menu']/li[7]/a"});
            console.log('Logging out of RCloud');
            this.wait(3000);
    });

    casper.wait(2000).then(function () {
        this.click({type: 'xpath', path: ".//*[@id='main-div']/p[2]/a[2]"}, "Logged out of Github");
        console.log('Logging out of Github');
        
    });

    casper.wait(2000).then(function () {
        this.click(".btn");
        console.log('logged out of Github');
        this.wait(2000).then(function(){
            this.echo("The url after logging out of Github : " + this.getCurrentUrl());
            this.test.assertTextExists('GitHub', "Confirmed that successfully logged out of Github");
        });        
        console.log("Logging out of as USER1");
    });

    //USER 2: Login to RCloud with new user
    casper.then(function () {
        this.thenOpen('http://127.0.0.1:8080/login.R');
        this.wait(3000);
        functions.login(casper, new_username, new_user_password, rcloud_url);
    });

    casper.then(function () {
        console.log("Logging In as User 2");
        functions.validation(casper);
    });

    casper.wait(1000).then(function () {
        this.click(x(".//*[@id='notebooks-panel-inner']/div/a"));
        console.log("Clicking on RECENT option");
        this.test.assertExists(x(".//*[@id='notebooks-panel-inner']/div/ul"), "@ABCD#", "Prev created Notebook exists");
        console.log("Opening User1's Private Notebook from Recent option")
        // this.click('.recent-notebooks-list > li:nth-child(1) > a:nth-child(1)'); 
        // this.wait(4000);
        this.thenOpen("http://127.0.0.1:8080/edit.html?notebook=" + User1_notebookid);
    });

    casper.wait(2000).then(function () {
        this.waitForSelector(x(".//*[@id='fatal-dialog']"), function(){
            var msg= this.fetchText(x(".//*[@id='fatal-dialog']/div/div/div/div/p"));
            this.echo(msg);
            this.test.assertMatch(msg,/The notebook is private and you are not the owner/, "User 2 tried to open User1's Private Notebook so it throws error saying :The notebook is private and you are not the owner")
        });        
    });
    
    casper.run(function () {
        test.done();
    });
});
