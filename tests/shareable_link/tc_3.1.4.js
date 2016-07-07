/* 
 Author: Prateek
 Description:    This is a casperjs automated test script for showing that after clicking on "Edit Notebook" option ,
 the main.html page opens and Show source option is selected by default under "Advanced"
 dropdown list.
 */
//Begin Tests

casper.test.begin(" By default, Show Source is not selected", 7, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input = 'a<-500;b<-500;a+b';
    var NotebookID;//to get the notebook id

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

    functions.create_notebook(casper);

    functions.addnewcell(casper);

    functions.addcontentstocell(casper, input)

    casper.then(function () {
        var URL = this.getCurrentUrl();
        NotebookID = URL.substring(41);
    });
    casper.viewport(1366, 768).thenOpen('http://127.0.0.1:8080/view.html?notebook=' + NotebookID, function () {
        this.wait(30000);
    });

    casper.viewport(1366, 768).then(function () {
        this.test.assertExists('.dropdown-toggle', "whether View.html page loaded properly or not, verifying with Advanced drop down exists");
    });

    casper.wait(5000);

    //validating that by default the Show source option is selected
    casper.viewport(1024, 768).then(function () {
        this.click(".dropdown-toggle");
        this.wait(2000);
        //var z = this.fetchText({type:'xpath', path:"/html/body/div[2]/div/div[2]/ul[2]/li[2]/ul/li[2]/a/i"});
        //this.echo( z );
        //Checking whether source code is exists or not
        this.test.assertDoesntExist({
            type: 'xpath',
            path: '/html/body/div[3]/div/div/div/div[1]/div/div[2]/div[1]/div[1]/pre/code'
        }, 'When view.html page opens, source code doesnot exists. Hence "Show source" check box is not selected by default');
        this.wait(5000);
    });

    casper.run(function () {
        test.done();
    });

});
    
