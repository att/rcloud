/* 
 Author: Prateek 58.5.5
 Description: Check whether user is able to upload any file to the private notebook or not
 */
//Begin Tests

casper.test.begin("Check whether user is able to upload any file to the private notebook or not", 8, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_name, status, url, notebookid;
    var input_code = "a<-100+50\n a";
    var expectedresult = "150";
    var fileName = "SampleFiles/PHONE.csv";
    var system = require('system');
    var currentFile = require('system').args[4];
    var curFilePath = fs.absolute(currentFile);
    var curFilePath = curFilePath.replace(currentFile, '');
    fileName = curFilePath + fileName;

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

    //Make notebook private
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
    casper.then(function () {
        this.mouse.move('.jqtree-selected > div:nth-child(1)');
        this.wait(2000)
        this.click(".jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)")
        this.then(function () {
            this.wait(3000)
            status = this.fetchText('.group-link > a:nth-child(1)')
            this.echo("notebook is " + status)
            this.wait(3000)
            this.test.assertEquals(status, 'private', "The notebook has been converted to private successfully")
        });
    });

    //Verifying whether file upload div is open or not
    casper.then(function () {
        if (this.visible(x(".//*[@id='file']"))) {
            this.echo('File Upload pane div is open');
            this.wait(5000);
        }
        else {
            this.echo('File upload div is not open,hence opening it');
            this.wait(6000);
            this.click(x(".//*[@id='accordion-right']/div[2]/div[1]"));
            this.wait(5000);
        }
    });

    //Uploading file
    casper.then(function () {
        this.evaluate(function (fileName) {
            __utils__.findOne('input[type="file"]').setAttribute('value', fileName)
        }, {fileName: fileName});
        this.page.uploadFile('input[type="file"]', fileName);
        console.log('Selecting a file');
    });

    casper.then(function () {
        this.wait(5000, function () {
            this.click(x(".//*[@id='upload-to-notebook']"));
            console.log("Clicking on Upload to notebook check box");
            this.click(x(".//*[@id='upload-submit']"));
            console.log("Clicking on Submit icon");
        });
    });

    casper.then(function () {
        this.wait(5000);
        this.waitUntilVisible(x('//*[contains(text(), "added")]'), function then() {
            console.log("File has been uploaded");
        });
    });

    casper.then(function () {
        console.log('Verifying whether the uploaded contentsa are present in Asset div or not');
        this.test.assertSelectorHasText(x(".//*[@id='asset-list']/li[3]/div/span[1]"), 'PHONE.csv', 'Uploaded file is present in assets');
    });

    casper.wait(3000);

    casper.then(function () {
        before = this.fetchText('.active > a:nth-child(1) > span:nth-child(1)');
        console.log("before Modifying asset name is:" + before);
    });

    casper.then(function () {
        var z = casper.evaluate(function triggerKeyDownEvent() {
            jQuery(".active > a:nth-child(1) > span:nth-child(1)").text("Modified");
            var e = jQuery.Event("keydown");
            e.which = 13;
            e.keyCode = 13;
            jQuery(".active > a:nth-child(1) > span:nth-child(1)").trigger(e);
            return true;
        });
        this.click(x(".//*[@id='rcloud-navbar-main']/li[4]"));
        console.log("After editing, clicking on Save icon");
    });

    casper.then(function () {
        after = this.fetchText('.active > a:nth-child(1) > span:nth-child(1)');
        console.log("before Modifying asset name is:" + after);
    });

    casper.then(function () {
        this.test.assertNotEquals(before, after, "Uploaded asset" + before + "gets renamed with" + after + "hence assets can be Modified/editable after making notebook private");
    });

    casper.wait(8000);

    casper.run(function () {
        test.done();
    });
});
    