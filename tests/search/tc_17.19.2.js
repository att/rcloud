/*
 Author: Prateek
 Description:This is a casperjs automated test script for showing that,If the title of an asset is searched, 
 only the Notebook descriptions should be displayed 
*/
//Begin Tests

casper.test.begin("Assets name as Searched text", 7, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid = 'f6c36f81d0aa69b41a04';//to get the notebook id
    var search = 'DINGRA';

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
    
    //Loading Notebook 
    casper.viewport(1366, 768).thenOpen('http://127.0.0.1:8080/edit.html?notebook=' + notebookid, function () {
        this.wait(5000);
        this.waitForSelector({type: 'css', path: '#share-link .icon-share'}, function () {
            console.log("Verified that page is loaded successfully");
        });
    });
    
    functions.fork(casper);

    functions.addnewcell(casper);

    functions.addcontentstocell(casper, "INPUT_CODE");

    functions.search1(casper, search);

    functions.search1(casper, search);

    casper.wait(5000);

    casper.then(function () {
        this.exists({
            type: 'xpath',
            path: ".//*[@id='search-results']/table/tbody/tr/td"},'Asset title searched text');      
    });

    casper.run(function () {
        test.done();
    });
});
