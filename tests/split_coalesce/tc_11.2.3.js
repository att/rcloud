/* 
 Author: Tejas
 Description:This is a casperjs automated test script,For the given combination, For the given combination, selecting Coalesce 
 * Cell option for the bottom cell results in merging of the bottom cell with the top one. The content of R cell is enclosed within "…{r}" 
 * and "…"
 */

//Begin Tests

casper.test.begin("Combination of R cell beneath and Markdown cell on top of it", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));

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

    functions.addnewcell(casper);

    functions.addcontentstocell(casper, "a<-12;b<-12;a+b");

    //change the language from R to Markdown
    casper.then(function () {
        this.mouse.click({type: 'xpath', path: ".//*[@id='prompt-area']/div[1]/div/select"});//x path for dropdown menu
        this.echo('clicking on dropdown menu');
    });

    //selecting Markdown from the drop down menu
    casper.wait(2000).then(function () {
        this.evaluate(function () {
            var form = document.querySelector('.form-control');
            form.selectedIndex = 0;
            $(form).change();
        });
        console.log('Markdown Language is selected from the drop down menu');
    });

    casper.then(function () {
        this.reload();
        this.wait(5000);
    });

    //Adding onemore cell
    casper.wait(2000).then(function () {
        this.click(x(".//*[@id='prompt-area']/div[1]/div/span/i"));
        this.wait(8000);
    });

    //Adding cell contents
    casper.wait(4000).then(function () {
        this.waitForSelector(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), function () {
            this.sendKeys(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), "a<-12;b<-12;a+b");
        });
    });

    functions.runall(casper);

    casper.then(function () {
        this.reload();
        this.wait(5000);
    });

    casper.wait(2000).then(function () {
        console.log("clicking on Join cell icon");
        this.click(x(".//*[@id='part2.R']/div[1]/span[2]/i"));
    });

    //Clicking on edit toggle button
    casper.wait(3000).then(function () {
        this.click(x(".//*[@id='part1.md']/div[2]/div[2]/span[2]/i"));
    });

    //Verifying and valiadting
    casper.viewport(1024, 768).then(function () {
        this.wait(3000);
        casper.test.assertSelectorHasText(x(".//*[@id='part1.md']/div[3]/div[1]/div[1]/pre/code"), '```{r}', 'The content of R cell is enclosed within "…{r}" and "…"');
    });

    functions.delete_notebooksIstarred(casper);

    casper.run(function () {
        test.done();
    });
});

