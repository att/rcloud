/* 
 Author: Prateek
 Description: This casperjs test script test whether the shareable link (view.html) can be loaded by anonymous user after making it private
 */
//Begin Tests

casper.test.begin("Opening private notebook through shareable links as anonymous user", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_name, status, url, notebookid
    var input_code = "a<-100+50\n a";
    var expectedresult = "150"

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
    functions.addnewcell(casper);
    functions.addcontentstocell(casper, input_code);

    //Fetch notebook name
    notebook_name = functions.notebookname(casper)

    //Make notebook privet
    casper.then(function () {
        this.mouse.move('.jqtree-selected > div:nth-child(1)');
        this.wait(2000)
        this.click(".jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)")
        this.then(function () {
            this.wait(3000)
            this.click('.group-link > a:nth-child(1)')
        });
        this.then(function () {
            this.click('#yellowRadio')
            this.wait(4000)

            this.setFilter("page.prompt", function (msg, currentValue) {
                this.echo(msg)
                if (msg === "Are you sure you want to make notebook " + notebook_name + " truly private?") {
                    return TRUE;
                }
            });
            this.click('span.btn:nth-child(3)');
            this.echo('notebook is made private successfully')
        });
    });

    //validate if notebook has become private
    casper.wait(4000).then(function () {
        this.mouse.move('.jqtree-selected > div:nth-child(1)');
        this.click(".jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)");
    });

    casper.then(function () {
        url = this.getCurrentUrl()
        this.echo('current url is ' + url)
        notebookid = url.substring(41);
        this.echo("The Notebook Id: " + notebookid);
    });

    casper.then(function () {
        this.waitForSelector(".group-link > a:nth-child(1)", function () {
            this.wait(3000);
            status = this.fetchText('.group-link > a:nth-child(1)');
            this.echo("Currnt status of notebook is " + status)
        });
        this.test.assertSelectorHasText(".group-link > a:nth-child(1)", "private");
    });


    //loging out of RCloud
    casper.viewport(1366, 768).then(function () {
        this.wait(3000)
        console.log('Logging out of RCloud');
        this.click("#rcloud-navbar-menu > li:nth-child(7) > a:nth-child(1)");
        this.wait(2000)
    });


    //open view.html as anonymous user
    casper.viewport(1366, 768).thenOpen('http://127.0.0.1:8080/view.html?notebook=' + notebookid, function () {
        this.wait(6000);
        this.waitForSelector({type: 'css', path: '.alert'}, function () {
            console.log("Verified that alert message is displayed successfully");
        });
    });

    casper.run(function () {
        test.done();
    });
});