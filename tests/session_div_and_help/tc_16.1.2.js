/* 
 Author: Prateek
 Description:    This is a casperjs automated test script showing that executing an invalid R command following a '?' in any cell
 (R/Markdown/Prompt) will not display the description of the particular code in Help div. It will produce an error
 */

//Begin Tests

casper.test.begin("Invalid R command in Help div", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var help_content = "hello";//invalid R command
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

    casper.viewport(1366, 768).then(function () {
        if (this.visible('#help-form')) {
            this.echo('Help div is open');
            this.wait(5000);
        }
        else {
            this.echo('Help div is not open,hence opening it');
            this.wait(5000);
            this.click({type: 'css', path: '#accordion-left > div:nth-child(4) > div:nth-child(1)'});
            this.wait(5000);
        }
        this.sendKeys('#input-text-help', help_content);
        this.wait(6000);
        if (this.click(x(".//*[@id='help-form']/div/div/button"))) {
            this.echo('topic for help entered successfully');
        }
        else {
            this.echo('could not enter help content');
        }
        this.wait(8000);
    });

    casper.wait(3000).then(function () {
        this.page.switchToChildFrame(0)
        this.wait(5000);
        console.log('validating that the appropriate documentation is displayed for the incorrect R command entered');
        var z = this.fetchText('html>body>h2');
        this.echo(z);
        //});

        //casper.then(function () {

        this.test.assertSelectorHasText({
            type: 'css',
            path: 'html>body>h2'
        }, "No help found", "Confirmed that no Help content shown for invalid R command");
    });

    casper.run(function () {
        test.done();
    });
});
