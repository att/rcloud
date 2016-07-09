/*

 Author: Prateek
 Description:This is a casperjs automation script for checking that The loaded notebook will contain R cell which has been executed. Now, edit the
 content of that cell. The 'save' icon present in the navbar on the top-left corner of the page will be enabled. Click on the icon and
 check whether the changes are saved or not
 */
casper.test.begin("Using save icon present in the navbar - Edit R Cell (pre-executed)", 7, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var cellcontent = "654";//content to be added while modifying the cell
    var cellcontent1 = "420";
    var before, before1, after, after1;

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

    //Create a new Notebook.
    functions.create_notebook(casper);

    //Create a new Notebook.
    functions.create_notebook(casper);
    functions.addnewcell(casper);
    functions.addcontentstocell(casper, cellcontent)

    //Add another R cell and enter some contents
    casper.wait(2000).then(function () {
        this.click(x(".//*[@id='prompt-area']/div[1]/div/span/i"), function (){
            console.log("Cell has been created");
        })
    });

    casper.wait(2000).then(function (){
        this.waitForSelector(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), function (){
            this.sendKeys(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), cellcontent);
            console.log('Adding content to cell2')
        });
    });

    //click on the save icon
    casper.then(function () {
        var z = casper.evaluate(function () {
            $('#save-notebook').click();

        });
        this.wait(10000);
        console.log('Save icon is clicked');

    });

    //fetching text of both the cells before reloading and after clicking on save
    casper.wait(4000).then(function (){
        before = this.fetchText(x(".//*[@id='part1.R']/div[3]/div[1]/div[1]/pre/code"));
        before1 = this.fetchText(x(".//*[@id='part2.R']/div[3]/div[1]/div[1]/pre/code"));
    });


    //Reloading the page
    casper.viewport(1366, 768).then(function () {
        //this.wait(30000);
        this.reload(function () {
            this.echo("Main Page loaded again");
            this.wait(9000);
        });
    });

    //fetching text of both the cells before reloading and after clicking on save
    casper.wait(4000).then(function (){
        after = this.fetchText(x(".//*[@id='part1.R']/div[3]/div[1]/div[1]/pre/code"));
        after1 = this.fetchText(x(".//*[@id='part2.R']/div[3]/div[1]/div[1]/pre/code"));
    });

    casper.viewport(1366, 768).then(function () {
        this.test.assertEquals(before, after, "Confirmed cell1 content has been saved by clicking on Run all");
        this.test.assertEquals(before1, after1, "Confirmed cell2 content has been saved by clicking on Run all");
    });


    casper.run(function () {
        test.done();
    });
});
