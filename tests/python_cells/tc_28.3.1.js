/* 
 Author: Prateek
 Description:This is a casperjs automated test script for showing that,Import an external Notebook having python codes written in it. 
 These codes will also run successfully in their respective cells
 */

//Begin Tests
casper.test.begin("Import External Notebooks having python codes", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input = 'a=5 ; print a';
    var NotebookID, URL, NotebookID1, Title, Title1;

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
        this.wait(3000);
        title = functions.notebookname(casper);
        this.echo("Present title of notebook: " + title);
        var z = casper.evaluate(function triggerKeyDownEvent() {
            jQuery("#notebook-title").text("THOO-thoo");
            var e = jQuery.Event("keydown");
            e.which = 13;
            e.keyCode = 13;
            jQuery("#notebook-title").trigger(e);
            return true;
        });
    });

    //change the language from R to Python
    casper.then(function () {
        this.mouse.click({type: 'xpath', path: ".//*[@id='prompt-area']/div[1]/div/select"});//x path for dropdown menu
        this.echo('clicking on dropdown menu');
        this.wait(2000);
    });

    //selecting Python from the drop down menu
    casper.then(function () {
        this.evaluate(function () {
            var form = document.querySelector('.form-control');
            form.selectedIndex = 2;
            $(form).change();
        });
        console.log('Python Language is selected from the drop down menu');
    });

    //create a new cell
    functions.addnewcell(casper);

    //adding python code in to the cell
    casper.then(function () {
        this.sendKeys({type: 'css', path: '.ace_content'}, input);
        this.wait(2000);
    });

    //to run the code
    functions.runall(casper);

    casper.wait(3000);

    //Verifying the output for the code
    casper.then(function () {
        this.test.assertSelectorHasText({
            type: 'xpath',
            path: ".//*[@id='part1.py']/div[3]/div[2]/span"
        }, '5', 'Python code has produced expected output');
    });

    casper.then(function () {
        URL = this.getCurrentUrl();
        NotebookID = URL.substring(41);
        this.echo(NotebookID);
        Title = this.fetchText({type: 'xpath', path: '//*[@id="notebook-title"]'});
        this.echo(Title);
    });

    functions.create_notebook(casper);

    //open the Advanced Dropdown 
    functions.open_advanceddiv(casper);

    casper.then(function () {
        this.evaluate(function () {
            $('#import_notebooks').click();
        });
        this.echo('opened import notebook dialog box');
        this.wait(2000);
        casper.evaluate(function () {
            $('#import-gists').val(NotebookID);
        });
        this.echo('Entering notebook ID');
        this.wait(2000);
        this.evaluate(function () {
            $('#import-notebooks-dialog span.btn-primary').click();
            console.log("Clicking on import button");
        });
    });

    casper.selectOptionByText = function (selector, textToMatch) {
        this.evaluate(function (selector, textToMatch) {
            var select = document.querySelector(selector),
                found = false;
            Array.prototype.forEach.call(select.children, function (opt, i) {
                if (!found && opt.innerHTML.indexOf(textToMatch) !== -1) {
                    select.selectedIndex = i;
                }
            });
        }, selector, textToMatch);
    };

    casper.wait(4000).then(function () {
        this.selectOptionByText("ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > div:nth-child(1) > span:nth-child(1)", Title);
        console.log("Successfully imported Notebook which consists python cells in it");
    });

    casper.run(function () {
        test.done();
    });
});