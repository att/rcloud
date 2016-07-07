/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that A notebook can be published by selecting the checkbox for that particular
 notebook under the "Advanced" drop-down link present on the top-right corner of the page
 */

//Begin Tests

casper.test.begin(" Select the checkbox to Publish a Notebook", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));

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

    //Get notebook title
    casper.then(function () {
        var title = functions.notebookname(casper);
        this.echo("New Notebook title : " + title);
        this.wait(3000);
    });

    //Now clicking on the advanced div
    functions.open_advanceddiv(casper);

    //clicking the checkbox to publish notebook
    casper.viewport(1024, 768).then(function () {
        var z = casper.evaluate(function () {
            $('#publish-notebook').click();

        });
    });

    casper.then(function(){
		test.assertExists("#publish_notebook");
		var id = '#publish_notebook';
		if(this.evaluate(function (publish) {return document.getElementById(publish).checked;}, id))
		{           
			this.mouse.click("#publish_notebook");
			this.echo('Notebook is published');     
		} 
		this.wait(5000);
	});


    casper.run(function () {
        test.done();
    });
});
