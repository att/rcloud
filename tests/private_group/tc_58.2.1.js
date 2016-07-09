//Begin Tests
casper.test.begin("Creating a new group from Manage group option", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_name;
    var ID;// to store the generated group name
    var ID1;

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
    
    casper.then(function () {
        ID1 = this.evaluate(function () {
			return Math.random().toString(36).substr(4, 10);
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
    });

    //renaming the group
    casper.setFilter("page.prompt", function (msg, currentValue) {
        if (msg === "Rename group "+ID) {
            return ID1;
        }
        this.click("span.label:nth-child(4)");
        console.log("renamed the newly created group");
    });

    casper.wait(3000).then(function () {
        this.test.assertSelectorDoesntHaveText('select.ng-pristine:nth-child(3)', ID, "Confirmed that group has been renamed:" + ID1);
        this.wait(4000);
    });

    casper.wait(10000);

    casper.run(function () {
        test.done();
    });
});
		
