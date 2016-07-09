/* 
 Author: Prateek
 Description:This is a casperjs automated test script for showing that,When a notebook imported in a folder is loaded, the name present in 
 * the navbar is displayed as "<prefix>/<Notebook name>"
*/

//Begin Tests
casper.test.begin("Naming of the Imported Notebook in a folder", 8, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var Notebook_ID = 'f5742eb70ddfc7e5b4cb';
    var Title;
    var New_Title;

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
    
    //Loading a Imported notebook, which consists notebook name with prefix
    casper.then(function(){
		this.thenOpen('http://127.0.0.1:8080/edit.html?notebook='+Notebook_ID);
		this.wait(5000);
		functions.validation(casper);
	});
    
    casper.then(function(){
		Title = functions.notebookname(casper);
		this.echo("Present title of notebook: " + Title);
	});
	
	functions.fork(casper);
	
	casper.wait(2000).then(function(){
		this.wait(2000);
		var z = casper.evaluate(function triggerKeyDownEvent() {
            jQuery("#notebook-title").text("TESTING/NOTEBOOK_NAME_CHANGED");
            var e = jQuery.Event("keydown");
            e.which = 13;
            e.keyCode = 13;
            jQuery("#notebook-title").trigger(e);
            return true;
        });
        this.wait(3000);
        New_Title = functions.notebookname(casper);
        this.echo("Modified notebook title: " + New_Title);
        this.test.assertNotEquals(New_Title, Title, "the title has been successfully modified");
    });		
    
    functions.delete_notebooksIstarred(casper);

    casper.run(function () {
        test.done();
    });
});


