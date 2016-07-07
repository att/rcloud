/*
 Author: Prateek
 Description: This is casperjs script showing that,checking whether the notebook info option is present 
 */

//Begin Tests
casper.test.begin("Notebook info icon", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var title;

    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
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
        initial_title = functions.notebookname(casper);
        this.echo("New Notebook title : " + initial_title);
    });

    casper.then(function () {
        if (this.test.assertVisible({type: 'css', path: '.jqtree-selected > div:nth-child(1) > span:nth-child(1)'})) {
            console.log('selected notbook found');
            this.mouse.move('.jqtree-selected > div:nth-child(1) > span:nth-child(1)');
            this.waitUntilVisible('.icon-info-sign', function () 
            {
                if (this.test.assertVisible({type:'css',path:'.icon-info-sign'}, 'Checking for notebook info icon')) 
                {
                    this.test.pass("Notebook info icon is present");
                } else {
                    this.test.fail("Notebook info icon is not present");
                }
            });

        } else {
            console.log("Notebook not found");
        }
    });
    
    functions.delete_notebooksIstarred(casper);

    casper.run(function () {
        test.done();
    });
});
