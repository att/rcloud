casper.test.begin("Smoke Test case which covers basic features", 26, function suite(test) {

    var x = require('casper').selectXPath;//required if we detect an element using xpath
    var github_username = casper.cli.options.username;//user input github username
    var github_password = casper.cli.options.password;//user input github password
    var rcloud_url = casper.cli.options.url;//user input RCloud login url
    var functions = require(fs.absolute('basicfunctions.js'));//invoke the common functions present in basicfunctions.js
    var notebook_id = '50de72ea14b86aa176c4';//Notebook which consists all the cells like "R, Python, Markdown, Shell"
    var Notebook_name = "TEST_NOTEBOOK";// Notebook name of the importing/Load Notebook
    var fileName = '/home/travis/build/att/rcloud/tests/PHONE.csv';// File path directory

    //Notebook paths to check for sharable links
    var Notebook_R = 'http://127.0.0.1:8080/notebook.R/564af357b532422620a6';
    var Mini = "http://127.0.0.1:8080/mini.html?notebook=f03ca14c9963e5718527";
    var Shiny = "http://127.0.0.1:8080/shiny.html?notebook=15a6054f8afd195302ef";
    var View = "http://127.0.0.1:8080/view.html?notebook=638ccc3aaeb391cc9888";
    var content = '"Welcome to RCloud"';
    var URL, url, NB_ID;

    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');//inject jquery codes
    });

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.then(function () {
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(4000);
    });

    //creating new notebok
    casper.then(function () {
        this.click("#new-notebook > span:nth-child(1) > i:nth-child(1)")
        this.wait(5000);
        console.log("Verified that new notebook can be created");
    });

    casper.then(function () {
        this.wait(3000);
        functions.addnewcell(casper);
        functions.addcontentstocell(casper, content);
    });

    //Saving the notebook details
    casper.then(function () {
        URL = this.getCurrentUrl();
        NB_ID = URL.substring(41);
        console.log("New Notebook ID is :" + NB_ID);
    });

    // Enable Workspace and Dataframe div
    casper.then(function () {
        this.click('#accordion-left > div:nth-child(3) > div:nth-child(1)')
        this.wait(2000);
        this.sendKeys('div.settings-input:nth-child(4) > label:nth-child(1) > input:nth-child(2)', 'rcloud.viewer, rcloud.enviewer, rcloud.notebook.info');
        this.then(function () {
            this.click('#command-prompt > div:nth-child(3) > div:nth-child(1)');
        });

        this.then(function () {
            this.wait(5000);
            this.thenOpen(URL, function () {
                this.echo('Workspace div and Dataframe div Enabled')
            });
        });
    });

    // Notebook reload
    casper.then(function () {
        this.then(function () {
            var url = this.getCurrentUrl();
            this.thenOpen(url);
            this.wait(8000);
        });

        //Verifying for Load Notebook ID
        this.then(function () {
            functions.open_advanceddiv(casper);
            this.echo("Clicking on advanced dropdown");
            this.wait(2999);
            casper.setFilter("page.prompt", function (msg, currentValue) {
                if (msg === "Enter notebook ID or github URL:") { // message between quotes is the alerts message
                    return notebook_id;
                }
            });
            this.click("#open_from_github");
            this.echo("Using Load Notebook ID we are opening that particular Notebook");
            this.wait(8000);
        });

        //Verifying for the notebook name
        casper.waitForSelector(x(".//*[@id='notebook-title']"), function () {
            var title = this.fetchText(".jqtree-selected > div:nth-child(1) > span:nth-child(1)");
            this.echo(title);
            this.test.assertEquals(title, Notebook_name, "Confirmed that User can load Notebook by ID");
        });
    });


    // Notebook reload
    casper.then(function () {
        url = this.getCurrentUrl();
        this.thenOpen(url);
        this.wait(5000);
        this.echo('Validation of the notebook loading by checking for elements- Shareable link and Logout option ')
        functions.validation(casper);
    });

    // Click on RunAll and verify the output
    casper.then(function () {
        functions.runall(casper);
        console.log("Executing cell contents (R, Shell, Markdown and Python) ");
    });

    //verifying output for the each and ever single cell
    casper.then(function () {
        this.wait(10000);
        this.then(function () {
            console.log(" Output of various cells ");
            this.wait(5000);
            this.test.assertExists(x(".//*[@id='part1.R']/div[3]/div[2]/pre/code"), "R Cell has been executed and below is the corresponding output");
            var r = this.fetchText(x(".//*[@id='part1.R']/div[3]/div[2]/pre/code"));
            console.log("Output of R cell : " + r);
        });

        this.then(function () {
            this.wait(5000);
            this.test.assertExists(x(".//*[@id='part2.md']/div[3]/div[2]/blockquote/p"), "Markdown Cell has been executed and below is the corresponding output");
            var m = this.fetchText(x(".//*[@id='part2.md']/div[3]/div[2]/blockquote/p"));
            console.log("Output of Markdown cell : " + m);
        });

        this.then(function () {
            this.wait(5000);
            this.test.assertExists(x(".//*[@id='part3.sh']/div[3]/div[2]/pre/code"), "Shell Cell has been executed and below is the corresponding output");
            var s = this.fetchText(x(".//*[@id='part3.sh']/div[3]/div[2]/pre/code"));
            console.log("Output of Shell cell : " + s);
        });

        this.then(function () {
            this.wait(8000);
            this.test.assertExists(x(".//*[@id='part4.py']/div[3]/div[2]"), "Python Cell has been executed and below is the corresponding output");
            var p = this.fetchText("#part4\.py > div:nth-child(3) > div:nth-child(2) > span:nth-child(1)");
            console.log("Output of Python cell" + p);
        });
    });

    //Verifying for workspace div
    casper.then(function () {
        this.click('#accordion-right > div:nth-child(3) > div:nth-child(1)');
        this.wait(2000);
        var data = this.fetchText("#enviewer-body-wrapper");
        console.log("Workspace has produced following Dataframe : " + data);
    });

    //Verify for dataframe div
    casper.then(function () {
        console.log("clicking on dataframe, from the workspace div");
        this.click('#enviewer-body > table:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > a:nth-child(1)');
        this.wait(2000);
        this.then(function () {
            var df = this.fetchText("#viewer-body");
            console.log("Contents of Dataframe: " + df);
        });
    });

    //Verifying for the posting and deleting Comments
    casper.then(function () {
        this.thenOpen(URL);
        this.wait(8000);
        console.log(" Posting and deleting comment ");
        this.then(function () {
            functions.comments(casper, Notebook_name);
        });

        //delete the comment
        casper.then(function () {
            this.wait(4000);
            if (this.visible(".comment-body-text")) {
                this.mouse.move(".comment-body-text");
                this.click({type: 'css', path: 'i.icon-remove:nth-child(2)'});
                console.log("Deleting Comment");
            } else {
                console.log("there is no comment to delete");
            }
        });
        casper.wait(4000);
        casper.then(function () {
            this.test.assertDoesntExist(x(".//*[@id='comments-container']/div/div[2]/div/div"), 'Confirmed that entered commment is deleted');
        });
    });

    //Now uploading a binary file to the Notebook
    casper.then(function () {
        this.wait(8000);
        console.log(" Uploading file to the Notebook ");

        //Verifying whether file upload div is open or not
        casper.then(function () {
            if (this.visible(x(".//*[@id='collapse-file-upload']/div"))) {
                this.echo('File Upload pane div is open');
                this.wait(5000);
            }
            else {
                this.echo('File upload div is not open,hence opening it');
                this.click(x(".//*[@id='accordion-right']/div[2]/div[1]"));
                this.wait(5000);
            }
        });

        //File Upload
        casper.then(function () {
            this.evaluate(function (fileName) {
                __utils__.findOne('input[type="file"]').setAttribute('value', fileName)
            }, {fileName: fileName});
            this.page.uploadFile('input[type="file"]', fileName);
            console.log('Selecting a file');
        });
        casper.then(function () {
            casper.evaluate(function () {
                $('#upload-to-notebook').click();
            });
            console.log("Clicking on Upload to notebook check box");
            this.click(x(".//*[@id='upload-submit']"));
            console.log("Clicking on Submit icon");
        });
    });

    casper.wait(10000);

    casper.then(function () {
        console.log(" Verifying file has been uploaded to Notebook or not ");
        this.then(function () {
            this.test.assertSelectorHasText("#asset-list", 'PHONE.csv', 'Uploaded file is present in assets');
            console.log("Verified that files can be uploaded to the Notebook");
        });

        this.then(function () {
            this.echo("Deleting Uploaded asset from the Notebook");
            this.click(x(".//*[@id='asset-list']/li[3]/a/span[2]/i"));
            this.test.assertSelectorDoesntHaveText("#asset-list", "PHONE.csv", "Confirmed that Asset has been successfully removed");
        });
    });

    casper.wait(8000);

    //Checking for Fork feature
    casper.then(function () {
        this.wait(3000);
        this.echo('Checking for Fork feature');
        functions.fork(casper);
    });

    casper.then(function () {
        this.echo("Testing Shareable links ");
    });

    //Notebook.R
    casper.then(function () {
        this.thenOpen("http://127.0.0.1:8080/notebook.R/564af357b532422620a6");
        this.wait(5000);
        this.echo('Checking Notebook.R')
        this.waitForSelector('body > form:nth-child(1)', function () {
            this.echo('Content is visible');
            this.test.assertVisible("body > img:nth-child(2)", "Confirmed that User is able to open Notebook.R Notebook");
        }, function () {
            this.echo("Notebook.R Page could not be loaded")
        }, 60000);
    });

    //Mini
    casper.then(function () {
        this.thenOpen("http://127.0.0.1:8080/mini.html?notebook=f03ca14c9963e5718527");
        this.wait(5000);
        this.echo('Checking Mini.html');
        this.waitForSelector('#chartdiv0', function () {
            this.echo('Content is visible');
            this.test.assertVisible("#chartdiv0", "Confirmed that User is able to open Mini Notebook");
        }, function () {
            this.echo("Mini.html page could not be loaded")
        }, 60000);
    });

    //VIEW.HTML
    casper.viewport(1024, 768).then(function () {
        this.thenOpen("http://127.0.0.1:8080/view.html?notebook=8ce30fba0e60d70e75fe");
        this.echo('Checking View.html');
        this.wait(5000);
        this.waitForSelector('.r-result-div', function () {
            this.echo('Content is visible');
            this.test.assertVisible(".r-result-div", "Confirmed that User is able to open View.html Notebook");
        }, function () {
            this.echo("View.html page could not be loaded");
        }, 60000);
    });

    casper.then(function () {
        this.echo('Checking for Open in GitHub feature ');
        this.thenOpen(URL);
        this.wait(2000);
        this.then(function () {
            if (this.visible('.modal-body')) {
                this.echo('Session reconnect');
                this.click(".btn-primary");
                this.then(function () {
                    this.echo('Validation to ensure page load');
                    functions.validation(casper);
                })
            }
            else {
                this.echo('Validation to ensure page load');
                functions.validation(casper);
            }
        })
    });

    //Open Notebook in GitHub
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
                    this.echo('Verifying that the gist opened belongs to local user')
                    this.wait(8000);
                    var gist_user = this.fetchText({type: 'css', path: '.url > span:nth-child(1)'});
                    this.echo("Gist owner is " + gist_user);
                    this.test.assertEquals(gist_user, github_username, 'Verified that the gist belongs to the local user');
                });
            }
            else {
                console.log('Notebook could not be opened in GitHub');
            }
        });
    });

    //Making notebook private
    casper.then(function () {
        this.mouse.move('.jqtree-selected > div:nth-child(1)');
        this.wait(2000);
        this.waitUntilVisible(".jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)", function () {
            this.click(".jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)")
        });

        this.then(function () {
            this.wait(3000);
            this.click('.group-link > a:nth-child(1)')
        });

        this.then(function () {
            console.log("Clicking on 'Private' radio button");
            this.click('#yellowRadio');
            this.wait(4000);

            this.setFilter("page.prompt", function (msg, currentValue) {
                this.echo(msg);
                if (msg === "Are you sure you want to make notebook " + notebook_name + " truly private?") {
                    return TRUE;
                }
            });
            this.click('span.btn:nth-child(3)');
            this.echo('Clicking on ok to confirm to make notebook private');
        });
    });

    //validate if notebook has become private
    casper.then(function () {
        this.mouse.move('.jqtree-selected > div:nth-child(1)');
        this.wait(2000);
        this.waitUntilVisible(".jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)", function () {
            this.click(".jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)");
            console.log("Clicking on notebook info");
        });

        this.then(function () {
            this.wait(3000)
            status = this.fetchText('.group-link > a:nth-child(1)');
            this.echo("notebook is " + status);
            this.test.assertEquals(status, 'private', "The notebook has been converted to private successfully");
        });
    });

    casper.run(function () {
        test.done();
    });
});