/*
 Author: Prateek
 Description:TThe notebook will be loaded based on their GitHub URL. The GitHub URL will refer to some existing notebook belonging to the 
 * some different user
 */

//Begin Test
casper.test.begin("Using GitHub URL of existing notebook (different user)", 6, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var GitHub_URL; // = 'https://gist.github.com/Prateek032/cca9eab15d6471abcfbd';//Deleted Notebook GitHub_URL of different user
    var new_username = 'tejas1493';
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

    casper.viewport(1024, 768).then(function () {
        this.wait(4000);
        var url = this.getCurrentUrl();
        this.thenOpen(url);
        this.wait(8000);
        var current_title = functions.notebookname(casper);
        this.echo("Title of currently loaded Notebook : " + current_title);
        this.echo("Notebook owner = " + this.fetchText({type: 'css', path: '#notebook-author'}));
    });

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
                    GitHub_URL = this.getCurrentUrl();
                    this.test.assertUrlMatch(/gist.github.com*/, 'Notebook opened in github');
                });
            }//if ends
            else {
                console.log('Notebook could not be opened in github');
            }
        });
    });

   // loging out of RCloud
    casper.viewport(1366, 768).then(function () {
        test.comment('⌚️  Logging out of RCloud and GitHub to check shareable links for anonymous usere ...');
        this.wait(13000);
        this.click("#rcloud-navbar-menu > li:nth-child(7) > a:nth-child(1)");
    });

    casper.then(function () {
        this.wait(7000);
        this.click('#main-div > p:nth-child(2) > a:nth-child(2)')
    });
    casper.then(function () {
        this.wait(7000);
        this.click('.btn');
        this.wait(4000);
    });

    casper.wait(3000);

    //Login to RCloud with new user
    casper.then(function () {
        this.thenOpen('http://127.0.0.1:8080/login.R');
        this.wait(13000);
        functions.login(casper, new_username, new_user_password, rcloud_url);
    });

    casper.then(function () {
        var url = this.getCurrentUrl();
        this.thenOpen(url);
        this.wait(5000);
    });

    casper.then(function () {
        functions.open_advanceddiv(casper);
        this.echo("Clicking on dropdown");
        this.wait(2999);
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Enter notebook ID or github URL:") {
                return GitHub_URL;
            }
        });
        this.click("#open_from_github");
        this.echo("Opening Notebook using Load Notebook ID");
        this.wait(10000);
    });

    casper.then(function () {
        var url = this.getCurrentUrl();
        this.thenOpen(url);
        this.wait(8000);
        Notebook_id1 = url.substring(41, 73);
        console.log(Notebook_id1);
        var current_title = functions.notebookname(casper);
        this.echo("Title of currently loaded Notebook : " + current_title);
        this.echo("Notebook owner = " + this.fetchText({type: 'css', path: '#notebook-author'}));
        console.log('Using URL of the notebook of different user is opened using Load notebook id/URL');
    });

    casper.run(function () {
        test.done();
    });
});
