/* 
 Author: Prateek
 Description:While executing various commands in a notebook and trying out the various features present in the Rcloud main page, 
 * if some error occurs in a particular session, then it is displayed in the Sessions div.Here, 
 * one example test case is shown(using invalid notebook id for loading). Clicking the close icon closes the error message
 */

//Begin Tests

casper.test.begin(" Closing the Error which is produced under session div", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_id = "68169c21a8c728hhf83f";//Invalid notebook ID to produce error under session div
    var title;

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

    //open notebook with invalid ID, to produce Error under session div
    casper.viewport(1366, 768).thenOpen('http://127.0.0.1:8080/main.html?notebook=' + notebook_id, function () {
        this.wait(10000);
    });

    casper.wait(5000);

    //Checking whether session div has produced error messgae or not
    casper.then(function () {
        this.test.assertExists({
            type: 'xpath',
            path: ".//*[@id='session-info']/div"
        }, 'Error is displayed under session div');
        console.log('session div has produced Error');
    });

    //clicking on close icon
    casper.then(function () {
        this.wait(5000);
        this.click({type: 'xpath', path: ".//*[@id='session-info']/div/button"}, 'clicking on close icon');
        this.wait(3000);
    });

    casper.then(function () {
        this.test.assertDoesntExist({
            type: 'xpath',
            path: ".//*[@id='session-info']/div"
        }, 'After clicking on close icon,Error is closed from the session div');
        console.log('Error is not present under session div');
    });

    casper.run(function () {
        test.done();
    });
});
    
    
    
    
    
    
