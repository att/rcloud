/*
 Auther : Tejas (tc_33.1.1.js)
 Description: This is a casperjs automated test script for showing that ,Under the data frame div, present in the right-side panel, if a
              data frame is created, then it is shown in the data section in the data frame div
 */

//begin test
casper.test.begin("Display the variable value in dataframe div", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid;//to get the notebook id
    var input1 = "x = c(2, 3, 5);n = c('aa', 'bb', 'cc');b = c(TRUE, FALSE, TRUE);df = data.frame(x, n, b);print(df)"; // code1

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

    //Creating new notebook
    functions.create_notebook(casper);

    //Creating a new cell
    functions.addnewcell(casper);

    //Add contents to the created cell and execute it
    functions.addcontentstocell(casper, input1);

    //Opening workspace div
    casper.then(function () {
        if (this.visible('#enviewer-body-wrapper')) {
            console.log('workspace div is open');
        }
        else {
            var y = casper.evaluate(function () {
                $('#accordion-right .icon-sun').click();
            });
            console.log("workspace div was not opened hence clicking on it");
        }
    });

    //check data frame contents in dataframe div
    casper.then(function () {
        var z = casper.evaluate(function () {
            $('#enviewer-body>table>tr>td>a').click();//clicking dataframe link
            this.echo('clicking on dataframe');
        });        
        this.exists('#viewer-body', 'Dataframe contents are displayed' )
    });

    casper.run(function () {
        test.done();
    });
});
