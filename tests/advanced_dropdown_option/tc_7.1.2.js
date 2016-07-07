/* 
 Author: Prateek
 Description:    This is a casperjs automated test script for showing that When a notebook belonging to some different user is loaded and not forked,
 the gist of notebook can be opened in Github by the current user although in the different user's repository
 */

//Begin Tests

casper.test.begin(" Loaded Notebook of some different user (not forked)", 7, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_id = "68169c21a8c728c7f83f";
    var title;

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

    //open notebook belonging to some different user
    casper.viewport(1366, 768).thenOpen('http://127.0.0.1:8080/main.html?notebook=' + notebook_id, function () {
        this.wait(10000);
        this.then(function () {
            title = functions.notebookname(casper);
            this.echo("Notebook title : " + title);
            this.wait(3000);
        });
    });

    //get the notebook owner's name and verify that it belongs to a different user
    casper.then(function () {
        var author = this.fetchText({type: 'css', path: '#notebook-author'});
        this.echo("Notebook author: " + author);
        this.test.assertNotEquals(author, github_username, "Confirmed that notebook belonging to different user has been opened");
    });

    //open the Advanced Dropdown 
    functions.open_advanceddiv(casper);

    //open the notebook in Github 
    casper.viewport(1366, 768).then(function () {

        this.waitForSelector({type: 'css', path: '#open_in_github'}, function () {
            console.log("Link for opening notebook in github found. Clicking on it");

            if (this.click({type: 'css', path: '#open_in_github'})) {

                this.wait(7000);
                this.viewport(1366, 768).waitForPopup(/gist.github.com/, function () {
                    this.test.assertEquals(this.popups.length, 1);

                });
                this.wait(11000);
                this.viewport(1366, 768).withPopup(/gist.github.com/, function () {
                    this.wait(4000);
                    this.test.assertUrlMatch(/gist.github.com*/, 'Notebook opened in github');
                    //verifying that the gist opened belongs to local user
                    this.wait(8000);
                    var gist_user = this.fetchText({type: 'css', path: '.author > span:nth-child(1) > a:nth-child(1)'});
                    this.echo("Gist owner is " + gist_user);
                    this.test.assertNotEquals(gist_user, github_username, 'verified that the gist belongs to the different user');
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
