/*
 Author: Arko
 Description:This is a casperjs automated test script,After loading/creating a notebook,
 * renaming the notebook under the Notebooks div(My Notebooks/All Notebooks) should get reflected in the Notebook title as well
 */

//Begin Tests

    casper.test.begin(" Notebook rename:", 4, function suite(test) {
    
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
            console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and RCLoud logo");
            functions.validation(casper);
            this.wait(4000);
        });
    
        //Create a new Notebook.
        functions.create_notebook(casper);
    
        // Getting the title of new Notebook
        casper.then(function () {
			this.wait(3000);
            initial_title = functions.notebookname(casper);
            this.echo("New Notebook title : " + initial_title);
            this.wait(3000);
        });
    
        casper.then(function () {
            if (this.visible('.jqtree-selected > div:nth-child(1) > span:nth-child(1)', "Notebook")) {
                //getting the notebook title and modifying it
                this.evaluate(function () {
                    $('.jqtree-selected > div:nth-child(1) > span:nth-child(1)').click();
                    this.wait(2000);
                });
    
                this.wait(10000);
                this.sendKeys('.jqtree-selected > div:nth-child(1) > span:nth-child(1)', "GOT");
                this.evaluate(function () {
                    var e = jQuery.Event("keydown");
                    e.which = 13;
                    e.keyCode = 13;
                    jQuery(".jqtree-selected > div:nth-child(1) > span:nth-child(1)").trigger(e);
                    console.log('new name');
                    return true;
                });
                this.wait(7000);
            }
            else {
                this.echo('Notebook not found');
            }
        });
    
        // Getting the title of new Notebook
        casper.then(function () {
            initial_title = functions.notebookname(casper);
            this.echo("New Notebook title : " + initial_title);
            this.wait(3000);
        });
    
        casper.viewport(1366, 768).then(function () {
            this.wait(15000);
            //this.waitForSelector({type:'css' , path:'notebook-title'});
            var newtitle = functions.notebookname(casper);
            this.echo("Modified notebook title: " + newtitle);
            this.test.assertNotEquals(newtitle, title, "the title has been changed and reflecting");
        });
        
    
        casper.run(function () {
            test.done();
        });
    });
