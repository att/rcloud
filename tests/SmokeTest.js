casper.test.begin("Smoke Test case which covers basic features", 29, function suite(test) {

    var x = require('casper').selectXPath;//required if we detect an element using xpath
    var github_username = casper.cli.options.username;//user input github username
    var github_password = casper.cli.options.password;//user input github password
    var rcloud_url = casper.cli.options.url;//user input RCloud login url
    var functions = require(fs.absolute('basicfunctions.js'));//invoke the common functions present in basicfunctions.js
    var notebook_id = '60cf414db458dae177addac8d48d4dea';//Notebook which consists all the cells like "R, Python, Markdown, Shell"
    var Notebook_name = "TEST_NOTEBOOK";// Notebook name of the importing/Load Notebook

    var fileName = "SampleFiles/PHONE.csv";
    var system = require('system');
    var currentFile = require('system').args[4];
    var curFilePath = fs.absolute(currentFile);
    var curFilePath = curFilePath.replace(currentFile, '');
    fileName = curFilePath + fileName;

    //Notebook paths to check for sharable links
    var Notebook_R = 'http://127.0.0.1:8080/notebook.R/564af357b532422620a6';
    var Mini = "http://127.0.0.1:8080/mini.html?notebook=f03ca14c9963e5718527";
    var Shiny = "http://127.0.0.1:8080/shiny.html?notebook=15a6054f8afd195302ef";
    var View = "http://127.0.0.1:8080/view.html?notebook=638ccc3aaeb391cc9888";
    var content = '"Welcome to RCloud"';
    var URL, url, NB_ID, URL1;

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

    casper.viewport(1024, 768).then(function () {
        test.comment('⌚️  Logging in to RCloud using GitHub credentials...');
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.then(function () {
        casper.echo('⌚️  Validating page for the RCloud page with Shareable link icon and cell trash icon...');
        functions.validation(casper);
    });

    //creating new notebok
    casper.then(function () {
        test.comment('⌚️  Creating New Notebook...');
        functions.create_notebook(casper);
        console.log("Verified that new notebook can be created");
    });

    casper.then(function () {
        test.comment('⌚️  Creating new cell and adding contents to the cell...');
        this.wait(3000);
        functions.addnewcell(casper);
    });

    casper.wait(2000).then(function () {
        functions.addcontentstocell(casper, content);
    });

    //Saving the notebook details
    casper.then(function () {
        URL = this.getCurrentUrl();
        NB_ID = URL.substring(41);
        console.log("New Notebook ID is :" + NB_ID);
    });

    //Search feature
    casper.then(function () {
        test.comment('Checking for Search feature');
        if (this.visible("#search-form > a:nth-child(3)")) {
            console.log("Search div is open");
        }
        else {
            console.log("Search div is closed hence opening");
            var z = this.evaluate(function () {
                $('#accordion-left > div:nth-child(2) > div:nth-child(1) > a:nth-child(1) > span:nth-child(2)').click();
            });
            console.log("Clicking on Search Div");
        }
    });

    casper.then(function () {
        test.comment('⌚️  Searching for keywords');
        this.sendKeys('#input-text-search', content);
        this.click("#search-form > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)");
        console.log("Entering item to be searched");

        console.log("Verifying whether the search resluts consists the searched keyword or not");
        this.wait(10000).test.assertExists(x(".//*[@id='search-results-scroller']"), "Search feature working");
        var z = this.evaluate(function () {
            $('#accordion-left > div:nth-child(2) > div:nth-child(1) > a:nth-child(1) > span:nth-child(2)').click();
        });//Closing search div
    });

    //Verifying for the posting and deleting Comments
    casper.then(function () {
        test.comment('⌚️  Posting and Deleting comments ...');
        this.then(function () {
            functions.comments(casper, Notebook_name);
        });

        //delete the comment
        casper.then(function () {
            test.comment('⌚️ Deleting comment ...');
            this.wait(4000);
            if (this.visible(".comment-body-text")) {
                this.mouse.move(".comment-body-text");
                this.click({type: 'css', path: 'i.icon-remove:nth-child(2)'});
                console.log("Posted comment(" + content + ") found and now Deleting it");
            } else {
                console.log("There is no comment to delete");
            }
        });

        casper.wait(4000).then(function () {
            this.test.assertDoesntExist(x(".//*[@id='comments-container']/div/div[2]/div/div"), 'Confirmed that entered commment is deleted');
        });
    });

    // Notebook reload
    casper.then(function () {
        this.then(function () {
            var url2 = this.getCurrentUrl();
            this.thenOpen(url2);
            this.wait(8000);
        });
    });

    functions.open_advanceddiv(casper);

    //Verifying for Load Notebook ID
    casper.wait(2000).then(function () {
        test.comment('⌚️  Opening notebook using Load Notebook by ID feature...');

        console.log("Clicking on advanced dropdown");
        this.wait(2999);
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Enter notebook ID or github URL:") { // message between quotes is the alerts message
                return notebook_id;
            }
        });
        this.click("#open_from_github");
        console.log("Using Load Notebook ID we are opening that particular Notebook");
        this.wait(8000);
    });

    //Verifying for the notebook name
    casper.then(function () {
        this.waitForSelector(x(".//*[@id='notebook-title']"), function () {
            var title = this.fetchText(".jqtree-selected > div:nth-child(1) > span:nth-child(1)");
            console.log(title);
            this.test.assertEquals(title, Notebook_name, "Confirmed that User can load Notebook by ID");
        });
    });

    // Notebook reload
    casper.then(function () {
        var url1 = this.getCurrentUrl();
        this.thenOpen(url1);
        this.wait(8000);
    });

    // Click on RunAll and verify the output
    casper.wait(5000).then(function () {
        test.comment('⌚️  Executing cell contents (R, Shell and Markdown) ...');
        functions.runall(casper);
    });

    //verifying output for the each and ever single cell
    casper.wait(10000).then(function () {
        this.then(function () {
            console.log(" Output of various cells ");
            this.test.assertExists(x(".//*[@id='part1.R']/div[3]/div[2]/pre/code"), "R Cell has been executed and Output div is visible");
            this.test.assertSelectorHasText(x(".//*[@id='part1.R']/div[3]/div[2]/pre/code"), "TRUE", "R cell has produced expected output");
        });

        this.then(function () {
            this.test.assertExists(x(".//*[@id='part2.md']/div[3]/div[2]/h1"), "Markdown Cell has been executed and Output div is visible");
            this.test.assertSelectorHasText(x(".//*[@id='part2.md']/div[3]/div[2]/h1"), "Welcome to RCloud .!", "Markdown cell has produced expected output");
        });
    });

    casper.then(function () {
        this.then(function () {
            this.test.assertExists(x(".//*[@id='part3.sh']/div[3]/div[2]/pre/code"), "Shell Cell has been executed and Output div is visible");
            this.test.assertSelectorHasText(x(".//*[@id='part3.sh']/div[3]/div[2]/pre/code"), "/tmp/Rserv/", "Shell cell has produced expected output");
        });
    });

    //Verifying for workspace div
    casper.then(function () {
        test.comment('⌚️  Verifying for Workspace and Dataframe Divs contents...');
        this.click('#accordion-right > div:nth-child(3) > div:nth-child(1)');
        this.wait(5000).then(function () {
            var data = this.fetchText("#enviewer-body-wrapper");
            console.log("Workspace has produced following Dataframe : \n\ " + data);
        });
    });

    //Verify for dataframe div
    casper.wait(5000).then(function () {
        console.log("Clicking on dataframe, from the workspace div");
        this.waitForSelector("#enviewer-body > table:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > a:nth-child(1)", function () {
            this.click('#enviewer-body > table:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > a:nth-child(1)');
        });
        this.wait(6000).then(function () {
            var df = this.fetchText("#viewer-body");
            console.log("Contents of Dataframe: \n\ " + df);
        });
    });

    //Now uploading a binary file to the Notebook
    casper.then(function () {
        casper.then(function () {
            this.thenOpen(URL);
            test.comment('⌚️  Uploading binary file to the Notebook ...');
            this.wait(5000);
        });

        //Verifying whether file upload div is open or not
        casper.wait(2000).then(function () {
            if (this.visible(x(".//*[@id='file']"))) {
                this.echo('File Upload pane div is open');
                this.wait(5000);
            }
            else {
                this.echo('File upload div is not open,hence opening it');
                this.wait(2000);
                this.click(x(".//*[@id='accordion-right']/div[2]/div[1]"));
            }
        });

        //Uploading file
        casper.wait(3000).then(function () {
            casper.page.uploadFile("#file", fileName);
            console.log('Selecting file from directory');
        });

        casper.then(function () {
            this.wait(5000, function () {
                this.click("#upload-to-notebook");
                console.log("Clicking on 'Upload to notebook' check box");
                this.click("#upload-submit");
                console.log("Clicking on Submit icon");
            });
        });

        casper.then(function () {
            this.wait(5000);
            this.waitUntilVisible(x('//*[contains(text(), "added")]'), function then() {
                console.log("File has been uploaded");
            });
        });

        casper.wait(10000).then(function () {
            console.log(" Verifying file has been uploaded to Notebook or not ");
            this.then(function () {
                this.test.assertSelectorHasText("#asset-list", 'PHONE.csv', 'Uploaded file is present in assets');
                console.log("Confirmed. File can be uploaded to the Notebook");
            });

            this.then(function () {
                console.log("Deleting Uploaded asset from the Notebook");
                this.click(x(".//*[@id='asset-list']/li[3]/div/span[2]/i"));
                this.test.assertSelectorDoesntHaveText("#asset-list", "PHONE.csv", "Confirmed that Asset has been successfully removed");
            });
        });
    });

    //Checking for Fork feature
    casper.then(function () {
        test.comment('⌚️  Verifying for Fork feature ...');
        functions.fork(casper);
    });

    casper.wait(5000).then(function () {
        test.comment('⌚️  Testing Shareable links ...');
        //Notebook.R
        casper.then(function () {
            this.thenOpen("http://127.0.0.1:8080/notebook.R/564af357b532422620a6");
            this.wait(7000);
            console.log('Checking Notebook.R')
            this.waitForSelector('body > form:nth-child(1)', function () {
                console.log('Content is visible');
                this.test.assertVisible("body > img:nth-child(2)", "Confirmed that User is able to open Notebook.R Notebook");
            }, function () {
                console.log("Notebook.R Page could not be loaded")
            }, 60000);
        });

        //VIEW.HTML
        casper.viewport(1024, 768).then(function () {
            this.thenOpen("http://127.0.0.1:8080/view.html?notebook=8ce30fba0e60d70e75fe");
            console.log('Checking View.html');
            // this.
            this.wait(8000).waitForSelector('.dropdown-toggle', function () {
                console.log('Content is visible');
                this.test.assertVisible(x(".//*[@id='part1.R']/div[2]/div[2]/pre/code"), "Confirmed that User is able to open View.html Notebook");
            }, function () {
                console.log("View.html page could not be loaded");
            }, 60000);
        });
    });

    casper.then(function () {
        console.log('Checking for Open in GitHub feature ');
        this.thenOpen(URL);
        this.wait(2000);
        this.then(function () {
            if (this.visible('.modal-body')) {
                console.log('Session reconnect window appears');
                this.click(".btn-primary");
                this.then(function () {
                    console.log('Validation to ensure page load');
                    functions.validation(casper);
                })
            }
            else {
                console.log('Validation to ensure page load');
                functions.validation(casper);
            }
        })
    });

    //Open Notebook in GitHub
    test.comment('⌚️  Opening Notebook in GitHub ...');
    casper.viewport(1366, 768).then(function () {
        this.waitForSelector({type: 'css', path: '#open_in_github'}, function () {
            console.log("Link for opening notebook in GitHub found. Clicking on it");
            if (this.click({type: 'css', path: '#open_in_github'})) {
                this.wait(11000);
                this.viewport(1366, 768).withPopup(/gist.github.com/, function () {
                    this.wait(4000);
                    console.log(this.getCurrentUrl());
                    this.test.assertUrlMatch(/gist.github.com*/, 'Notebook opened in GitHub');

                    //verifying that the gist opened belongs to local user
                    console.log('Verifying that the gist opened belongs to local user');
                    this.wait(8000);
                    var gist_user = this.fetchText({type: 'css', path: '.url > span:nth-child(1)'});
                    console.log("Gist owner is " + gist_user);
                    this.test.assertEquals(gist_user, github_username, 'Verified that the gist belongs to the local user');
                });
            }
            else {
                console.log('Notebook could not be opened in GitHub');
            }
        });
    });

    casper.wait(5000);

    //Help feature
    casper.then(function () {
        test.comment('Checking for Help feature');
        console.log("Opening Help div");
        var z = this.evaluate(function () {
            $('#accordion-left > div:nth-child(4) > div:nth-child(1) > a:nth-child(1) > span:nth-child(2)').click();
        });
        this.sendKeys('#input-text-help', "plot");
        this.click(x(".//*[@id='help-form']/div/div/button"));
        this.wait(10000);
    });

    casper.then(function () {
        functions.create_notebook(casper);
        URL1 = this.getCurrentUrl();
        this.thenOpen(URL1);
    });

    casper.wait(10000).then(function () {
        var t = this.fetchText("body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1)");
        console.log("Help has produced " + t);
        var z = this.evaluate(function () {
            $('#accordion-left > div:nth-child(4) > div:nth-child(1) > a:nth-child(1) > span:nth-child(2)').click();
        });
    });

    casper.wait(8000);

    //Making notebook private
    casper.then(function () {
        test.comment('⌚️  Making Notebook as Private ...');
        this.wait(3000).mouse.move(".jqtree-selected > div:nth-child(1) > span:nth-child(1)");
        this.wait(3000).waitUntilVisible(".jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)", function () {
            this.click(".jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)")
        });

        this.wait(5000).then(function () {
            this.click('.group-link > a:nth-child(1)')
        });

        this.wait(10000).then(function () {
            console.log("Clicking on 'Private' radio button");
            this.click('#yellowRadio');
            this.wait(4000);
            this.setFilter("page.prompt", function (msg, currentValue) {
                console.log(msg);
                if (msg === "Are you sure you want to make notebook " + notebook_name + " truly private?") {
                    return TRUE;
                }
            });
            this.click('span.btn:nth-child(3)');
            console.log('Clicking on ok to confirm to make notebook private');
        });
    });

    casper.then(function () {
        this.thenOpen(URL1);
        this.wait(5000);
    });

    //validate if notebook has become private
    casper.wait(10000).then(function () {
        this.mouse.move('.jqtree-selected > div:nth-child(1) > span:nth-child(1)');
        this.wait(2000);
        this.waitUntilVisible(".jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)", function () {
            this.click(".jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)");
            console.log("Clicking on notebook info");
        });

        this.wait(5000).then(function () {
            status = this.fetchText('.group-link > a:nth-child(1)');
            console.log("notebook is " + status);
            this.test.assertEquals(status, 'private', "The notebook has been converted to private successfully");
        });
    });

    //Discover.html for anonymous user
    casper.viewport(1024, 768).then(function () {
        test.comment("Opening Discover page")
        casper.viewport(1366, 768).then(function () {
            this.waitForSelector("#rcloud-navbar-menu > li:nth-child(5) > a:nth-child(1)", function () {
                console.log("Link for opening Discover found. Clicking on it");
                if (this.clickLabel("Discover", "a")) {
                    this.wait(11000);
                    this.viewport(1366, 768).withPopup(/discover.html/, function () {
                        this.wait(4000);
                        this.test.assertUrlMatch(/discover.html/, 'Discover page URL matched');
                        this.wait(8000);
                        this.waitForSelector(".active > a:nth-child(1)", function () {
                            this.test.assertExists(".active > a:nth-child(1)", "Discover page opened successfully");
                        });
                    });
                }
                else {
                    console.log('Unable to open Discover page');
                }
            });
        });

        casper.then(function () {
            this.thenOpen(URL1);
            this.wait(5000);
        });
    });

    // loging out of RCloud
    casper.viewport(1366, 768).then(function () {
        test.comment('⌚️  Logging out of RCloud and GitHub to check shareable links for anonymous user ...');
        this.wait(13000);
        this.click("#rcloud-navbar-menu > li:nth-child(7) > a:nth-child(1)");
        console.log("Logging out from RCloud application");
    });

    casper.then(function () {
        this.wait(7000);
        this.click('#main-div > p:nth-child(2) > a:nth-child(2)');
    });

    casper.then(function () {
        this.wait(5000);
        this.click('.btn');
        this.wait(4000);
        console.log("Logging out from GitHub ");
    });

    //Open Notebook.R as anonymous user
    casper.viewport(1024, 768).then(function () {
        test.comment("Opening Notebook_R noteook as anonymous user");
        casper.page = casper.newPage();
        casper.viewport(1024, 768).open(Notebook_R).then(function () {
            this.wait(8000);
            this.waitForSelector("body > form:nth-child(1) > input:nth-child(5)", function () {
                this.wait(8000).test.assertExists("body > form:nth-child(1) > input:nth-child(5)", "Published Notebook is accessible for anonymous user");
            });
        });
    });

    //Open View.html notebook as anonymous user
    casper.viewport(1024, 768).then(function () {
        test.comment("Opening View noteook as anonymous user");
        casper.page = casper.newPage();
        casper.viewport(1024, 768).open(View).then(function () {
            this.wait(8000);
            this.waitForSelector(x(".//*[@id='part1.R']/div[2]/div[2]/pre/code"), function () {
                this.wait(8000).test.assertExists(x(".//*[@id='part1.R']/div[2]/div[2]/pre/code"), "Anonymous user is able to open published notebook in view.html");
            });
        });
    });

    //Mini.html for anonymous user
    casper.viewport(1024, 768).then(function () {
        test.comment("Opening Mini.html noteook as anonymous user");
        casper.page = casper.newPage();
        casper.viewport(1024, 768).open(Mini).then(function () {
            this.wait(8000);
            this.waitForSelector("body > h1:nth-child(1)", function () {
                this.test.assertSelectorHasText("body > h1:nth-child(1)", "Hello, world!", "Anonymous user is able to open published notebook in Mini.html");
            });
        });
    });

    casper.run(function () {
        test.done();
    });
});