/*
 Author: Prateek
 Description: This is a casperjs automated test script for,In view.html output of a markdown cell should show only output
 * when 'Show Source' is enabled and disabled in view.html
 */

//Begin test
casper.test.begin("view.html for markdown cell with Rcode", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input = 'a<-1000;b<-2000;a+b';
    var NotebookID;

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

    //Add new notebook
    functions.create_notebook(casper);

    casper.then(function () {
        var temp = this.getCurrentUrl();
        NotebookID = temp.substring(41);
        console.log("Newly created Notebook ID is :" + NotebookID);
    });

    //change the language from R to Markdown
    casper.then(function () {
        this.mouse.click({type: 'xpath', path: ".//*[@id='prompt-area']/div[1]/div/select"});//x path for dropdown menu
        this.echo('clicking on dropdown menu');
        this.wait(2000);
    });

    //selecting Markdown from the drop down menu
    casper.then(function () {
        this.evaluate(function () {
            var form = document.querySelector('.form-control');
            form.selectedIndex = 0;
            $(form).change();
        });
        console.log('Markdown Language is selected from the drop down menu');
    });

    //Create a new cell
    functions.addnewcell(casper);

    casper.wait(4000).then(function () {
        this.sendKeys({type: 'css', path: "div.edit-markdown > div:nth-child(3) > div:nth-child(1)"}, input);
        console.log('adding contents to the cell');
    });

    functions.runall(casper);

    //opening notebook in view.html
    casper.then(function () {
        this.thenOpen("http://127.0.0.1:8080/view.html?notebook=" + NotebookID);
    });

    casper.wait(10000);

    casper.wait(4000).then(function () {
        this.test.assertDoesntExist(x(".//*[@id='part1.R']/div[3]/div[2]"), 'Since by default show source option is not selected hence source code is not visible');
        console.log('Now selecting "Show soucre" option from the dropdown menu');

        this.click('.dropdown-toggle');
        this.click({type: 'xpath', path: ".//*[@id='show_source']"});
        this.test.assertDoesntExist(x(".//*[@id='part1.R']/div[3]/div[2]"), "Even after clicking on 'Show source' option, source code is not visible");
    });

    casper.run(function () {
        test.done();
    });
});
