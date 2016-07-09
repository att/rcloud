/* 
 Author: Tejas
 Description:This is a casperjs automated test script,For the given combination, selecting Coalesce Cell option 
 * for the bottom cell results in merging of the bottom cell with the top one.
 */

//Begin Tests

casper.test.begin("Combination of two Markdown cell", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input = 'a<-1000;b<-2000;a+b';

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


    //Create a new cell
    casper.then(function () {
        this.click(x(".//*[@id='prompt-area']/div[1]/div/span/i"));
        console.log("Creating new cell")
    })

    casper.wait(4000).then(function () {
        this.sendKeys(x(".//*[@id='part2.md']/div[3]/div[1]/div[2]/div/div[2]/div"), input);
        console.log('adding contents to the cell');
    });

    //Executing the cells
    functions.runall(casper);

    //Clicking on join icon
    casper.then(function () {
        this.click(x(".//*[@id='part2.md']/div[1]/span[2]/i"));
    });

    //Checking for the second cell
    casper.then(function () {
        this.test.assertDoesntExist(x(".//*[@id='part2.md']/div[3]/div[2]"), "After joining two cell's second cell doesn't exists");
    });

    functions.delete_notebooksIstarred(casper);

    casper.run(function () {
        test.done();
    });
});
