/*
 Author: Sanket (tc_61.2.1.js)
 Description: This is casperJS automated test to check whether locator() gets invoked with R cell having plot in view.html
 */

//Begin

casper.test.begin("Invoke locator function with plot in view.html", 8, function suite(test) {
    var x = require('casper').selectcss;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code = "plot(1:10)";
    var notebookid

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

    //add a new cell and execute its contents
    casper.wait(2000).then(function(){
        functions.addnewcell(casper);
    });

    casper.wait(2000).then(function(){
        functions.addcontentstocell(casper,input_code);
    });
    
       
    //Add new cell and call locator() from that cell
    casper.wait(2000).then(function(){
        functions.addnewcell(casper);
    });



    //add contents to new cell
    casper.wait(2000).then(function(){
        if (this.visible({
                    type: 'xpath',
                    path: ".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"
                })) {  
                this.test.pass('The cell is present');
                console.log('Adding contents to the cell')
                this.sendKeys({
                    type: 'xpath',
                    path: ".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"
                }, 'locator(2)');

                this.click({
                    type: 'xpath',
                    path: ".//*[@id='part2.R']/div[2]/div[2]/span[1]/i"
                });//xpath for executing the contents

                this.echo("executed contents of second cell");
                this.wait(6000);
            }
            else {
                this.test.fail('Cell is not present to pass the code content');
            }
    });


    casper.viewport(1024, 768).then(function () {
        var notebook_url = this.getCurrentUrl();
        notebookid = notebook_url.substring(41);
        this.echo("The Notebook Id: " + notebookid);
    });

    casper.wait(2000).then(function () {
        this.wait(5000);
        this.waitForSelector({type: 'css', path: 'html body div.navbar div div.nav-collapse ul.nav li span a#share-link.btn'}, function () {
            console.log("Shareable link found. Clicking on it");
            casper.viewport(1366, 768).thenOpen('http://127.0.0.1:8080/view.html?notebook=' + notebookid, function () {
                this.wait(7000);
                this.echo("The view.html link for the notebook is : " + this.getCurrentUrl());
            });
        });
    });


    //check for locator feature by checking the crosshair cursor
    casper.wait(3000).then(function() {
        var str = this.getElementsAttribute('.live-plot-container', 'style'); 
        this.test.assertEquals(str,['cursor: crosshair;'], 'Locator function got invoked successfully')
        this.wait(3000)
    });


    casper.run(function () {
        test.done();
    });
});
    


