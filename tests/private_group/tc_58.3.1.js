/* 
 Author: Prateek
 Description:This test describes, Check whether user/admin can add one more members to the that group or not 
*/

//Begin Tests
casper.test.begin("Adding member to the group", 3, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var GroupName;

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
        console.log('Newly created group is  ' + ID + '   and With this name we are creating new group');
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
                return ID ;
            }
        });
        this.click("span.label:nth-child(1)");
        console.log("Create new group")
    });

    casper.wait(5000);

    casper.wait(3000).then(function (){
        this.click(x(".//*[@id='group-tab']/div[3]/div/div/div[1]"));
        this.echo('Clicking memeber field');
        this.sendKeys(x(".//*[@id='group-tab']/div[3]/div/div/div[1]"), 'sanke');
        //this.echo('Added member');
        this.wait(3000);
        this.click(x(".//*[@id='group-tab']/div[3]/div/div/div[2]/div/div"), 'sanketd11', {keepFocus: true});
        this.echo('Clicking the name from the memeber suggested');
    //    this.wait(4000);       
    });

    casper.wait(4000).then(function (){
        this.evaluate(function () {
            $('span.btn:nth-child(3)').click();
        });
        this.wait(1000);
        this.echo('Successfully added member to the group');
    });

    
    casper.run(function () {
        test.done();
    });
});