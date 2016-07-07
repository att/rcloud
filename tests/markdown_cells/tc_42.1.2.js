/*
 Author: Prateek
 Description: This is a casperjs automated test script for,In view.html mode, code should not be editable when the code is clicked on
 */

//Begin test
casper.test.begin("non-editable code in view.html", 6, function suite(test) {

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

    casper.then(function () {
        this.sendKeys({type: 'css', path: "div.edit-markdown > div:nth-child(3) > div:nth-child(1)"}, input);
        console.log('adding contents to the cell');
    });

    functions.runall(casper);

    //opening notebook in view.html
    casper.then(function () {
        this.thenOpen("http://127.0.0.1:8080/view.html?notebook=" + NotebookID);
    });

    casper.wait(10000);

    casper.wait(5000).then(function () {
        console.log('Now selecting "Show soucre" option from the dropdown menu');
        this.click('.dropdown-toggle');
        this.wait(2000);
        this.click({type: 'xpath', path: ".//*[@id='show_source']"});
        console.log('Show source option is selected');
        this.test.assertDoesntExist(x(".//*[@id='part1.R']/div[3]/div[2]"), "Even after clicking on 'Show source' option, source code is not visible");
        this.test.assertDoesntExist(x(".//*[@id='part1.R']/div[2]/div[2]/span[2]/i"), "Toggle edit button also doesnot exists for markdown cells in view.html");
        console.log('Since Source code ,toggle edit button option is also not visible hence we cannot modify the code ');
    });

    casper.run(function () {
        test.done();
    });
});