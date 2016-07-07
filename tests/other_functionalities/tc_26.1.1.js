/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that An empty cell, when created in a notebook, does not get saved if we
 switch to a different notebook and switch back
*/

//Begin Tests
casper.test.begin("An empty cell does not get saved on switching to a different notebook", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var title;//store Notebook title

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

    // Getting the title of new Notebook
    casper.then(function () {
        title = functions.notebookname(casper);
        this.echo("Notebook title : " + title);
        this.wait(2000);
    });

    //Added a new cell
    functions.addnewcell(casper);

    //Create another new Notebook.
    functions.create_notebook(casper);

    //getting count of notebooks
    var counter = 0;//get count of notebooks
    casper.then(function () {
        this.wait(5000);
        do
        {
            counter = counter + 1;
            this.wait(2000);
        } while (this.visible({type: 'css', path: 'ul.jqtree_common:nth-child(1) > li:nth-child(3) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + counter + ') > div:nth-child(1) > span:nth-child(1)'}));
        counter = counter - 1;
        this.echo("total number of notebooks in Notebooks I Starred div:" + counter);

    });

    //switch back to previous notebook
    casper.then(function () {
        for (var i = 1; i <= counter; i++) {
            this.wait(2000);
            var temp = this.fetchText({type: 'css', path: 'ul.jqtree_common:nth-child(1) > li:nth-child(3) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + i + ') > div:nth-child(1) > span:nth-child(1)'});
            if (temp == title) {
                this.click({type: 'css', path: 'ul.jqtree_common:nth-child(1) > li:nth-child(3) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + i + ') > div:nth-child(1) > span:nth-child(1)'});
                this.echo("Switched back to notebook  " + title);
                break;
            }
        }//for closes
        this.wait(7000);
    });

    //verify that the newly created cell is not present
    casper.viewport(1024, 768).then(function () {
        this.test.assertNotVisible({type: 'css', path: 'div.ace-chrome:nth-child(1) > textarea:nth-child(1)'}, 'Verified that the newly created empty cell is not saved');
    });

    casper.run(function () {
        test.done();
    });
});
