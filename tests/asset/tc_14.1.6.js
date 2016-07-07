/*
 Author: Prateek
 Description:A new asset with desired content can be created in the Asset div
 */

//Begin Test
casper.test.begin("Create a new asset directly in Assets div", 3, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var asset_name = 'NEW_ASSET.R';

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
    
    casper.then(function () {
        var url = this.getCurrentUrl();
        this.thenOpen(url);
        this.wait(3000);
    });

    casper.then(function () {
        console.log('Clicking on new asset to create an new asset');
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Choose a filename for your asset") {
                return asset_name;
            }
        });
        this.click("#new-asset>a");
        this.echo("Creating a new asset");
        this.wait(2000);
    });
    
    casper.then(function () {
		this.exists('.active>a>span');
		console.log('Newly created asset exists');
	});
	
	casper.run(function () {
        test.done();
    });
});

