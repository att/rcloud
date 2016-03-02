/*The following functions are present :
 >login to Github and RCloud
 >create a new notebook
 >verify if RCloud edit.html page has got loaded properly
 >Add a new cell using + icon of prompt cell
 >Add contents to the FIRST cell and then execute it using run option
 >Run all the cells
 >Fork a notebook
 >open Advanced div
 >count the number of Notebooks and delete the newly created notebook from Notebooks I Starred list
 >getting notebook title
 >view.html link verifications
 >checking if notebook is starred
 >Check whether a notebook is present in Notebooks I Starred list
 >Check whether a notebook is present in People I Starred list
 >Check whether a notebook is present in All Notebooks list
 >Enter comments
 >Search Elements
 */


var casper = require("casper").create();

//login to Github and RCloud
exports.login = function (casper, github_username, github_password, rcloud_url) {
    return casper
        .then(function () {
            this.wait(8000);
            if (casper.getTitle().match(/GitHub/)) {

                casper.viewport(1366, 768).then(function () {
                    this.test.assertTitleMatch(/GitHub/, "Github page has been loaded");
                    console.log("Login into GitHub with supplied username and password");
                    this.sendKeys('#login_field', github_username);
                    this.sendKeys('#password', github_password);
                    this.click({type: 'css', path: "input.btn"});
                });

                casper.viewport(1366, 768).then(function () {
                    if (this.getTitle().match(/Authorize RCloud/)) {
                        this.click(".btn");
                        console.log("Github Authorization completed");
                    }
                    else {
                        casper.viewport(1366, 768).then(function () {
                            this.wait(8000);
                            this.echo("The page title: " + this.getTitle());
                            console.log("RCloud Home page loaded");
                        });
                    }
                });

            }
            else {
                casper.viewport(1024, 768).then(function () {
                    this.test.assertTitleMatch(/RCloud/, 'RCloud Home page already loaded');
                });
            }
        });
}

//create a new notebook
exports.create_notebook = function (casper) {
    return casper
        .then(function () {
            var z = casper.evaluate(function () {
                $('#new-notebook').click();
            });
            this.echo("New Notebook created");
            this.wait(9000);
        });
};

//verify if RCloud edit.html page has got loaded properly
exports.validation = function (casper) {
    return casper
        .then(function () {
            this.wait(5000);
            this.waitForSelector('.icon-share', function () {
                this.test.assertExists('.icon-share', 'the element Shareable Link exists');
            });
            this.waitForSelector('#rcloud-navbar-menu > li:nth-child(7) > a:nth-child(1)', function () {
                this.test.assertVisible("#rcloud-navbar-menu > li:nth-child(7) > a:nth-child(1)", 'Logout button exists');
            });
        });
};

exports.search1 = function (casper, search_Content) {
    return casper
        .then(function () {
            if (this.visible('#sort-by')) {
                console.log('Search div is already opened');
            }
            else {
                var z = this.evaluate(function () {
                    $('#accordion-left > div:nth-child(2) > div:nth-child(1)').click();
                });
                this.echo("Opened Search div");
            }

            this.then(function () {
                this.sendKeys('#input-text-search', search_Content);
                this.wait(6000);
                this.click('#search-form > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)');
            });

            this.wait(5000);
        });
};

//Add a new cell using + icon of prompt cell
exports.addnewcell = function (casper) {
    return casper
        .then(function () {
            this.test.assertTruthy(this.click({
                type: 'xpath',
                path: '/html/body/div[3]/div/div[2]/div/div[3]/div[1]/div/span/i'
            }), 'created new cell');
            this.wait(7000);
        });
};

//Add contents to the FIRST cell and then execute it using run option
exports.addcontentstocell = function (casper, input_code) {
    return casper
        .then(function () {
            if (this.visible({
                    type: 'xpath',
                    path: '/html/body/div[3]/div/div[2]/div/div[1]/div/div[3]/div[1]/div[2]/div/div[2]/div'
                })) {
                this.test.pass('The cell is present');
                console.log('Adding contents to the cell')
                this.sendKeys({
                    type: 'xpath',
                    path: '/html/body/div[3]/div/div[2]/div/div[1]/div/div[3]/div[1]/div[2]/div/div[2]/div'
                }, input_code);

                this.click({
                    type: 'xpath',
                    path: '/html/body/div[3]/div/div[2]/div/div[1]/div/div[2]/div[2]/span[1]/i'
                });//xpath for executing the contents

                this.echo("executed contents of First cell");
                this.wait(6000);
            }
            else {
                this.test.fail('Cell is not present to pass the code content');
            }

        });

};

//Run all the cells
exports.runall = function (casper) {
    return casper
        .then(function () {
            var z = casper.evaluate(function () {
                $('#run-notebook').click();
            });
            this.wait(10000);
            console.log('Run-all button is clicked to execute the pre-executed cell');

        });
};

//Fork a notebook
exports.fork = function (casper) {
    return casper
        .then(function () {
            this.test.assertExists({type: 'css', path: '.icon-code-fork'}, 'Fork option exists');
            this.test.assertTruthy(this.click({type: 'css', path: '.icon-code-fork'}), 'Fork option clicked');
            this.wait(9000);
        });
};

//open Advanced div
exports.open_advanceddiv = function (casper) {
    return casper
        .then(function () {
            this.click({type: 'xpath', path: '/html/body/div/div/div[2]/ul[2]/li/a/b'}, 'Advanced div opened');
            this.wait(6000);
        });
};

//delete the newly created notebook
exports.delete_notebooksIstarred = function (casper) {
    return casper
        .then(function () {
            this.then(function () {
                this.mouse.move('.jqtree-selected > div:nth-child(1)');
                this.waitUntilVisible('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(5) > i:nth-child(1)', function () {
                    this.click('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(5) > i:nth-child(1)');
                });
            });

        });
};

//getting notebook title
exports.notebookname = function (casper) {
    casper.wait(3000);
    return casper.fetchText({type: 'xpath', path: '//*[@id="notebook-title"]'});
};

//view.html link verifications
exports.viewhtml = function (casper) {
    return casper
        .then(function () {
            this.test.assertUrlMatch(/view.html/, 'view.html page for given user loaded');
            //verify that only output div is visible and editable icon exists which proves that the notebook is currently not in Editable
            //form
            this.test.assertVisible({
                type: 'css',
                path: '#edit-notebook > i:nth-child(1)'
            }, 'Edit option visible which proves that notebook currently is uneditable');
            this.test.assertVisible({
                type: 'xpath',
                path: ".//*[@id='part1.R']/div[2]/div[2]"
            }, 'output div visible');
            this.test.assertNotVisible({
                type: 'css',
                path: 'div:nth-child(3) > div:nth-child(2) > pre:nth-child(1) > code:nth-child(1)'
            }, 'source code not visible');
        });
};

//checking if notebook is starred
exports.checkstarred = function (casper) {
    return casper
        .then(function () {
            var starcount = this.fetchText({type: 'css', path: '#curr-star-count'});
            if (starcount == 1) {
                this.echo("Notebook is starred");
            }
            else {
                this.echo("Notebook is unstarred");
            }
        });
};

//Random number
exports.RandomNumber = function (casper) {
    return casper
        .then(function () {
            ID = this.evaluate(function () {
                return Math.random().toString(36).substr(2, 9);
            });
            this.echo('Genearated random number is: ' + ID);
        });
};

//Check whether a notebook is present in Notebooks I Starred list
exports.notebooksIstarred = function (casper) {
    return casper
        .then(function () {
            var counter1 = 0;//count the number of notebooks
            var title = this.fetchText({type: 'css', path: '#notebook-title'});
            do
            {
                counter1 = counter1 + 1;
                this.wait(2000);
            } while (casper.visible({
                type: 'css',
                path: 'ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + counter1 + ') '
            }));
            counter1 = counter1 - 1;
            this.echo("number of notebooks under Notebooks I Starred list:" + counter1);
            var flag = 0;//flag variable to test if the Notebook was found in the div
            var starcount = 0;//checking the starcount of the notebook under this div
            for (var i = 1; i <= counter1; i++) {
                this.wait(2000);
                var temp = this.fetchText({
                    type: 'css',
                    path: 'ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + i + ') '
                });
                if (temp == title) {
                    flag = 1;
                    this.echo("Found notebook " + title + " in Notebooks I Starred list");
                    starcount = this.fetchText({
                        type: 'css',
                        path: 'ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + i + ') '
                    });
                    break;
                }
            }//for closes
            if (flag == 1) {
                this.test.assertEquals(flag, 1, "Notebook with title " + title + " is PRESENT under Notebooks I Starred list with star count = " + starcount);
            }
            else {
                this.test.assertEquals(flag, 0, "Notebook with title " + title + " is ABSENT under Notebooks I Starred list with star count = " + starcount);
            }

        });
};

//Check whether a notebook is present in People I Starred list
exports.peopleIstarred = function (casper) {
    return casper
        .then(function () {

            var counter2 = 0;//count the number of notebooks
            var title = this.fetchText({type: 'css', path: '#notebook-title'});
            do
            {
                counter2 = counter2 + 1;
                //this.wait(2000);
            } while (casper.visible({
                type: 'css',
                path: 'ul.jqtree_common:nth-child(1) > li:nth-child(2) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + counter2 + ') > div:nth-child(1) > span:nth-child(1)'
            }));
            counter2 = counter2 - 1;
            this.echo("number of notebooks under People I Starred list:" + counter2);
            var flag = 0;//flag variable to test if the Notebook was found in the div
            var starcount = 0;//checking the starcount of the notebook under this div
            for (var i = 1; i <= counter2; i++) {
                //this.wait(2000);
                var temp = this.fetchText({
                    type: 'css',
                    path: 'ul.jqtree_common:nth-child(1) > li:nth-child(2) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + i + ') > div:nth-child(1) > span:nth-child(1)'
                });
                //this.echo(temp);
                if (temp == title) {
                    flag = 1;
                    this.echo("Found notebook " + title + " in People I Starred list");
                    starcount = this.fetchText({
                        type: 'css',
                        path: 'ul.jqtree_common:nth-child(1) > li:nth-child(2) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + i + ') > div:nth-child(1) > span:nth-child(2) > span:nth-child(2) > span:nth-child(1) > sub:nth-child(2)'
                    });
                    break;
                }
            }//for closes
            if (flag == 1) {
                this.test.assertEquals(flag, 1, "Notebook with title " + title + " is PRESENT under People I Starred list with star count = " + starcount);
            }
            else {
                this.test.assertEquals(flag, 0, "Notebook with title " + title + " is ABSENT under People I Starred list with star count = " + starcount);
            }
        });
};

//Check whether a notebook is present in All Notebooks list
exports.allnotebooks = function (casper) {
    return casper
        .then(function () {

            var counter3 = 0;//count the number of notebooks
            var title = this.fetchText({type: 'css', path: '#notebook-title'});
            do
            {
                counter3 = counter3 + 1;
                //this.wait(2000);
            } while (casper.visible({
                type: 'css',
                path: 'ul.jqtree_common:nth-child(1) > li:nth-child(3) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + counter3 + ') > div:nth-child(1) > span:nth-child(1)'
            }));
            counter3 = counter3 - 1;
            this.echo("number of notebooks under My Notebook of All Notebooks list:" + counter3);
            var flag = 0;//flag variable to test if the Notebook was found in the div
            var starcount = 0;//checking the starcount of the notebook under this div
            for (var i = 1; i <= counter3; i++) {
                //this.wait(2000);
                var temp = this.fetchText({
                    type: 'css',
                    path: 'ul.jqtree_common:nth-child(1) > li:nth-child(3) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + i + ') > div:nth-child(1) > span:nth-child(1)'
                });
                //this.echo(temp);
                if (temp == title) {
                    flag = 1;
                    this.echo("Found notebook " + title + " in All notebooks list");
                    starcount = this.fetchText({
                        type: 'css',
                        path: 'ul.jqtree_common:nth-child(1) > li:nth-child(3) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + i + ') > div:nth-child(1) > span:nth-child(2) > span:nth-child(2) > span:nth-child(1) > sub:nth-child(2)'
                    });
                    break;
                }
            }//for closes
            if (flag == 1) {
                this.test.assertEquals(flag, 1, "Notebook with title " + title + " is PRESENT under All Notebooks list with star count = " + starcount);
            }
            else {
                this.test.assertEquals(flag, 0, "Notebook with title " + title + " is ABSENT under All Notebooks list with star count = " + starcount);
            }
        });
};

//Enter comments
exports.comments = function (casper, comment) {
    return casper
        .then(function () {
            if (this.visible({type: "xpath", path: ".//*[@id='collapse-comments']/div"})) {
                this.echo('Comment div is open');
                this.wait(5000);
            }
            else {
                this.echo('Comment div is not open,hence opening it');
                this.wait(3000);
                var z = casper.evaluate(function () {
                    $('#accordion-right > div:nth-child(5) > div:nth-child(1)').click();
                });
                this.wait(2000);
            }
            this.sendKeys('#comment-entry-body', comment);
            this.wait(3000);
            this.test.assertTruthy(this.click({type: 'css', path: '#comment-submit'}), 'comment entered successfully');
        });
};

//Group create
exports.create_group = function (casper) {
    return casper
        .then(function () {

            //Random name generator to create Group name
            casper.then(function () {
                var GroupName = this.evaluate(function () {
                    return Math.random().toString(36).substr(2, 3);
                });
                console.log('1st group name is :' + GroupName);
            });
            //Open manage group window
            this.then(function () {
                this.click("li.dropdown > a:nth-child(1)");
                console.log('Opening advanced drop down menu');
                this.evaluate(function () {
                    $('#manage_groups').click();
                });
                this.echo('opened manage group dialog box');
                this.wait(2000);
            });

            //Creating 1st group
            this.then(function () {
                console.log("Clicking on create new group")
                this.wait(4000);
                casper.setFilter("page.prompt", function (msg, currentValue) {
                    if (msg === "Enter new group name") {
                        return GroupName;
                    }
                });
                this.click("span.label:nth-child(1)");
                console.log("Create 1st group")
                this.evaluate(function () {
                    $('span.btn:nth-child(3)').click();
                });
            });
        });
};

//Search elements
exports.search = function (casper, item, combo) {
    return casper
        .then(function () {
            var x = require('casper').selectXPath;
            if (this.visible('#search-form')) {
                console.log('Search div is already opened');
            }
            else {
                var z = casper.evaluate(function () {
                    $(' .icon-search').click();
                });
                this.echo("Opened Search div");
            }
            //entering item to be searched
            casper.then(function () {
                this.sendKeys('#input-text-search', item);
                this.wait(6000);
                this.click('#search-form > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)');
            });
            var counter = 0;
            casper.wait(5000);
            //counting number of Search results
            casper.then(function () {
                do
                {
                    counter = counter + 1;
                    this.wait(2000);
                } while (this.visible(x('/html/body/div[3]/div/div[1]/div[1]/div/div/div[2]/div[2]/div/div/div[2]/div/div/table[' + counter + ']/tbody/tr[1]/td/a')));

                counter = counter - 1;
                this.echo("number of search results:" + counter);
            });
            //verify that the searched item is found in the local user's div
            casper.viewport(1366, 768).then(function () {
                //this.echo("Combo= "+combo);
                var flag = 0;//to check if searched item has been found
                for (var i = 1; i <= counter; i++) {
                    this.wait(5000);
                    var result = this.fetchText(x('/html/body/div[3]/div/div/div[2]/div/div/div[2]/div[2]/div/div/div[2]/div/div/table[' + i + ']/tbody/tr/td/a'));
                    this.echo(result);
                    if (result == combo) {
                        var temp = this.fetchText(x('/html/body/div[3]/div/div/div[2]/div/div/div[2]/div[2]/div/div/div[2]/div/div/table[' + i + ']/tbody/tr[2]/td/div/table/tbody/tr[2]/td/table/tbody/tr/td[2]/code'));
                        if (temp == item) {
                            flag = 1;
                            break;
                        }
                    }//outer if closes
                }//for closes
                this.test.assertEquals(flag, 1, "Searched item has been found");
            });//function closes
        });
};

