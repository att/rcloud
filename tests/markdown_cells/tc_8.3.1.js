/*
 Author: Prateek
 Description:To insert a Markdown cell with respect to a R cell i.e, insert a Markdown cell by clicking on the '+' icon
 * present on top of the R Cell and changing the language
 */

//Begin Test
casper.test.begin("Creating a combination of R and Markdown cells ", 9, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code = "'WELCOME TO RCLOUD'";
    var input_code1 = "a<-25; a"

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

    functions.addnewcell(casper);

    functions.addcontentstocell(casper, input_code);

    //change the language from R to Markdown
    casper.wait(4000).then(function () {
        this.mouse.click({type: 'xpath', path: ".//*[@id='part1.R']/div[2]/div[2]/select"});//x path for dropdown menu
        this.echo('clicking on dropdown menu');
        this.wait(2000);
    });

    //selecting Markdown from the drop down menu
    casper.then(function () {
        this.evaluate(function () {
            var form = document.querySelector('select.form-control:nth-child(1)');
            form.selectedIndex = 0;
            $(form).change();
        });
    });

    casper.wait(4000).then(function () {
        this.click("div.cell-control-bar:nth-child(1) > span:nth-child(1) > i:nth-child(1)");
        console.log('creating one more cell');
    });

    casper.wait(5000).then(function () {
        this.waitForSelector("div.edit-code > div:nth-child(3) > div:nth-child(1)", function () {
            this.sendKeys("div.edit-code > div:nth-child(3) > div:nth-child(1)", input_code1);
        });
    });

    casper.wait(4000).then(function () {
        this.click("#run-notebook");
        console.log("Saving the changes made to the notebook")
        this.wait(3000);
        this.reload();
        this.wait(3000);
    });

    casper.wait(8000).then(function () {
        functions.runall(casper);
    })

    casper.wait(4000).then(function () {
        if (this.test.assertVisible(x(".//*[@id='part1.md']/div[3]/div[2]/p"))) {
            this.test.pass('Output div for Markdown cell is visible');
        } else {
            this.test.fail('Output div for Markdown cell  is not visible');
        }
    });

    casper.wait(5000).then(function () {
        this.waitForSelector(x(".//*[@id='part2.R']/div[3]/div[2]/pre/code"), function () {
            if (this.test.assertVisible(x(".//*[@id='part2.R']/div[3]/div[2]/pre/code"))) {
                this.test.pass('Output div for R cell is visible');
            } else {
                this.test.fail('Output div for R cell  is not visible');
            }
        });
    });

    casper.run(function () {
        test.done();
    });
});


