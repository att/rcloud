/* 
 Author: Prateek
 Description:This test describes, Check whether user/admin can add one more members to the that group or not 
*/

//Begin Tests
casper.test.begin("Adding 2 member to the group", 3, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var GP, GroupName;

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
        GroupName = this.evaluate(function () {
            return Math.random().toString(36).substr(2, 4);
        });
        console.log('New group name is :' + GroupName);
    });

    //Open manage group window
    casper.then(function () {
        this.click("li.dropdown > a:nth-child(1)");
        console.log('Opening advanced drop down menu');
        this.evaluate(function () {
            $('#manage_groups').click();
        });
        this.echo('opened manage group dialog box');
        this.wait(2000);
    });

    //Creating a group
    casper.then(function () {
       console.log("Clicking on create new group")
        this.wait(4000);
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Enter new group name") {
                return GroupName ;
            }
        });
        this.click("span.label:nth-child(1)");
        console.log("Create new group")
    });

    casper.wait(9000);

    casper.then(function (){
        casper.wait(9000);
        this.click(x(".//*[@id='group-tab']/div[3]/div/div/div[1]"));
        this.echo('Clicking memeber field');
        this.sendKeys(x(".//*[@id='group-tab']/div[3]/div/div/div[1]"), 'sanke');
        //this.echo('Added memebr');
        this.wait(4000);
        this.click(x(".//*[@id='group-tab']/div[3]/div/div/div[2]/div/div"), 'sanketd11', {keepFocus: true});
        this.echo('adding 1st member to the group');
    //    this.wait(4000);       
    });

    casper.wait(5000).then(function (){
        this.click(x(".//*[@id='group-tab']/div[3]/div/div/div[1]"));
        this.echo('Clicking memeber field');
        this.sendKeys(x(".//*[@id='group-tab']/div[3]/div/div/div[1]"), 'iPrate');
        //this.echo('Added memebr');
        this.wait(4000);
        this.click(x(".//*[@id='group-tab']/div[3]/div/div/div[2]/div/div"), 'iPrateek032', {keepFocus: true});
        this.echo('Adding another member to the same group');
    //    this.wait(4000);       
    });

    casper.wait(2000).then(function (){
        this.evaluate(function () {
            $('span.btn:nth-child(3)').click();
        });
        this.wait(1000);
        this.echo('Inserted both the member to the group');
    });

    casper.run(function () {
        test.done();
    });
});