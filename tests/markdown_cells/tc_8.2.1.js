/*
 Author: Prateek
 Description:A Markdown cell can be created by changing the language of prompt cell to MArkdown and deleting the cell
 */

//Begin Test
casper.test.begin("deleting the created markdown cell ", 6, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var errors = [];
    var input_code = 'a<-25 ; print a';

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

    //create a new notebook
    functions.create_notebook(casper);

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
    });

    //create a new cell
    casper.wait(3000).then(function () {
        functions.addnewcell(casper);
        console.log('markdown Language is selected from the drop down menu');
    });

    //adding contents to the newly created Markdown cells
    casper.wait(3000).then(function () {
        this.waitForSelector(x(".//*[@id='part1.md']/div[3]/div[1]/div[2]/div/div[2]/div"), function () {
            console.log("confirmed that cell has been created");
            this.sendKeys(x(".//*[@id='part1.md']/div[3]/div[1]/div[2]/div/div[2]/div"), input_code);
        });
        functions.runall(casper);
    });

    //verfying the results
    casper.wait(3000).then(function () {
        this.test.assertVisible({type: 'xpath', path: ".//*[@id='part1.md']/div[3]/div[2]/p"}, 'Cell gets executed');
        console.log('Contents are added to the cell');
    });

    //Deleting the created cell
    casper.wait(3000, function () {
        this.click(x(".//*[@id='selection-bar']/div/div/input"));
        console.log("Selecting check box to delete the cell");
        this.click(x(".//*[@id='selection-bar-delete']"));
        console.log('clicking on Delete icon');
        this.wait(2000);
        this.test.assertNotVisible(x(".//*[@id='part1.md']/div[3]/div[2]/p"), 'Cell gets deleted after clicking on Delete icon');
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
	
	

	
	
