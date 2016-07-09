//Begin Tests

casper.test.begin("Create notebook folder using Notebook prefix", 5,function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var title;
    var notebook_prefix = 'Prefix/';

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

    casper.then(function () {
        if (this.click("div.checkbox:nth-child(1)")) {
            this.echo('Settings div already open');
        }
        else {
            console.log('Opening settngs div');
            this.click('#accordion-left > div:nth-child(3) > div:nth-child(1)');
            console.log('clicking on Settings div panel to open it');
            this.wait(3000);
        }
    });

    casper.then(function () {
        for (var k = 1; k <= 10; k++) {
            this.click(x(".//*[@id='settings-body']/div[7]/label/input"), {keepFocus: true});
            this.page.sendEvent("keypress", casper.page.event.key.Delete);
        }

        for (var a = 1; a <= 30; a++) {
            this.click(x(".//*[@id='settings-body']/div[7]/label/input"), {keepFocus: true});
            this.page.sendEvent("keypress", casper.page.event.key.Backspace);
        }
        this.click("#command-prompt > textarea:nth-child(1)");
    });

    casper.then(function () {
        this.wait(2000);
        this.sendKeys(x(".//*[@id='settings-body']/div[7]/label/input"), notebook_prefix, {keepFocus: true});
        this.page.sendEvent("keypress", casper.page.event.key.Enter);
        this.click("#command-prompt > textarea:nth-child(1)");
        this.wait(3000);
    });

    functions.create_notebook(casper);

    casper.then(function () {
        var s = this.fetchText(x(".//*[@id='notebook-title']"));
        var n1 = s.substring(0,7);
        this.echo('Notebook prefix name is: ' + n1);
        this.test.assertEquals(n1, notebook_prefix, "Newly created notebook is created under" + notebook_prefix + "folder");
    });

    functions.create_notebook(casper);

    casper.then(function () {
        var j = this.fetchText(x(".//*[@id='notebook-title']"));
        var m = j.substring(0,7)
        this.echo('Notebook prefix name is: ' + m);
        this.test.assertEquals(m, notebook_prefix, "Newly created notebook is created under" + notebook_prefix + "folder");
    });

    casper.then(function (){
        functions.delete_notebooksIstarred(casper);
        this.wait(8000);
        functions.delete_notebooksIstarred(casper);
        this.wait(8000);
    });

    casper.then(function () {
        for (var j = 1; j <= 20; j++) {
            this.click(x(".//*[@id='settings-body']/div[7]/label/input"), {keepFocus: true});
            this.page.sendEvent("keypress", casper.page.event.key.Delete);
            // this.page.sendEvent("keypress", casper.page.event.key.Enter);
            }
        for (var u= 1; u <= 30; u++) {
            this.click(x(".//*[@id='settings-body']/div[7]/label/input"), {keepFocus: true});
            this.page.sendEvent("keypress", casper.page.event.key.Backspace);
        }
        this.click("#command-prompt > textarea:nth-child(1)");
        this.wait(2000);
    });

    casper.run(function () {
        test.done();
    });
});
