//Begin Tests

casper.test.begin("Disable an extension from setting div",6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));

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
        if (this.visible(" .icon-sun")) {
            console.log('Worksapce div Visible');
            //Disabling any one of the extension
            this.then(function () {
                this.mouse.click({type: "xpath", path: ".//*[@id='settings-body']/div[6]/label/input"});
                console.log('Clicking on disable field');
                this.sendKeys({type: "xpath", path: ".//*[@id='settings-body']/div[6]/label/input"}, "rcloud.enviewer");
            });

            functions.create_notebook(casper);

            casper.then(function () {
                this.reload();
                this.wait(5000);
                functions.validation(casper);
            });

            casper.then(function () {
                this.test.assertVisible(".icon-table");
                console.log("Workspace div is disabled");
            })
        }
        else {
            console.log("Workspace div is already disabled please enable it");
        }

    });

    casper.run(function () {
        test.done();
    });
});
