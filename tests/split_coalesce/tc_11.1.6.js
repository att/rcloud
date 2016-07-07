/* 
 Author: Prateek
 Description:This is a casperjs automated test script for showing that if we use split cells to split a cell into two and
 navigate to another notebook then back. The cells should remain split and in the same order as before navigating away.
 */

//Begin Tests

casper.test.begin("Split a cell and switch to another notebook", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var input_code1 = '"JellyBeans"';
    var input_code2 = '"IceCream"';
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid;

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
    casper.then(function () {
        functions.create_notebook(casper);
        this.wait(5000);
    });

    //getting Notebook ID
    casper.viewport(1024, 768).then(function () {
        var temp1 = this.getCurrentUrl();
        notebookid = temp1.substring(41);
        this.echo("The Notebook Id: " + notebookid);
    });

    // Add contents to cell
    casper.then(function () {
        functions.addnewcell(casper);
        functions.addcontentstocell(casper, input_code1);
    });

    //adding new cell
    casper.then(function () {
        this.click(x(".//*[@id='prompt-area']/div[1]/div/span/i"));
        console.log("creating one more cell");
    });

    // Add contents to cell
    casper.wait(3000).then(function () {
        this.sendKeys(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), input_code2);
        this.echo("adding contents to second cell");
    });

    casper.then(function () {
        var z = casper.evaluate(function () {
            $('.icon-edit').click();
        });
        this.echo("clicking on toggle edit button");
    });

    // clicking on coalesce icon
    casper.wait(4000).then(function () {
        // this.click(x(".//*[@id='part2.R']/div[3]/div[1]/div[1]/pre/code/span[2"));
        // this.echo("joining two cells");
        var z = casper.evaluate(function () {
            $('#part2\.R > div:nth-child(1) > span:nth-child(2) > i:nth-child(1)').click();
            this.echo("clicking on split icon");
            this.wait(5000);
        });
    });

    //clicking split icon
    casper.then(function () {
        var z = casper.evaluate(function () {
            $('.icon-unlink').click();
            this.echo("clicking on split icon");
            this.wait(5000);
        });
    });

    //Add new notebook
    casper.then(function () {
        functions.create_notebook(casper);
        this.wait(5000);
    });

    //Going back to the previous notebook
    casper.viewport(1024, 768).then(function () {
        this.open('http://127.0.0.1:8080/edit.html?notebook=' + notebookid).then(function () {
            this.wait(10000);
            this.echo('Switching back to the previous notebook');
        });
    });
	
    //checking for split cell		
    casper.wait(6000).viewport(1024, 768).then(function () {
        this.wait(5000)
        this.echo('verifying that the cells are still in split mode ');
        this.wait(3000);
        this.test.assertSelectorHasText(x(".//*[@id='part2.R']/div[3]/div[1]/div[1]/pre/code"), input_code2, 'Cells will be splitted, even after switching back from another notebook');
    });

    casper.run(function () {
        test.done();
    });
});

