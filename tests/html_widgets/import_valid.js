/*
 Author: Prateek 
 Description: Check whether the user is able to import valid Rmarkdown file from the local directory or not
 */

//Begin test

casper.test.begin("Importing valid Rmarkdown file from the local directory", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var URL, NB_ID, fetchTitle;
    var fileName = 'SampleFiles/html_widgets.Rmd'; // File path directory
    var title = "HTML Widgets Showcase";//title of the notebook
    var system = require('system');
    var currentFile = require('system').args[4];
    var curFilePath = fs.absolute(currentFile);
    var curFilePath = curFilePath.replace(currentFile, '');
    fileName = curFilePath + fileName;

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

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

    casper.wait(4000);

    //create a new notebook
    functions.create_notebook(casper);

    casper.then(function () {
        URL = this.getCurrentUrl();
        NB_ID = URL.substring(41);
        console.log("New Notebook ID is :" + NB_ID);
    });

    //Importing Rmarkdown file from the system
    casper.then(function () {
        this.thenOpen(URL);
        this.wait(5000);
        casper.wait(3000).then(function () {
            //Opening advanced dropdown option
            casper.then(function () {
                functions.open_advanceddiv(casper);
                this.click("#rmdImport");
                console.log("Clicking on import Rmarkdown file option form the dropdown");
                this.wait(3000);
            });

            //Selecting desired file from the directory
            casper.then(function () {
                this.wait(5000);
                this.capture("./Images/import_Rmd_File.png");
                this.evaluate(function (fileName) {
                    __utils__.findOne('input[id="notebook-file-upload"]').setAttribute('value', fileName)
                }, {fileName: fileName});
                this.page.uploadFile('input[id="notebook-file-upload"]', fileName);
                console.log('Selecting a file');
            });

            // casper.wait(5000);
        });


        casper.then(function () {
            // this.capture("./Images/import_Rmd_File1.png");
            // this.click("#import-notebook-file-dialog > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > span:nth-child(2)");
            casper.click(x('//*[text()="Import"]'));
            console.log("Clicking on import button")
            this.wait(3000);
        });

        casper.wait(3000).then(function () {
            flag = 0;//to check if notebook has been found
            var counter = 0;//counts the number of notebooks
            do
            {
                counter = counter + 1;

            } while (this.visible("ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(" + counter + ") > div:nth-child(1) > span:nth-child(1)"));
            counter = counter + 1;
            for (v = 1; v <= counter; v++) {
                this.wait(2000);
                fetchTitle = this.fetchText("ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(" + v + ") > div:nth-child(1) > span:nth-child(1)");
                if (fetchTitle == title) {
                    flag = 1;
                    break;
                }
            }//for closes
            this.test.assertEquals(flag, 1, "Located the imported Rmarkdown notebook");
        });

        casper.then(function () {
            if (flag == 1) {
                this.test.assertEquals(flag, 1, "Import Notebook from File, Notebook with title " + title + " is PRESENT under Notebooks tree");
            }
            else {
                this.test.assertEquals(flag, 0, "Import Notebook from File, Notebook with title " + title + " is ABSENT under Notebooks tree");
            }
        });

    });

    casper.run(function () {
        test.done();
    });
});