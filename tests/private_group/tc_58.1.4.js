/*
 Author: Prateek
 Description: Check whether user can create a new group when he click on cancel
 */

//Begin Tests
casper.test.begin("Check whether user can create a new group when he click on cancel", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_name;
    var ID;// to store the generated group name

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

    //Function to generate group names 
    casper.then(function () {
        ID = this.evaluate(function () {
            return Math.random().toString(36).substr(2, 9);
        });
    });

    functions.create_notebook(casper);

    //Check for notebook info popover
    casper.then(function () {
        if (this.test.assertVisible({type: 'css', path: '.jqtree-selected > div:nth-child(1) > span:nth-child(1)'})) {
            console.log('selected notbook found');
            this.mouse.move('.jqtree-selected > div:nth-child(1) > span:nth-child(1)');
            this.waitUntilVisible(('.icon-info-sign'), function () {
                this.wait(2000);
                this.click('.icon-info-sign');
                console.log("clicking on notebook info icon");
                this.wait(3000);
            });
        } else {
            console.log("Notebook not found");
        }
    });

    casper.then(function () {
        this.click('.group-link > a:nth-child(1)', "Clicking on 'no group' link");
        this.wait(2000);
        this.click('#tab2 > a:nth-child(1)',"Clicking on Group tab to create new group");
    });
    
    casper.then(function () {
        this.wait(4000);
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Enter new group name") {
                return false;
            }
        });
        this.click('span.label:nth-child(1)');
        this.echo('Clicking on cancel button');
        this.evaluate(function () {
            $('span.btn:nth-child(3)').click();
        });
        this.wait(5000);
    });
    
    //Validating whetehr group has created or not
    casper.wait(5000).then (function () {
		this.click('li.dropdown > a:nth-child(1)');
		console.log('Clicking on Advanced drop down');
		this.evaluate(function () {
            $('#manage_groups').click();
        });
        this.waitForSelector(x(".//*[@id='group-tab']/div[1]/div[3]/span[2]"), function () {
            this.echo("Confirmed Manage groups option visible")
        })
	});
	
	casper.then(function () {
		this.test.assertSelectorDoesntHaveText('select.ng-pristine:nth-child(3)', ID, "Confirmed that group has not been created with the name:" + ID);
		this.wait(4000);
	});

    casper.wait(10000);

    casper.run(function () {
        test.done();
    });
});
		
