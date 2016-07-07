/*
 Author: Prateek
 Description: This is a casperjs automated test script for showing that,When an external notebook is imported using the link 
 "Import External Notebooks", it gets added to the list of existing notebooks. The gist of notebook can then be opened in
  GitHub by selecting the link for "Open in GitHub" under the Advanced drop-down link present on the top-right corner of the page
 */
//Begin Tests

casper.test.begin("Importing a Notebook in a folder", 7, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var Notebook_ID = '7f90ae7dbe9fb01898f1';
    var title = 'Guess the number';

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

    //open the Advanced Dropdown 
    functions.open_advanceddiv(casper);

    casper.then(function () {
        this.evaluate(function () {
            $('#import_notebooks').click();
        });
        this.echo('opened import notebook dialog box');
        this.wait(2000);

        casper.evaluate(function () {
            $('#import-gists').val('bc2e94c8e0e35e8a44c0');
        });
        this.wait(2000);
        this.evaluate(function () {
            $('#import-notebooks-dialog span.btn-primary').click();
            console.log("Clicking on import button");
        });
    });

    casper.wait(5000);

    casper.then(function (){
        var flag = 0;//flag variable to test if the Notebook was found in the div
        var counter = 0;
            do
            {
                counter = counter + 1;
                this.wait(2000);
            } 
            while (this.visible('ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child('+counter+') > div:nth-child(1)'));
            counter = counter - 1;
            for (i = 1; i <= counter; i++) {
                this.wait(5000);
                Notebook = this.fetchText('ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child('+i+') > div:nth-child(1)')
                Notebook=Notebook.substring(0,16)
                if (title == Notebook) {
                    flag = 1;
                    break;
                }
            }//for closes
            if (flag == 1) {
                this.test.assertEquals(flag, 1, "Import Notebook from File, Notebook with title " + title + " is PRESENT under Notebooks tree");
            }
            else {
                this.test.assertEquals(flag, 0, "Import Notebook from File, Notebook with title " + title + " is ABSENT under Notebooks tree");
            }
            this.click('ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child('+i+') > div:nth-child(1)');
    });

    //open the Advanced Dropdown 
    functions.open_advanceddiv(casper);

    //open the notebook in Github 
    casper.viewport(1366, 768).then(function () {

        this.waitForSelector({type: 'css', path: '#open_in_github'}, function () {
            console.log("Link for opening notebook in github found. Clicking on it");

            if (this.click({type: 'css', path: '#open_in_github'})) {

                this.wait(7000);
                this.viewport(1366, 768).waitForPopup(/gist.github.com/, function () {
                    this.test.assertEquals(this.popups.length, 1);
                });
                this.wait(11000);
                this.viewport(1366, 768).withPopup(/gist.github.com/, function () {
                    this.wait(4000);
                    this.test.assertUrlMatch(/gist.github.com*/, 'Notebook opened in github');
                    //verifying that the gist opened belongs to local user
                    this.wait(8000);
                    var gist_user = this.fetchText({type: 'css', path: '.url > span:nth-child(1)'});
                    this.echo("Gist owner is " + gist_user);
                    this.test.assertEquals(gist_user, github_username, 'verified that the gist belongs to the local user');
                });
            }//if ends
            else {
                console.log('Notebook could not be opened in github');
            }
        });
    });

    casper.run(function () {
        test.done();
    });
});