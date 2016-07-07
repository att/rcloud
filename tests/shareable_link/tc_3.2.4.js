/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that After
 forking the notebook, if the notebook is opened in Github , it opens under the local user's repository
 */

//Begin Tests

casper.test.begin("Open Notebook In Github after Forking", 14, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_id = "82198d654e36c7e86761";//contains the notebook id to be searched
    var gist_owner;

    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
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

    casper.viewport(1366, 768).thenOpen('http://127.0.0.1:8080/view.html?notebook=' + notebook_id, function () {
        this.wait(7000);
        this.echo(this.getCurrentUrl());
    });

    casper.viewport(1366, 768).then(function () {
        this.test.assertUrlMatch(/view.html/, 'view.html page for given user loaded');
        //verify that only output div is visible and editable icon exists which proves that the notebook is currently not in Editable
        //form
        this.test.assertVisible('#edit-notebook > i:nth-child(1)', 'Edit option visible which proves that notebook currently is uneditable');
        this.test.assertNotVisible('div:nth-child(3) > div:nth-child(2) > pre:nth-child(2) > code:nth-child(1)', 'output div visible');
        this.test.assertNotVisible('div:nth-child(3) > div:nth-child(2) > pre:nth-child(1) > code:nth-child(1)', 'source code not visible');
    });

    //clicking on the Edit icon and verifying if the main.html page opens
    casper.viewport(1024, 768).then(function () {
        var z = casper.evaluate(function () {
            $('#edit-notebook').click();
        });
        this.wait(8000);
    });

    casper.viewport(1024, 768).then(function () {
        this.test.assertUrlMatch(/edit.html*/, 'main.html for the notebook has been loaded');
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(5000);
    });

    //fork the notebook
    functions.fork(casper);

    //open the notebook in Github 
    functions.open_advanceddiv(casper);
    casper.viewport(1366, 768).then(function () {

        this.waitForSelector({type: 'xpath', path: ".//*[@id='open_in_github']"}, function () {
            console.log("Link for opening notebook in github found. Clicking on it");

            if (this.click({type: 'xpath', path: ".//*[@id='open_in_github']"})) {

                this.wait(10000);
                /*this.waitForPopup(/gist.github.com/, function () {
                    this.test.assertEquals(this.popups.length, 2);
                });*/
                this.wait(11000);

                this.viewport(1366, 768).withPopup(/gist.github.com/, function () {
                    this.wait(4000);
                    console.log("The Github url opened: " + this.getCurrentUrl());
                    this.test.assertUrlMatch(/gist.github.com*/, 'Notebook opened in github');
                    //verifying that the gist opened belongs to different user
                    gist_owner = this.fetchText({type: 'css', path: '.url > span:nth-child(1)'});
                    this.wait(2000);
                    this.echo(gist_owner + ' is the current owner of the notebook');
                    this.test.assertEquals(gist_owner, github_username, 'hence confirmed that notebook opened as gist of local user');
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

