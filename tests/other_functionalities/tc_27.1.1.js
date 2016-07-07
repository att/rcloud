/*
 Author: Prateek
 Description:    This is a casperjs automated test script for showing that the existing cells are renamed in GitHub immediately after the user
 clicks on insert cell
 */

//Begin Tests
casper.test.begin("Inserting a new cell in between", 8, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var title, cellname, githuburl, URL_RC;

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
        title = functions.notebookname(casper);
        this.echo("Notebook title : " + title);
        this.wait(2000);
    });

    //Added a new cell
    functions.addnewcell(casper);

    //Add contents to this cell and then execute it using run option
    functions.addcontentstocell(casper, "45");

    // casper.wait(6000);

    //Added another new cell
    casper.then(function () {
        this.click("div.cell-control-bar:nth-child(1) > span:nth-child(1) > i:nth-child(1)");
        console.log("creating one more cell")
    })

    //Add contents to the second cell and then execute it using run option
    casper.wait(5000).viewport(1366, 768).then(function () {
        this.sendKeys(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), "'RCLOUD'");
        this.wait(2000);
        this.click(x(".//*[@id='part2.R']/div[2]/div[2]/span[1]/i"));
        this.wait(5000);
        this.echo("executed contents of second cell");

    });

    //getting Notebook ID
    var notebookid;
    casper.viewport(1024, 768).then(function () {
        URL_RC = this.getCurrentUrl();
        notebookid = URL_RC.substring(41);
        this.echo("The Notebook Id: " + notebookid);
        githuburl = "https://gist.github.com/" + github_username + "/" + notebookid;
    });

    //Open Notebook in GitHub
    casper.then(function () {
        test.comment('⌚️  Opening Notebook in GitHub ...');
        casper.viewport(1366, 768).then(function () {
            functions.open_advanceddiv(casper);
            this.waitForSelector({type: 'css', path: '#open_in_github'}, function () {
                console.log("Link for opening notebook in GitHub found. Clicking on it");
                if (this.click({type: 'css', path: '#open_in_github'})) {
                    this.wait(11000);
                    this.viewport(1366, 768).withPopup(/gist.github.com/, function () {
                        this.wait(4000);
                        console.log(this.getCurrentUrl());
                        this.test.assertUrlMatch(/gist.github.com*/, 'Notebook opened in GitHub');
                        cellname = this.fetchText({
                            type: 'xpath',
                            path: '/html/body/div/div[2]/div/div[2]/div/div[2]/div[2]/div[2]/div/div/a/strong'
                        });
                        this.echo(cellname);
                    });
                }
                else {
                    console.log('Notebook could not be opened in GitHub');
                }
            });
        });
    });

    casper.then(function () {
        // this.reload();
        // this.wait(5000);
    });

    //getting back to edit.html page and add a new cell
    casper.then(function () {
        test.comment("Now navigating back to edit.HTMl");
        this.waitForSelector(x(".//*[@id='part1.R']/div[2]/div[2]/select"), function () {
            this.echo("Opened the Notebook under edit.html");
            this.click(x(".//*[@id='part2.R']/div[1]/span[1]/i"));
            this.wait(8000);
            this.echo("Inserting new cell");
            // });
        });
        this.waitForSelector(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), function () {
            this.sendKeys(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), "'ABCD'");
            this.echo("Adding cell contents to the newly inserted cell");    
        })
        
    }, 5000);

    //open the notebook in Github again and verify that the cell name has changed
    casper.then(function () {
        // casper.thenOpen(githuburl, function () {
        //     this.wait(9000);
        functions.open_advanceddiv(casper);
        this.waitForSelector({type: 'css', path: '#open_in_github'}, function () {
            console.log("Link for opening notebook in GitHub found. Clicking on it");
            if (this.click({type: 'css', path: '#open_in_github'})) {
                this.wait(11000);
                this.viewport(1366, 768).withPopup(/gist.github.com/, function () {
                    this.wait(4000);
                    console.log(this.getCurrentUrl());
                    this.test.assertUrlMatch(/gist.github.com*/, 'Notebook opened in GitHub');
                    cellname = this.fetchText("#file-part2-r > div:nth-child(1) > div:nth-child(2) > a:nth-child(2) > strong:nth-child(1)");
                    // this.echo("cellname" + cellname);
                });
            }
            else {
                console.log('Notebook could not be opened in GitHub');
            }
        });
    });

    casper.then(function () {
        this.echo("Opened the Notebook gist in Github");
        //var changedcellname = this.fetchText({type: 'xpath', path: '/html/body/div/div[2]/div/div[2]/div/div[2]/div[2]/div[2]/div/div/a/strong'});
        var changedcellname = this.fetchText("#file-part2-r > div:nth-child(1) > div:nth-child(2) > a:nth-child(2) > strong:nth-child(1)");
        this.test.assertNotEquals(cellname, changedcellname, "Confirmed that the cell name gets changed in the notebook gist on inserting a cell in between");
    });

    casper.run(function () {
        test.done();
    });
});

