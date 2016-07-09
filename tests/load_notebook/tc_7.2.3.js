/*
 Author: Prateek
 Description: The notebook will be loaded based on their GitHub URL.
 * The GitHub URL will refer to some existing notebook belonging to the same user
 */

//Begin Test
casper.test.begin("Using GitHub URL of some existing notebook (same user)", 6, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var URL;//Newly created Notebook's URL
    var URL1;//To fetch GitHub URL
    var Notebook_id;//To fetch newly created Notebook ID
   
    var Notebook_id1;//After opening a notebook using load notebook by github URL

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

    // Getting the title of new Notebook
    casper.then(function () {
        console.log(URL = this.getCurrentUrl());
        Notebook_id = URL.substring(41);
        console.log('Newly created notebook id is :' + Notebook_id);
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
                    console.log(URL1 = this.getCurrentUrl());
                    this.test.assertUrlMatch(/gist.github.com*/, 'Notebook opened in github');
                });
            }//if ends
            else {
                console.log('Notebook could not be opened in github');
            }
        });
    });

    functions.open_advanceddiv(casper);

    casper.then(function () {
        functions.open_advanceddiv(casper)
        this.echo("Clicking on dropdown");
        this.wait(2999);
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Enter notebook ID or github URL:") {
                return URL1;
            }
        });
        this.click("#open_from_github");
        this.echo("Opening Notebook");
        this.wait(10000);
    });

    casper.then(function () {
        var url = this.getCurrentUrl();
        this.thenOpen(url);
        this.wait(8000);
        Notebook_id1 = url.substring(41, 73); 
        console.log('After loading Notebook by GitHub URl, the notebook ID is:' + Notebook_id1);
        this.test.assertEquals(Notebook_id, Notebook_id1, "Using GitHub URL of some existing notebook (same user) is opened");
    });

    casper.run(function () {
        test.done();
    });
});

