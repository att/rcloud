/* 
 Author: Sanket 58.4.3
 Description: TThis casperjs test script tests whether existing notebook can be assigned to any existing group
 */
//Begin Tests

casper.test.begin("Importing External private notebook", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_name, status, url, notebookid;
    var input_code = "a<-100+50\n a";
    var expectedresult = "150";

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
    functions.create_notebook(casper);
    notebook_name = functions.notebookname(casper);


    casper.then(function () {
        this.mouse.move('ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > div:nth-child(1)');
        this.wait(2000)
        this.click("ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)")

        this.then(function () {
            this.wait(3000)
            this.click('.group-link > a:nth-child(1)')
        });

        this.wait(5000).then(function () {
            // this.wait(4000)
            this.click('#greenRadio')

        });
        this.wait(5000).then(function () {
            // this.wait(3000)
            this.click('span.btn:nth-child(3)');
        });
    });

    casper.wait(4000).then(function () {
        this.mouse.move('ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > div:nth-child(1)');
        this.wait(2000)
        this.click("ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)")
        this.then(function () {
            this.wait(3000);
            this.waitForSelector(".group-link > a:nth-child(1)", function () {
                status = this.fetchText('.group-link > a:nth-child(1)')

            })
            this.wait(3000)
            this.test.assertNotEquals(status, 'private', "The notebook is no longer private")
            this.test.assertNotEquals(status, 'public', "The notebook is no longer public")
            this.echo("Notebook is assigned to group: " + status)
        });
    });

    // delete the notebook taht is just assigned
    casper.then(function () {
        this.mouse.move('ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > div:nth-child(1)');
        this.wait(2000)
        this.click('ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(5) > i:nth-child(1)')
    });


    casper.run(function () {
        test.done();
    });
});

