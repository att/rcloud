/*
 Author: Prateek
 Description:To toggle the display of output div for Shell cell which is already executed 
 */

//Begin Test
casper.test.begin("Hide/show output", 5, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var errors = [];
    var input = 'pwd';

    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
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

    //create a new notebook
    functions.create_notebook(casper);

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
            form.selectedIndex = 4;
            $(form).change();
        });
    });

    //create a new cell
    casper.then(function () {
        console.log('Shell Language is selected from the drop down menu');
        functions.addnewcell(casper, "New Python cell is created");
    });

    casper.then(function () {
        this.sendKeys({type: 'css', path: '.ace_content'}, input);
        this.wait(2000);
    });

    functions.runall(casper);

    casper.then(function () {
        this.exists(x(".//*[@id='part1.sh']/div[3]/div[2]/pre/code"));
        console.log('Shell cell has produced expected Output, so code can be written in Shell cell');
    });

    casper.then(function () {
        var z = casper.evaluate(function () {
            $('.icon-picture.borderable.icon-border').click();
        });
        console.log('Clicking on Show/Hide Output ');
        this.wait(5000);
        this.test.assertNotVisible('.r-result-div>pre>code', "Output is not visible after clicking on Hide output");
    });

    //Registering to the page.errors actually not required but still if there are some errors found on the page it will gives us the details
    casper.on("page.error", function (msg, trace) {
        this.echo("Error:    " + msg, "ERROR");
        this.echo("file:     " + trace[0].file, "WARNING");
        this.echo("line:     " + trace[0].line, "WARNING");
        this.echo("function: " + trace[0]["function"], "WARNING");
        errors.push(msg);
    });

    casper.run(function () {
        if (errors.length > 0) {
            this.echo(errors.length + ' Javascript errors found', "WARNING");
        } else {
            this.echo(errors.length + ' Javascript errors found', "INFO");
        }
        test.done();
    });
});