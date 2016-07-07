/* 
 Author: Prateek
 Description:    This is a casperjs automated test script for showing that the gist of notebook belonging to same user can be opened in Github
 by selecting the link for "open in Github" under the Advanced drop-down link present on the top-right corner of the page
 */

//Begin Tests

casper.test.begin("Notebook belonging to the same user is opened in Github", 5, function suite(test) {

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

    //Create a new Notebook.
    functions.create_notebook(casper);

    //open the Advanced Dropdown 
    functions.open_advanceddiv(casper);

    //open the notebook in Github 
    casper.viewport(1366, 768).then(function () {
        this.waitForSelector({type: 'css', path: '#open_in_github'}, function () {
            console.log("Link for opening notebook in github found. Clicking on it");
            if (this.click({type: 'css', path: '#open_in_github'})) {
                this.wait(11000);
                this.viewport(1366, 768).withPopup(/gist.github.com/, function () {
                    this.wait(4000);
                    console.log(this.getCurrentUrl());
                    this.test.assertUrlMatch(/gist.github.com*/, 'Notebook opened in github');
                    //verifying that the gist opened belongs to local user
                    this.wait(8000);
                    var gist_user = this.fetchText({type: 'css', path: '.url > span:nth-child(1)'});
                    this.echo("Gist owner is " + gist_user);
                    this.test.assertEquals(gist_user, github_username, 'verified that the gist belongs to the local user');
                });
            }//if ends
            else {
                console.log('Notebook could not be opened in github');
            }
        });
    });

	casper.run(function () {
        test.done();
    });
});

