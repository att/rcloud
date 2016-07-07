/*
 Author: Prateek
 Description:To show the source code in editable format or after executing the cells, click on toggle button to edit the code
 */

//Begin Test
casper.test.begin("To show the source code in editable format/after executing the contents, clicking in toggle button ", 7, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var errors = [];
    var input_code = 'a<-25 ; print a';
    var input_code1 = '; b<-25; print b';
    var temp;
    var temp2;

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

    //Creating a new notebook
    functions.create_notebook(casper);

    //Add new cell
    functions.addnewcell(casper);

    //add contents to the cell
    functions.addcontentstocell(casper, input_code);

    //change the language from R to Markdown
    casper.wait(4000).then(function () {
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

    casper.then(function () {
        this.reload();
        this.wait(5000).then(function () {
            functions.runall(casper);
        });
    });


    //Check whether the output div is visible and also fetch the output for comaprison
    casper.wait(4000).then(function () {
        this.test.assertVisible(x(".//*[@id='part1.md']/div[3]/div[2]"), 'Executed the contents and output is visble');
        temp = this.fetchText(x(".//*[@id='part1.md']/div[3]/div[2]"));
    });

    //Clicking on toggle button to edit the code
    casper.then(function () {
        var z = casper.evaluate(function () {
            $('.icon-edit').click();
        });
        console.log('clicking on Toggle button');
        this.wait(3000);
        this.sendKeys(x(".//*[@id='part1.md']/div[3]/div[1]/div[2]/div/div[2]/div"), input_code1);
    });

    //Clicking on RunAll icon
    functions.runall(casper);

    //Fetch the output to compare with the earlier output of the code
    casper.wait(4000).then(function () {
        temp1 = this.fetchText(x(".//*[@id='part1.md']/div[3]/div[2]"));
    });

    //Comparison between the output
    casper.wait(4000).then(function () {
        if (temp != temp1) {
            this.test.pass('contents are changed after clicking on toggle button');
        } else {
            this.test.fail('Failed to click on toggle button');
        }
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


