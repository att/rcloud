casper.test.begin("Retain the extension name", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var disable_text = 'rcloud.viewer';

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

    //Opening settings div
    casper.then(function () {
        if (this.visible("div.checkbox:nth-child(1)")) {
            this.echo('Settings div already open');
        }
        else {
            console.log('Opening settngs div');
            this.click(x(".//*[@id='accordion-left']/div[3]/div[1]"));
            this.wait(3000);
        }
    });

    //Clearing Disable field if any text exists
    casper.then(function () {
        this.click({type: "xpath", path: ".//*[@id='settings-body']/div[6]/label/input"});
        for (var l = 1; l <= 30; l++) {
            this.click(x(".//*[@id='settings-body']/div[6]/label/input"), {keepFocus: true});
            this.page.sendEvent("keypress", casper.page.event.key.Delete);
        }
        for (var i = 1; i <= 30; i++) {
            this.click(x(".//*[@id='settings-body']/div[6]/label/input"), {keepFocus: true});
            this.page.sendEvent("keypress", casper.page.event.key.Backspace);
        }
        this.click("#command-prompt > textarea:nth-child(1)");

        this.click({type: "xpath", path: ".//*[@id='settings-body']/div[5]/label/input"});
        for (var l = 1; l <= 30; l++) {
            this.click(x(".//*[@id='settings-body']/div[5]/label/input"), {keepFocus: true});
            this.page.sendEvent("keypress", casper.page.event.key.Delete);
        }
        for (var i = 1; i <= 30; i++) {
            this.click(x(".//*[@id='settings-body']/div[5]/label/input"), {keepFocus: true});
            this.page.sendEvent("keypress", casper.page.event.key.Backspace);
        }
        this.click("#command-prompt > textarea:nth-child(1)");
        //console.log("deleting the text from the field, if prsent");
    })

    //Disable  'rcloud.viewer'
    casper.then(function () {
        console.log('By default all rcloud.viewer is enabled, hence disabling it')
        this.wait(3000);
        this.click({type: "xpath", path: ".//*[@id='settings-body']/div[6]/label/input"});
        console.log('Clicking on disable field');
        this.sendKeys(x(".//*[@id='settings-body']/div[6]/label/input"), disable_text, {keepFocus: true});
        this.click("#command-prompt > textarea:nth-child(1)");

    });

    //Refreshing page to see the changes
    casper.then(function () {
        this.reload();
        this.wait(8000);
        console.log("Refreshing page to see the changes")
    });

    //checking for dataframe div
    casper.then(function () {
        this.test.assertNotVisible(".icon-table", "Dataframe div is disabled");
    });

    casper.then(function (){
        this.click(x(".//*[@id='settings-body']/div[6]/label/input"), {keepFocus: true});
        for (var k = 1; k <= 30; k++) {
            this.click(x(".//*[@id='settings-body']/div[6]/label/input"), {keepFocus: true});
            this.page.sendEvent("keypress", casper.page.event.key.Delete);
        }
        for (var a = 1; a <= 30; a++) {
            this.click(x(".//*[@id='settings-body']/div[6]/label/input"), {keepFocus: true});
            this.page.sendEvent("keypress", casper.page.event.key.Backspace);
        }
        this.click("#command-prompt > textarea:nth-child(1)");
    });

    casper.then(function () {
        this.reload();
        this.wait(8000);
        console.log("Refreshing page to see the changes")
    });

    //Enable 'rcloud.viewer'
    casper.then(function () {
        console.log('By default all rcloud.viewer is enabled, hence disabling it')
        this.wait(3000);
        this.click({type: "xpath", path: ".//*[@id='settings-body']/div[5]/label/input"});
        console.log('Clicking on disable field');
        this.sendKeys(x(".//*[@id='settings-body']/div[5]/label/input"), disable_text, {keepFocus: true});
        this.click("#command-prompt > textarea:nth-child(1)");

    });

    casper.then(function () {
        this.reload();
        this.wait(8000);
        console.log("Refreshing page to see the changes")
    });

    casper.then(function () {
        this.reload();
        this.wait(8000);
        console.log("Refreshing page again to see the retained extention name")
    });

    casper.then(function (){
        var q = this.fetchText(x(".//*[@id='settings-body']/div[5]/label/input"));
        this.echo('Text entered in enable extension filed is: ' + q);
        this.test.assertEquals(disable_text,q,"Text entered in the enable field are getting retained")
    })

    //checking for dataframe and workspace divs
    casper.then(function () {
        this.test.assertVisible(".icon-table", "Dataframe div is Enabled");
    });

    casper.run(function () {
        test.done();
    });
});