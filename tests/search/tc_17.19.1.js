/*
 Author: Prateek
 Description: This is a casperjs automated test script for showing that,If the content
 *  present in an asset is searched, the Notebook descriptions and the Searched asset contents should be displayed 

 */
//Begin Tests

casper.test.begin("Assets contents as Searched text", 8, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var search = 'GOOSEBUMP';//item to be searched
    var title;//get notebook title
    var notebookid = '75e0966de0bb185d7432';//to get the notebook id

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

    casper.wait(5000);

    casper.then(function () {
        this.test.assertSelectorHasText(x(".//*[@id='0']/table/tbody/tr[2]/td/table/tbody/tr/td"), search, 'Assets contents as Searched text');
        
    });

    casper.run(function () {
        test.done();
    });
});
