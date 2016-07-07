/* 
 Author: Prateek
 Description:This is a casperjs automated test script to,
 Check whether user is able to load own private notebook from the recent options or not
 */
//Begin Tests
casper.test.begin("Opening our own private notebook", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var title, newtitle, before;
    
    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

    casper.wait(10000);

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and RCLoud logo");
        functions.validation(casper);
        this.wait(4000);
    });

    //Create a new Notebook.
    functions.create_notebook(casper);

    casper.wait(5000);
    //getting the notebook title and modifying it
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

    //Making Notebook as Private
    casper.then(function () {
        this.mouse.move('.jqtree-selected > div:nth-child(1)');
        this.wait(2000)
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

    casper.wait(3000);

    functions.create_notebook(casper);

    casper.wait(2000).then(function () {
        this.click(x(".//*[@id='notebooks-panel-inner']/div/a"));
        console.log("Clicking on RECENT option");
        this.test.assertExists(x(".//*[@id='notebooks-panel-inner']/div/ul"), "@ABCD#", "Prev created Notebook exists");
        this.click(x(".//*[@id='notebooks-panel-inner']/div/ul/li[1]/a"));
        this.wait(4000);
    });

    casper.wait(3000).then(function () {
        var title1 = functions.notebookname(casper);
        this.echo("After loading Notebook from the Recent option notebook name is: " + title1);
        this.test.assertEquals(newtitle, title1, "Opened our own private notebook");
    });

    casper.run(function () {
        test.done();
    });
});