/*
Auther : Tejas 
Description:    This is a casperjs automated test script for showing that, Creating a new cell using add new cell option
*/


casper.test.begin("Creating a new cell using + sign option", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid;//to get the notebook id
    var input_content="a<-12"; // variable initialisation
    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
    });

    casper.wait(10000);

    //login to Github and RCloud
    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
       functions.validation(casper);
        this.wait(4000);
    });

    casper.then(function(){
        functions.create_notebook(casper);
        this.wait(5000);
    });

    casper.then(function () {
        this.test.assertTruthy(this.click({
            type: 'xpath',
            path: '/html/body/div[3]/div/div[2]/div/div[3]/div[1]/div/span/i'
        }), 'created new cell');
        this.wait(7000);
    });

    casper.then(function () {
        this.visible('.ace_content', 'New cell has been created')
    });

    casper.run(function () {
        test.done();
    });
});
