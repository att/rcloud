/*
 Author: Prateek
 Description:  This is a casperjs automated test script for showing that,Clicking the individual run of the cell
 *  for multiple cells shows output of the cells executed in the order of execution

 */

//Test begins
casper.test.begin(" Individual cells produces respective output even after clicking on individual click of run", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code1 = 'a<-50\n a';
    var input_code2 = "b<- a+50\n b";
    var input_code3 = "b";

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

    //Creatin cell and adding content
    casper.then(function (){
        this.click(x(".//*[@id='prompt-area']/div[1]/div/span/i"));

        //Adding contents to cell
        this.waitForSelector(x(".//*[@id='part1.R']/div[3]/div[1]/div[2]/div/div[2]/div"), function (){
            this.sendKeys(x(".//*[@id='part1.R']/div[3]/div[1]/div[2]/div/div[2]/div"), input_code1);
        });
    });
    
    //Added a new cell 
    casper.then(function (){
        this.click(x(".//*[@id='prompt-area']/div[1]/div/span/i"));

        //Adding contents to cell
        this.waitForSelector(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), function (){
            this.sendKeys(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), input_code2);
        });
    });

    //Click on Run button of 1st cell
    casper.then(function() {
        this.click(x(".//*[@id='part1.R']/div[2]/div[2]/span[1]/i"))
        console.log('Clicking on run icon of first cell');
    });

    casper.wait('5000');

    //Click on run button of second cell
    casper.then(function() {
        this.click(x(".//*[@id='part2.R']/div[2]/div[2]/span[1]/i"));
        console.log('Clicking on run icon of second cell');
    });

    //Verifying the results
    casper.wait(5000).then(function(){
        test.assertSelectorHasText(x(".//*[@id='part2.R']/div[3]/div[2]/pre/code"), '100',"The notebook's cells are executed sequentially");
        console.log("The notebook cells are executed sequentially");
    });

    casper.run(function () {
        test.done();
    });
});
