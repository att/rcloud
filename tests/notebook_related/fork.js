/* 
 Author: Arko
 Description:    This is a casperjs automated test script for showing that selecting the Fork option to add the notebook
 to the local user's notebooks. The notebook contents should  now be in editable form.
 */

//Begin Tests

casper.test.begin("Fork Notebook and check if contents are editable", 16, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_id = "7f90ae7dbe9fb01898f1";//contains the notebook id to be searched
    var input_code = "a<-50+50\n a";
    var expectedresult = "100\n"

    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
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

    //opening alien user's notebook
    casper.viewport(1366, 768).thenOpen('http://127.0.0.1:8080/view.html?notebook=' + notebook_id, function () {
        this.wait(11000);
        this.echo(this.getCurrentUrl());
        functions.viewhtml(casper);
    });

    //clicking on the Edit icon and verifying if the main.html page opens
    casper.viewport(1024, 768).then(function () {
        var z = casper.evaluate(function () {
            $('#edit-notebook').click();
        });
        this.wait(8000);
    });

    casper.viewport(1024, 768).then(function () {
        this.test.assertUrlMatch(/edit.html*/, 'main.html for the notebook has been loaded');
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(5000);
    });

    //checking if notebook title is editable
    casper.viewport(1366, 768).then(function () {
        var current_name = functions.notebookname(casper);
        var z = casper.evaluate(function triggerKeyDownEvent() {
            jQuery("#notebook-title").text("S3456bg");
            var e = jQuery.Event("keydown");
            e.which = 13;
            e.keyCode = 13;
            jQuery("#notebook-title").trigger(e);
            return true;
        });
        this.wait(5000);
        var new_name = functions.notebookname(casper);
        this.test.assertNotEquals(new_name, current_name, "Notebook title is uneditable");

        //checking if command prompt is visible . This is a validation to check
        //if contents of notebook are in editable form
        this.test.assertNotVisible({type:'xpath', path:".//*[@id='command-prompt']/div[2]/div"}, 'no option to create new cell.Hence notebook in uneditable form');
    });

    //fork the notebook
    functions.fork(casper);

    //checking if command prompt is visible and whether new code can be entered. This is a validation to check 
    //if contents of notebook are in editable form
    casper.viewport(1366, 768).then(function () {
        this.test.assertVisible('#command-prompt', 'option present to enter contents. Hence notebook is editable.');
        functions.runall(casper);//this is done so that we can insert code in the newly created cell
    });
    
    functions.addnewcell(casper);
    casper.then(function(){
		this.echo("successfully created a new cell. hence confirmed that notebook content can be modified");
	});
        
    casper.run(function () {
        test.done();
    });
});

