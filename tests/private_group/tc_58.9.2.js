/* 
 Author: Prateek 58.9.2
 Description: Check whether user is able to upload any file to the notebook which is assigned to Group or not
 */

//Begin Tests
casper.test.begin("Uploading file to the asset after assigning any notebook to the perticular group", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_name, status, url, notebookid;
    var before, after;
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

    functions.create_notebook(casper);

    //Function to generate group names 
    casper.then(function () {
        ID = this.evaluate(function () {
            return Math.random().toString(36).substr(2, 9);
        });
    });

    // //Creating a group
    casper.then(function () {
        this.click("li.dropdown > a:nth-child(1)");
        this.evaluate(function () {
            $('#manage_groups').click();
        });
        this.echo('opened manage group dialog box');
        this.wait(2000);
    });

    casper.then(function () {
        this.wait(4000);
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Enter new group name") {
                return ID;
            }
        });
    });

    //Creating a group
    casper.then(function () {
        this.click("li.dropdown > a:nth-child(1)");
        this.evaluate(function () {
            $('#manage_groups').click();
        });
        this.echo('opened manage group dialog box');
        this.wait(2000);
    });

    casper.then(function () {
        this.wait(4000);
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Enter new group name") {
                return ID;
            }
        });
        this.click('span.label:nth-child(1)');
        this.echo('Entered Group name');
        this.evaluate(function () {
            $('span.btn:nth-child(3)').click();
        });
        this.wait(5000);
        this.echo('Created a new group');
    });

    casper.wait(5000);

    //Assigning notebook to group
    casper.then(function () {
        this.mouse.move('.jqtree-selected > div:nth-child(1)');
        this.wait(2000)
        this.click(".jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)")
        before = this.fetchText(".group-link > a:nth-child(1)");
        this.echo(before);
        this.then(function () {
            this.wait(3000);
            this.click('.group-link > a:nth-child(1)')
        });
        this.then(function () {
            this.click('#greenRadio');
            console.log("Selecting Group radio button");
            this.wait(4000);
            this.setFilter("page.prompt", function (msg, currentValue) {
                this.echo(msg);
                if (msg === "Are you sure you want to make notebook " + notebook_name + " to group") {
                    return TRUE;
                }
            });
            this.click('span.btn:nth-child(3)');
            this.echo('notebook is assigned to group successfully')
        });
    });

    casper.then(function () {
        this.mouse.move('.jqtree-selected > div:nth-child(1)');
        this.wait(2000)
        this.click(".jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)")
        this.then(function () {
            this.wait(3000)
            after = this.fetchText(".group-link > a:nth-child(1)");
            this.echo(after);
            this.test.assertNotEquals(before, after, "Confirmed that notebook is assigned to group");
        });
    });

    casper.wait(8000);

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

    casper.wait(2000);

    casper.then(function () {
        this.waitUntilVisible(x('//*[contains(text(), "added")]'), function then() {
            console.log("File has been uploaded");
        });
        this.test.assertSelectorHasText(x(".//*[@id='asset-list']/li[3]/div/span[1]"), 'PHONE.csv', 'Uploaded file is present in assets');
    });

    casper.run(function () {
        test.done();
    });
});

